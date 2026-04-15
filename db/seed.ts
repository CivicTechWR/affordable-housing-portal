import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { customListingFields } from "./schema.ts";
import { customListingFieldSeed } from "./seeds/custom-listing-fields.ts";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it before running the seed.");
  }

  return databaseUrl;
}

async function main() {
  const sql = postgres(getDatabaseUrl(), {
    prepare: false,
  });

  const db = drizzle(sql);

  try {
    for (const field of customListingFieldSeed) {
      await db
        .insert(customListingFields)
        .values(field)
        .onConflictDoUpdate({
          target: customListingFields.key,
          set: {
            label: field.label,
            description: field.description,
            fieldType: field.fieldType,
            category: field.category,
            helpText: field.helpText,
            placeholder: field.placeholder,
            isPublic: field.isPublic,
            isFilterable: field.isFilterable,
            isRequired: field.isRequired,
            sortOrder: field.sortOrder,
            options: field.options,
            updatedAt: new Date(),
          },
        });
    }

    console.log(`Seeded ${customListingFieldSeed.length} custom listing fields.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

void main().catch((error: unknown) => {
  console.error("Failed to seed custom listing fields.", error);
  process.exitCode = 1;
});
