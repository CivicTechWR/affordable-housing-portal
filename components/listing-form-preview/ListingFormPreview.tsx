import type { ListingFormInput } from "@/app/listingForm/types";
import { ListingDetails } from "@/components/listing-details/ListingDetails";
import { ListingsCard } from "@/components/listings-card/listingsCard";
import { Button } from "@/components/ui/button";
import { buildAddress } from "@/lib/address";

export type ListingFormPreviewMode = "card" | "details";

export interface ListingFormPreviewProps {
  mode: ListingFormPreviewMode;
  formData: ListingFormInput;
  listingId?: string;
  onOpenDetails: () => void;
  onBackToCard: () => void;
}

export function ListingFormPreview({
  mode,
  formData,
  listingId,
  onOpenDetails,
  onBackToCard,
}: ListingFormPreviewProps) {
  const previewTitleValue = formData.title?.trim();
  const previewStreet1Value = formData.street1?.trim();
  const previewStreet2Value = formData.street2?.trim();
  const previewCityValue = formData.city?.trim();
  const previewUnitNumberValue = formData.unitNumber?.trim();
  const previewTitle = previewTitleValue || "Title Here";
  const previewStreet1 = previewStreet1Value || "Address Here";
  const previewCardAddress = buildAddress({
    unitNumber: previewUnitNumberValue,
    street1: previewStreet1,
    street2: previewStreet2Value,
  });
  const previewCardFeatures = Array.from(
    new Set((formData.customFeatures ?? []).map((feature) => feature.name)),
  );
  const previewAvailability = formData.availableOn || "Now";
  const previewPrice = Math.round((formData.monthlyRentCents ?? 0) / 100);

  const previewFeaturesByCategory = Object.values(
    (formData.customFeatures ?? []).reduce<
      Record<string, { categoryName: string; features: { name: string; description: string }[] }>
    >((acc, feature) => {
      const category = feature.category;
      let categoryGroup = acc[category];

      if (!categoryGroup) {
        categoryGroup = { categoryName: category, features: [] };
        acc[category] = categoryGroup;
      }

      categoryGroup.features.push({
        name: feature.name,
        description: feature.description,
      });

      return acc;
    }, {}),
  );

  if (mode === "details") {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onBackToCard}>
            Back to Card Preview
          </Button>
        </div>
        <ListingDetails
          embedded
          title={previewTitle}
          price={previewPrice}
          unitNumber={previewUnitNumberValue}
          street1={previewStreet1}
          street2={previewStreet2Value}
          city={previewCityValue || ""}
          beds={formData.bedrooms}
          baths={formData.bathrooms}
          sqft={formData.squareFeet || 0}
          images={formData.images ?? []}
          timeAgo={previewAvailability}
          features={previewFeaturesByCategory}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 lg:items-stretch">
      <ListingsCard
        id={listingId ?? "preview"}
        title={previewTitleValue}
        accessibilityFeatures={previewCardFeatures}
        price={previewPrice}
        address={previewCardAddress}
        city={previewCityValue || ""}
        beds={formData.bedrooms}
        baths={formData.bathrooms}
        sqft={formData.squareFeet || 0}
        timeAgo={previewAvailability}
        imageUrl={formData.images?.[0]?.url}
        variant="vertical"
        onClick={onOpenDetails}
      />
      <p className="text-xs text-muted-foreground px-1">
        Click the listing card to preview full listing details.
      </p>
    </div>
  );
}
