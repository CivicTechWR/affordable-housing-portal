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
import { useCreateListingQuery } from "./useCreateListingQuery";
import { useEditListingQuery } from "./useEditListingQuery";
import { useGetListingQuery } from "./useGetListingQuery";

export function useListingForm(listingId?: string) {
  const { data: initialData, isLoading, isError } = useGetListingQuery(listingId);
  const { createListing } = useCreateListingQuery();
  const { editListing } = useEditListingQuery();

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

  const onSubmit = async (data: ListingFormData) => {
    if (listingId) {
      await editListing({ listingId, data });
      alert("Listing Updated! (Mock)");
      return;
    }

    await createListing(data);
    alert("Listing Created! (Mock)");
  };

  return {
    form,
    onSubmit,
    isLoading,
    isError,
  };
}
