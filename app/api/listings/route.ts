import { desc, eq, inArray, or } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { listingImages, listings, profiles } from "@/db/schema";
import { checkPublicText } from "@/lib/content-safety";

export const dynamic = "force-dynamic";

const allowedCategories = new Set(["Books", "Toys", "Sensory", "Bikes & outdoors", "Clothing", "Communication", "Learning", "Home & sleep", "Other"]);
const allowedConditions = new Set(["New", "Excellent", "Good", "Fair", "Pass it on"]);
const allowedExchangeTypes = new Set(["sell", "giveaway", "swap"]);
const allowedDelivery = new Set(["post", "collection", "either"]);
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function textValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes("D1 binding")) {
    return "The private-beta database is being prepared. Please try again shortly.";
  }
  return "AFE could not save that listing. Your details have not been published.";
}

export async function GET() {
  try {
    const user = await getChatGPTUser();
    const db = getDb();
    const visibility = user
      ? or(eq(listings.moderationStatus, "approved"), eq(listings.ownerUserId, user.userId))
      : eq(listings.moderationStatus, "approved");
    const rows = await db.select().from(listings).where(visibility).orderBy(desc(listings.createdAt)).limit(40);
    const ids = rows.map((row) => row.id);
    const images = ids.length
      ? await db.select().from(listingImages).where(inArray(listingImages.listingId, ids))
      : [];
    const firstImage = new Map<number, number>();
    for (const image of images.sort((a, b) => a.sortOrder - b.sortOrder)) {
      if (!firstImage.has(image.listingId)) firstImage.set(image.listingId, image.id);
    }
    return Response.json({
      listings: rows.map((row) => ({
        ...row,
        imageUrl: firstImage.has(row.id) ? `/api/listings/${row.id}/images/${firstImage.get(row.id)}` : null,
        isOwner: user?.userId === row.ownerUserId,
      })),
    });
  } catch (error) {
    return Response.json({ error: apiError(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in before creating a listing." }, { status: 401 });

  try {
    const db = getDb();
    const [member] = await db.select({ registrationComplete: profiles.registrationComplete, displayName: profiles.displayName }).from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    if (member?.registrationComplete !== 1) {
      return Response.json({ error: "Create your secure AFE account before listing an item." }, { status: 403 });
    }
    const form = await request.formData();
    const title = textValue(form, "title");
    const description = textValue(form, "description");
    const category = textValue(form, "category");
    const condition = textValue(form, "condition");
    const exchangeType = textValue(form, "exchangeType");
    const deliveryMethod = textValue(form, "deliveryMethod");
    const area = textValue(form, "area");
    const price = textValue(form, "price");
    const postage = textValue(form, "postage");
    const ageConfirmed = textValue(form, "ageConfirmed") === "true";

    if (!ageConfirmed) return Response.json({ error: "You must confirm that you are 18 or over." }, { status: 400 });
    if (title.length < 5 || title.length > 80) return Response.json({ error: "Use a title between 5 and 80 characters." }, { status: 400 });
    if (description.length < 20 || description.length > 1200) return Response.json({ error: "Describe the item using 20 to 1,200 characters." }, { status: 400 });
    if (area.length < 2 || area.length > 60) return Response.json({ error: "Enter only your town or general area—not your address." }, { status: 400 });
    if (!allowedCategories.has(category) || !allowedConditions.has(condition) || !allowedExchangeTypes.has(exchangeType) || !allowedDelivery.has(deliveryMethod)) {
      return Response.json({ error: "Please check the listing choices and try again." }, { status: 400 });
    }

    const languageIssue = checkPublicText([member.displayName, title, description, area]);
    if (languageIssue) return Response.json({ error: languageIssue }, { status: 400 });

    const numericPrice = exchangeType === "sell" ? Number(price) : 0;
    if (exchangeType === "sell" && (!Number.isFinite(numericPrice) || numericPrice < 0.5 || numericPrice > 10000)) {
      return Response.json({ error: "Enter a selling price from £0.50 to £10,000." }, { status: 400 });
    }
    const numericPostage = deliveryMethod === "collection" ? 0 : Number(postage || "0");
    if (!Number.isFinite(numericPostage) || numericPostage < 0 || numericPostage > 100) {
      return Response.json({ error: "Enter a postage charge from £0 to £100." }, { status: 400 });
    }
    if (exchangeType === "swap" && deliveryMethod !== "collection") {
      return Response.json({ error: "Swaps are collection only during the private beta." }, { status: 400 });
    }

    const files = form.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > 4) return Response.json({ error: "Upload no more than four photographs." }, { status: 400 });
    for (const file of files) {
      if (!allowedImageTypes.has(file.type) || file.size > 2 * 1024 * 1024) {
        return Response.json({ error: "Each stored photograph must be JPG, PNG or WebP and no larger than 2 MB." }, { status: 400 });
      }
    }

    const [listing] = await db.insert(listings).values({
      ownerUserId: user.userId,
      sellerDisplayName: member.displayName,
      title,
      description,
      category,
      condition,
      exchangeType,
      pricePence: exchangeType === "sell" ? Math.round(numericPrice * 100) : null,
      postagePence: deliveryMethod === "collection" ? null : Math.round(numericPostage * 100),
      deliveryMethod,
      area,
      moderationStatus: "pending",
    }).returning();

    const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
    if (files.length && !bucket) throw new Error("R2 binding unavailable");
    for (const [sortOrder, file] of files.entries()) {
      const objectKey = `listings/${listing.id}/${crypto.randomUUID()}`;
      await bucket!.put(objectKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
      await db.insert(listingImages).values({ listingId: listing.id, objectKey, contentType: file.type, sortOrder });
    }

    return Response.json({ listing: { ...listing, isOwner: true }, message: "Listing received and held for a safety review." }, { status: 201 });
  } catch (error) {
    return Response.json({ error: apiError(error) }, { status: 500 });
  }
}
