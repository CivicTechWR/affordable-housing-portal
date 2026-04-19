import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  listingFormSchema,
  ListingFormContext,
  ListingFormData,
  ListingFormInput,
  CREATE_FORM_DEFAULTS,
} from "./types";
import { useListingQuery } from "./useListingQuery";

export function useListingForm(listingId?: string) {
  const { data: initialData, isLoading, isError } = useListingQuery(listingId);

  const form = useForm<ListingFormInput, ListingFormContext, ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: CREATE_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset(CREATE_FORM_DEFAULTS);
    }
  }, [initialData, form]);

  const onSubmit = (data: ListingFormData) => {
    console.log(listingId ? `Updating ID ${listingId}:` : "Creating:", data);
    alert(listingId ? "Listing Updated! (Mock)" : "Listing Created! (Mock)");
  };

  return {
    form,
    onSubmit,
    isLoading,
    isError,
  };
}
