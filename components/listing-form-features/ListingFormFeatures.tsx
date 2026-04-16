import { ListingFormData } from "@/app/listingForm/types";
import { useAccessibilityFeaturesQuery } from "@/app/listingForm/useAccessibilityFeaturesQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleField } from "@/components/toggle-field/ToggleField";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Control } from "react-hook-form";

export interface ListingFormFeaturesProps {
  control: Control<ListingFormData>;
}

export function ListingFormFeatures({ control }: ListingFormFeaturesProps) {
  const { data: featureGroups, isLoading, isError } = useAccessibilityFeaturesQuery();

  if (isLoading) {
    return (
      <div className="pt-6 border-t mt-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className="space-y-6 pt-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-5 w-5 rounded shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !featureGroups) {
    return (
      <div className="pt-6 border-t mt-8 text-destructive">
        <p>Failed to load accessibility features. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="pt-6 border-t mt-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Accessibility Features</h3>
        <p className="text-sm text-muted-foreground">
          Select all accessibility features that apply to this listing. These details help housing
          searchers find spaces that meet their distinct accessibility needs.
        </p>
      </div>

      <div className="space-y-10">
        {featureGroups.map((group) => (
          <div key={group.groupId} className="space-y-4">
            <div>
              <h4 className="text-lg font-medium">{group.groupLabel}</h4>
              <hr className="mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-2">
              {group.options.map((option) => (
                <FormField
                  key={option.id}
                  control={control}
                  name="accessibilityFeatures"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <ToggleField
                            title={option.label}
                            description={option.description}
                            options={[
                              { label: "Yes", value: "yes" },
                              { label: "No", value: "no" },
                            ]}
                            value={field.value?.includes(option.id) ? "yes" : "no"}
                            onValueChange={(val) => {
                              if (val === "yes") {
                                if (!field.value?.includes(option.id)) {
                                  field.onChange([...(field.value || []), option.id]);
                                }
                              } else if (val === "no") {
                                field.onChange(
                                  field.value?.filter((value: string) => value !== option.id),
                                );
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
