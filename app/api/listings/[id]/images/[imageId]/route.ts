import { and, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { listingImages, listings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string; imageId: string }> }) {
  const { id, imageId } = await context.params;
  const listingId = Number(id);
  const requestedImageId = Number(imageId);
  if (!Number.isInteger(listingId) || !Number.isInteger(requestedImageId)) return new Response("Not found", { status: 404 });

  const user = await getChatGPTUser();
  const db = getDb();
  const [row] = await db.select({
    objectKey: listingImages.objectKey,
    contentType: listingImages.contentType,
    ownerUserId: listings.ownerUserId,
    moderationStatus: listings.moderationStatus,
  }).from(listingImages).innerJoin(listings, eq(listingImages.listingId, listings.id)).where(and(eq(listingImages.id, requestedImageId), eq(listings.id, listingId))).limit(1);

  if (!row || (row.moderationStatus !== "approved" && row.ownerUserId !== user?.userId)) return new Response("Not found", { status: 404 });
  const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  const object = await bucket?.get(row.objectKey);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": row.contentType, "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" } });
}
