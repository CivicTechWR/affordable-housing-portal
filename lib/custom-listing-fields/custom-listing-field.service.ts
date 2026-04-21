import "server-only";

import { and, eq, type SQL } from "drizzle-orm";

import { customListingFields } from "@/db/schema";
import { findCustomListingFields } from "@/lib/custom-listing-fields/custom-listing-field.repository";
import type {
  CustomListingFieldDefinition,
  CustomListingFieldListResponse,
  CustomListingFieldQuery,
  CustomListingFieldType,
} from "@/shared/schemas/custom-listing-fields";

function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatCategoryLabel(category: string) {
  return category
    .split(/\s*&\s*/)
    .map((part) =>
      part
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" & ");
}

export async function getCustomListingFieldsService(
  query: CustomListingFieldQuery,
): Promise<CustomListingFieldListResponse> {
  const conditions: SQL<unknown>[] = [eq(customListingFields.isPublic, true)];

  if (query.filterableOnly === "true") {
    conditions.push(eq(customListingFields.isFilterable, true));
  }

  if (query.category) {
    conditions.push(eq(customListingFields.category, query.category));
  }

  if (query.type) {
    conditions.push(eq(customListingFields.fieldType, query.type));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await findCustomListingFields({ where });

  const groups = new Map<
    string,
    {
      groupId: string;
      groupLabel: string;
      options: CustomListingFieldDefinition[];
    }
  >();

  for (const row of rows) {
    const groupId = slugifyCategory(row.category);

    if (query.groupId && query.groupId !== groupId) {
      continue;
    }

    const groupLabel = formatCategoryLabel(row.category);

    if (!groups.has(groupId)) {
      groups.set(groupId, {
        groupId,
        groupLabel,
        options: [],
      });
    }

    const group = groups.get(groupId);
    if (group) {
      group.options.push({
        id: row.key,
        label: row.label,
        type: row.fieldType as CustomListingFieldType,
        description: row.description ?? undefined,
        helpText: row.helpText ?? undefined,
        placeholder: row.placeholder ?? undefined,
        selectableOptions: row.options ?? undefined,
      });
    }
  }

  return {
    data: Array.from(groups.values()),
  };
}
