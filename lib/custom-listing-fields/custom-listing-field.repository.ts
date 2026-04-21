import "server-only";

import { asc, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { customListingFields } from "@/db/schema";

export async function findCustomListingFields(input: { where?: SQL<unknown> }) {
  return db
    .select({
      key: customListingFields.key,
      label: customListingFields.label,
      description: customListingFields.description,
      fieldType: customListingFields.fieldType,
      category: customListingFields.category,
      helpText: customListingFields.helpText,
      placeholder: customListingFields.placeholder,
      options: customListingFields.options,
      sortOrder: customListingFields.sortOrder,
    })
    .from(customListingFields)
    .where(input.where)
    .orderBy(asc(customListingFields.sortOrder), asc(customListingFields.key));
}
