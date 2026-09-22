import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  firstName: text("first_name"),
  surname: text("surname"),
  dateOfBirth: text("date_of_birth"),
  phone: text("phone"),
  registrationComplete: integer("registration_complete").notNull().default(0),
  safetyAcceptedAt: text("safety_accepted_at"),
  area: text("area").notNull().default(""),
  ageConfirmed: integer("age_confirmed").notNull().default(0),
  accountStatus: text("account_status").notNull().default("active"),
  role: text("role").notNull().default("member"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_profiles_display_name_ci").on(sql`lower(${table.displayName})`),
]);

export const listings = sqliteTable(
  "listings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerUserId: text("owner_user_id").notNull().references(() => profiles.userId),
    sellerDisplayName: text("seller_display_name").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    condition: text("condition").notNull(),
    exchangeType: text("exchange_type").notNull(),
    pricePence: integer("price_pence"),
    postagePence: integer("postage_pence"),
    deliveryMethod: text("delivery_method").notNull(),
    area: text("area").notNull(),
    moderationStatus: text("moderation_status").notNull().default("pending"),
    listingStatus: text("listing_status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_listings_owner_user_id").on(table.ownerUserId),
    index("idx_listings_moderation_created").on(table.moderationStatus, table.createdAt),
  ],
);

export const listingImages = sqliteTable(
  "listing_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    listingId: integer("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    objectKey: text("object_key").notNull(),
    contentType: text("content_type").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_listing_images_listing_id").on(table.listingId)],
);

export const supportMessages = sqliteTable(
  "support_messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => profiles.userId),
    category: text("category").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_support_messages_user_id").on(table.userId),
    index("idx_support_messages_status_created").on(table.status, table.createdAt),
  ],
);
