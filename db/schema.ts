import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "partner", "user"]);
export const userStatusEnum = pgEnum("user_status", [
  "invited",
  "active",
  "suspended",
  "deactivated",
]);
export const listingStatusEnum = pgEnum("listing_status", ["draft", "published", "archived"]);
export const customListingFieldTypeEnum = pgEnum("listing_field_type", [
  "boolean",
  "number",
  "text",
  "select",
  "multi_select",
  "date",
]);

export type SavedSearchFilters = {
  bathrooms?: number | null;
  bedrooms?: number | null;
  features?: string[] | null;
  location?: string | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  moveInDate?: string | null;
  sort?: "newest" | "price_asc" | "price_desc" | null;
  /** Allow additional keys for admin-configured custom listing fields. */
  [key: string]: unknown;
};

export type CustomListingFieldOption = {
  label: string;
  value: string;
};

export type CustomListingFieldValue = boolean | number | string | string[] | null;
export type ListingCustomFields = Record<string, CustomListingFieldValue>;

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalAuthId: text("external_auth_id"),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    role: userRoleEnum("role").notNull(),
    status: userStatusEnum("status").notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("users_external_auth_id_unique").on(table.externalAuthId),
    uniqueIndex("users_email_unique").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_status_idx").on(table.status),
  ],
);

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    street1: text("street_1").notNull(),
    street2: text("street_2"),
    city: text("city").notNull(),
    province: text("province").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull(),
    neighborhood: text("neighborhood"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedByUserId: uuid("updated_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("properties_owner_user_id_idx").on(table.ownerUserId),
    index("properties_city_idx").on(table.city),
  ],
);

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "restrict" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedByUserId: uuid("updated_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    status: listingStatusEnum("status").notNull(),
    unitNumber: text("unit_number"),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: doublePrecision("bathrooms").notNull(),
    squareFeet: integer("square_feet"),
    monthlyRentCents: integer("monthly_rent_cents").notNull(),
    availableOn: date("available_on"),
    maxIncomeCents: integer("max_income_cents"),
    applicationUrl: text("application_url"),
    applicationEmail: text("application_email"),
    applicationPhone: text("application_phone"),
    applicationInstructions: text("application_instructions"),
    customFields: jsonb("custom_fields")
      .$type<ListingCustomFields>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("listings_property_id_idx").on(table.propertyId),
    index("listings_status_published_at_idx").on(table.status, table.publishedAt),
    index("listings_monthly_rent_cents_idx").on(table.monthlyRentCents),
    index("listings_bedrooms_bathrooms_idx").on(table.bedrooms, table.bathrooms),
    index("listings_available_on_idx").on(table.availableOn),
    index("listings_custom_fields_gin_idx").using("gin", table.customFields),
  ],
);

export const listingImages = pgTable(
  "listing_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("listing_images_listing_id_idx").on(table.listingId)],
);

export const savedListings = pgTable(
  "saved_listings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.listingId], name: "saved_listings_pk" }),
    index("saved_listings_user_id_idx").on(table.userId),
    index("saved_listings_listing_id_idx").on(table.listingId),
  ],
);

export const savedSearches = pgTable(
  "saved_searches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    filters: jsonb("filters").$type<SavedSearchFilters>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("saved_searches_user_id_idx").on(table.userId)],
);

export const customListingFields = pgTable(
  "listing_field_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    fieldType: customListingFieldTypeEnum("field_type").notNull(),
    category: text("category").notNull(),
    helpText: text("help_text"),
    placeholder: text("placeholder"),
    isPublic: boolean("is_public").notNull(),
    isFilterable: boolean("is_filterable").notNull(),
    isRequired: boolean("is_required").notNull(),
    sortOrder: integer("sort_order").notNull(),
    options: jsonb("options").$type<CustomListingFieldOption[]>(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedByUserId: uuid("updated_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("listing_field_definitions_key_unique").on(table.key),
    index("listing_field_definitions_category_idx").on(table.category),
    index("listing_field_definitions_sort_order_idx").on(table.sortOrder),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingImage = typeof listingImages.$inferSelect;
export type NewListingImage = typeof listingImages.$inferInsert;
export type SavedListing = typeof savedListings.$inferSelect;
export type NewSavedListing = typeof savedListings.$inferInsert;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;
export type CustomListingField = typeof customListingFields.$inferSelect;
export type NewCustomListingField = typeof customListingFields.$inferInsert;
