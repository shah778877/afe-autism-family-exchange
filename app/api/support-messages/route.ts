import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { profiles, supportMessages } from "@/db/schema";
import { checkPublicText } from "@/lib/content-safety";

export const dynamic = "force-dynamic";

const categories = new Set(["General comment", "Complaint", "Safety concern", "Account help", "Other"]);

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in before messaging AFE Admin." }, { status: 401 });

  const [member] = await getDb().select({ complete: profiles.registrationComplete, status: profiles.accountStatus }).from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
  if (member?.complete !== 1 || member.status !== "active") return Response.json({ error: "An active AFE account is required." }, { status: 403 });

  const body = await request.json() as Record<string, unknown>;
  const category = clean(body.category);
  const subject = clean(body.subject);
  const message = clean(body.message);
  if (!categories.has(category)) return Response.json({ error: "Choose a valid message type." }, { status: 400 });
  if (subject.length < 3 || subject.length > 100) return Response.json({ error: "Use a subject between 3 and 100 characters." }, { status: 400 });
  if (message.length < 10 || message.length > 2000) return Response.json({ error: "Use a message between 10 and 2,000 characters." }, { status: 400 });
  const issue = checkPublicText([subject, message]);
  if (issue?.includes("harmful")) return Response.json({ error: "Please remove abusive, threatening or degrading wording." }, { status: 400 });

  const [saved] = await getDb().insert(supportMessages).values({ userId: user.userId, category, subject, message }).returning({ id: supportMessages.id });
  return Response.json({ id: saved.id, message: "Your message has been sent privately to AFE Admin." }, { status: 201 });
}
