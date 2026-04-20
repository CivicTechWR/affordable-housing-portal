import { useEffect, useState } from "react";
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
  const {
    data: initialData,
    isLoading: isFetching,
    isError: isFetchError,
  } = useGetListingQuery(listingId);
  const { createListing, isLoading: isCreating } = useCreateListingQuery();
  const { editListing, isLoading: isEditing } = useEditListingQuery();
  const [submitFeedback, setSubmitFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

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
    setSubmitFeedback(null);

    try {
      if (listingId) {
        await editListing({ listingId, data });
        setSubmitFeedback({
          status: "success",
          message: "Listing updated successfully. (Mock)",
        });
        return;
      }

      await createListing(data);
      setSubmitFeedback({
        status: "success",
        message: "Listing created successfully. (Mock)",
      });
    } catch {
      setSubmitFeedback({
        status: "error",
        message: "Unable to save listing. Please try again.",
      });
    }
  };

  return {
    form,
    onSubmit,
    isLoading: isFetching,
    isError: isFetchError,
    isSubmitting: isCreating || isEditing || form.formState.isSubmitting,
    submitFeedback,
  };
}
