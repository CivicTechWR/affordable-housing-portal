import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  listingFormSchema,
  ListingFormContext,
  ListingFormData,
  ListingFormInput,
  INITIAL_FORM_DATA,
} from "./types";
import { useListingQuery } from "./useListingQuery";

export function useListingForm(listingId?: string) {
  const { data: initialData, isLoading, isError } = useListingQuery(listingId);

  const form = useForm<ListingFormInput, ListingFormContext, ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: INITIAL_FORM_DATA,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset(INITIAL_FORM_DATA);
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
