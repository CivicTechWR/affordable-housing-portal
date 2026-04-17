"use client";

import { useListingForm } from "./useListingForm";
import { ListingFormFields } from "@/components/listing-form-fields/ListingFormFields";
import { ListingFormFeatures } from "@/components/listing-form-features/ListingFormFeatures";
import { ListingPreview } from "@/components/listing-preview/ListingPreview";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ListingFormData } from "./types";
import { ListingFormLayout } from "@/components/listing-form-layout/ListingFormLayout";
import { ListingFormSkeleton } from "@/components/listing-form-skeleton/ListingFormSkeleton";

export interface ListingFormProps {
  listingId?: string;
}

export default function ListingForm({ listingId }: ListingFormProps) {
  const isEditMode = !!listingId;
  const { form, onSubmit, isLoading, isError } = useListingForm(listingId);

  const liveFormData = form.watch();

  if (isLoading) {
    return <ListingFormSkeleton />;
  }

  if (isError) {
    return (
      <ListingFormLayout
        header={<div />}
        formContent={
          <div className="bg-destructive/15 text-destructive p-8 rounded-lg border border-destructive/20">
            <h3 className="font-semibold text-lg mb-2">Error Loading Listing</h3>
            <p>
              We encountered an error while retrieving this listing. It may have been deleted or
              there is a network issue.
            </p>
          </div>
        }
      />
    );
  }

  return (
    <ListingFormLayout
      header={
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
      }
      formContent={
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ListingFormFields control={form.control} />
            <ListingFormFeatures control={form.control} />
          </form>
        </Form>
      }
      previewContent={<ListingPreview formData={liveFormData as ListingFormData} />}
      footer={
        <>
          <Button variant="outline" type="button" size="lg">
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {isEditMode ? "Save Changes" : "Create Listing"}
          </Button>
        </>
      }
    />
  );
}
