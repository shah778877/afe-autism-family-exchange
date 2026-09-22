import { and, eq, ne, sql } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { checkPublicText } from "@/lib/content-safety";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isAdult(dateValue: string) {
  const birth = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 18 && age <= 120;
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in to view your AFE account." }, { status: 401 });
  const [profile] = await getDb().select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
  return Response.json({
    profile: profile ? {
      username: profile.displayName,
      firstName: profile.firstName ?? "",
      surname: profile.surname ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      phone: profile.phone ?? "",
      email: user.email,
      registrationComplete: profile.registrationComplete === 1,
      isAdmin: profile.role === "admin",
    } : { email: user.email, registrationComplete: false },
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in before creating an AFE account." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const username = clean(body.username);
  const firstName = clean(body.firstName);
  const surname = clean(body.surname);
  const dateOfBirth = clean(body.dateOfBirth);
  const phone = clean(body.phone).replace(/\s+/g, " ");
  const ageConfirmed = body.ageConfirmed === true;
  const medicalConfirmed = body.medicalConfirmed === true;

  if (!/^[\p{L}\p{N}][\p{L}\p{N} _-]{1,39}$/u.test(username)) return Response.json({ error: "Choose a username using 2 to 40 letters, numbers, spaces, hyphens or underscores." }, { status: 400 });
  if (firstName.length < 1 || firstName.length > 60 || surname.length < 1 || surname.length > 60) return Response.json({ error: "Enter your first name and surname." }, { status: 400 });
  if (!isAdult(dateOfBirth) || !ageConfirmed) return Response.json({ error: "AFE accounts are only for adults aged 18 or over." }, { status: 400 });
  if (!/^\+?[0-9 ()-]{7,20}$/.test(phone)) return Response.json({ error: "Enter a valid telephone number." }, { status: 400 });
  if (!medicalConfirmed) return Response.json({ error: "Please confirm that AFE is not a medical service." }, { status: 400 });

  const publicIssue = checkPublicText([username]);
  if (publicIssue) return Response.json({ error: publicIssue }, { status: 400 });
  const privateIssue = checkPublicText([firstName, surname]);
  if (privateIssue?.includes("harmful")) return Response.json({ error: "Please check the name fields and remove harmful wording." }, { status: 400 });

  const now = new Date().toISOString();
  const db = getDb();
  const [duplicate] = await db.select({ userId: profiles.userId }).from(profiles).where(and(
    sql`lower(${profiles.displayName}) = lower(${username})`,
    ne(profiles.userId, user.userId),
  )).limit(1);
  if (duplicate) return Response.json({ error: "That username is already taken. Please choose another." }, { status: 409 });
  await db.insert(profiles).values({
    userId: user.userId,
    email: user.email,
    displayName: username,
    firstName,
    surname,
    dateOfBirth,
    phone,
    registrationComplete: 1,
    safetyAcceptedAt: now,
    ageConfirmed: 1,
  }).onConflictDoUpdate({
    target: profiles.userId,
    set: { email: user.email, displayName: username, firstName, surname, dateOfBirth, phone, registrationComplete: 1, safetyAcceptedAt: now, ageConfirmed: 1, updatedAt: now },
  });

  return Response.json({ profile: { username, firstName, surname, dateOfBirth, phone, email: user.email, registrationComplete: true } });
}
