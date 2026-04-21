export function formatCustomListingFieldCategoryLabel(category: string) {
  return category
    .split(/\s*&\s*/)
    .map((part) =>
      part
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" & ");
}

export function compareCustomListingFieldCategories(leftCategory: string, rightCategory: string) {
  return formatCustomListingFieldCategoryLabel(leftCategory).localeCompare(
    formatCustomListingFieldCategoryLabel(rightCategory),
  );
}

export function sortCustomListingFieldsForDisplay<
  T extends { category: string; sortOrder: number; key: string },
>(fields: T[]) {
  return [...fields].sort((left, right) => {
    const byCategory = compareCustomListingFieldCategories(left.category, right.category);
    if (byCategory !== 0) {
      return byCategory;
    }

    const bySortOrder = left.sortOrder - right.sortOrder;
    if (bySortOrder !== 0) {
      return bySortOrder;
    }

    return left.key.localeCompare(right.key);
  });
}
