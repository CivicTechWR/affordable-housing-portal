"use client";

import { useListingForm } from "./useListingForm";
import { ListingFormFields } from "@/components/listing-form-fields/ListingFormFields";
import { ListingFormFeatures } from "@/components/listing-form-features/ListingFormFeatures";
import { ListingPreview } from "@/components/listing-preview/ListingPreview";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ListingFormData } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

export interface ListingFormProps {
  listingId?: string;
}

export default function ListingForm({ listingId }: ListingFormProps) {
  const isEditMode = !!listingId;
  const { form, onSubmit, isLoading, isError } = useListingForm(listingId);

  // Watch entire form for live preview changes
  const liveFormData = form.watch();

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8">
          <Skeleton className="h-[800px] w-full rounded-xl bg-muted/60" />
          <Skeleton className="h-[600px] w-full rounded-xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
        <div className="bg-destructive/15 text-destructive p-8 rounded-lg border border-destructive/20">
          <h3 className="font-semibold text-lg mb-2">Error Loading Listing</h3>
          <p>
            We encountered an error while retrieving this listing. It may have been deleted or there
            is a network issue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditMode ? "Edit Listing" : "Create Listing"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isEditMode
              ? "Update the details for this existing property listing."
              : "Fill out the details below to add a new property listing."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8">
        {/* Main Form */}
        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8 order-2 lg:order-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ListingFormFields control={form.control} />

              <ListingFormFeatures control={form.control} />

              <div className="flex justify-end gap-4 pt-8 mt-10 border-t">
                <Button variant="outline" type="button" size="lg">
                  Cancel
                </Button>
                <Button type="submit" size="lg">
                  {isEditMode ? "Save Changes" : "Create Listing"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Live Preview Pane */}
        <div className="order-1 lg:order-2">
          <ListingPreview formData={liveFormData as ListingFormData} />
        </div>
      </div>
    </div>
  );
}
