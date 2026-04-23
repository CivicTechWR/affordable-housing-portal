import type { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import { getCustomListingFieldsService } from "@/lib/custom-listing-fields/custom-listing-field.service";

export interface ListingsDashboardData {
  dynamicGroups: DynamicFilterGroup[];
}

export async function getListingsDashboardData(): Promise<ListingsDashboardData> {
  const fieldsResponse = await getCustomListingFieldsService({
    publicOnly: "true",
    filterableOnly: "true",
    type: "boolean",
  });

  const dynamicGroups: DynamicFilterGroup[] = fieldsResponse.data.map((group) => ({
    groupId: group.groupId,
    groupLabel: group.groupLabel,
    options: group.options.map((option) => ({
      id: option.id,
      label: option.label,
      type: "boolean" as const,
    })),
  }));

  return {
    dynamicGroups,
  };
}
