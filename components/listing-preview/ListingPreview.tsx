import { ListingFormData } from "@/app/listingForm/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface ListingPreviewProps {
  formData: ListingFormData;
}

export function ListingPreview({ formData }: ListingPreviewProps) {
  // Safe formatting helpers
  const formatPrice = (cents?: number) => {
    if (!cents && cents !== 0) return "-";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      cents / 100,
    );
  };

  const addressString =
    [formData.street1, formData.city, formData.province].filter(Boolean).join(", ") ||
    "No address provided";

  return (
    <div className="sticky top-6">
      <Card className="overflow-hidden shadow-lg border-2">
        {/* Placeholder for Image (Using a gradient as empty state) */}
        <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm border shadow-sm text-foreground"
            >
              {formData.status === "published"
                ? "Published"
                : formData.status === "draft"
                  ? "Draft"
                  : "Archived"}
            </Badge>
          </div>
          <span className="text-muted-foreground flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Image Preview</span>
          </span>
        </div>

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">
                {formatPrice(formData.monthlyRentCents)}
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </h3>
              <h4 className="text-lg font-medium leading-none line-clamp-1">
                {formData.title || "Untitled Listing"}
              </h4>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <span className="mr-1 h-3.5 w-3.5 shrink-0 inline-block font-bold">📍</span>
            <span className="truncate">{addressString}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="flex items-center justify-between text-sm py-3 px-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">
                {formData.bedrooms !== undefined ? formData.bedrooms : "-"}{" "}
                <span className="text-muted-foreground font-normal">Beds</span>
              </span>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">
                {formData.bathrooms !== undefined ? formData.bathrooms : "-"}{" "}
                <span className="text-muted-foreground font-normal">Baths</span>
              </span>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">
                {formData.squareFeet || "-"}{" "}
                <span className="text-muted-foreground font-normal">Sqft</span>
              </span>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h5 className="font-medium mb-1">Description</h5>
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                {formData.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-muted-foreground block mb-1">Property Type</span>
                <span className="font-medium">{formData.propertyType || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Lease Term</span>
                <span className="font-medium">{formData.leaseTerm || "N/A"}</span>
              </div>
            </div>

            {/* Accessibility badges limit preview */}
            {formData.accessibilityFeatures.length > 0 && (
              <div className="pt-2">
                <h5 className="font-medium mb-2">
                  Accessibility Features ({formData.accessibilityFeatures.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {formData.accessibilityFeatures.slice(0, 5).map((f) => (
                    <Badge
                      variant="secondary"
                      key={f}
                      className="font-normal border-transparent bg-secondary/60"
                    >
                      {f}
                    </Badge>
                  ))}
                  {formData.accessibilityFeatures.length > 5 && (
                    <Badge variant="outline" className="text-muted-foreground">
                      +{formData.accessibilityFeatures.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
