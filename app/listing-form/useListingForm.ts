import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { mapListingFormToAutosaveUpdateInput, mapListingFormToUpdateListingInput } from "./api";
import {
  listingFormSchema,
  ListingFormContext,
  ListingFormData,
  ListingFormInput,
  CREATE_FORM_DEFAULTS,
} from "./types";
import { useCreateDraftListingQuery } from "./useCreateDraftListingQuery";
import { useEditListingQuery } from "./useEditListingQuery";
import { useGetListingQuery } from "./useGetListingQuery";

export function useListingForm(initialListingId?: string) {
  const router = useRouter();
  const hasRequestedDraftRef = useRef(false);
  const lastAutosavedPayloadRef = useRef<string | null>(null);
  const [activeListingId, setActiveListingId] = useState(initialListingId);
  const [submitFeedback, setSubmitFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const [autosaveFeedback, setAutosaveFeedback] = useState<string | null>(null);
  const [draftBootstrapError, setDraftBootstrapError] = useState<string | null>(null);
  const form = useForm<ListingFormInput, ListingFormContext, ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: CREATE_FORM_DEFAULTS,
  });
  const watchedValues = useWatch({
    control: form.control,
  }) as ListingFormInput;
  const {
    data: initialData,
    isLoading: isFetching,
    isError: isFetchError,
  } = useGetListingQuery(activeListingId);
  const { createDraftListing, isLoading: isCreatingDraft } = useCreateDraftListingQuery();
  const { editListing, isLoading: isEditing } = useEditListingQuery();
  const autosavePayload = mapListingFormToAutosaveUpdateInput(
    watchedValues,
    initialListingId ? watchedValues.status : "draft",
  );
  const autosavePayloadKey = autosavePayload ? JSON.stringify(autosavePayload) : null;

  useEffect(() => {
    setActiveListingId(initialListingId);
  }, [initialListingId]);

  useEffect(() => {
    if (initialListingId || hasRequestedDraftRef.current) {
      return;
    }

    hasRequestedDraftRef.current = true;
    setDraftBootstrapError(null);

    void createDraftListing()
      .then((draftListing) => {
        setActiveListingId(draftListing.id);
        router.replace(`/listing-form/${draftListing.id}`);
      })
      .catch((error) => {
        setDraftBootstrapError(
          error instanceof Error
            ? error.message
            : "Unable to create a draft listing. Please try again.",
        );
      });
  }, [createDraftListing, initialListingId, router]);

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      lastAutosavedPayloadRef.current = JSON.stringify(
        mapListingFormToAutosaveUpdateInput(
          initialData,
          initialListingId ? initialData.status : "draft",
        ),
      );
      return;
    }

    if (!activeListingId) {
      form.reset(CREATE_FORM_DEFAULTS);
      lastAutosavedPayloadRef.current = null;
    }
  }, [activeListingId, form, initialData, initialListingId]);

  useEffect(() => {
    if (
      !activeListingId ||
      !initialData ||
      !autosavePayload ||
      !autosavePayloadKey ||
      lastAutosavedPayloadRef.current === autosavePayloadKey ||
      form.formState.isSubmitting
    ) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setAutosaveFeedback("Saving draft...");
        await editListing({
          listingId: activeListingId,
          payload: autosavePayload,
        });
        lastAutosavedPayloadRef.current = autosavePayloadKey;
        setAutosaveFeedback("Draft saved");
      } catch {
        setAutosaveFeedback("Unable to autosave draft");
      }
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [
    activeListingId,
    autosavePayload,
    autosavePayloadKey,
    editListing,
    form.formState.isSubmitting,
    initialData,
  ]);

  const onSubmit = async (data: ListingFormData) => {
    setSubmitFeedback(null);
    setAutosaveFeedback(null);

    try {
      if (!activeListingId) {
        throw new Error(
          "Draft listing is still being created. Please wait a moment and try again.",
        );
      }

      await editListing({
        listingId: activeListingId,
        payload: mapListingFormToUpdateListingInput(data, "published"),
      });
      router.push(`/listings/${activeListingId}`);
      router.refresh();
    } catch (error) {
      setSubmitFeedback({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unable to save listing. Please try again.",
      });
    }
  };

  return {
    form,
    onSubmit,
    listingId: activeListingId,
    autosaveFeedback,
    isLoading: isCreatingDraft || (!activeListingId && !initialListingId) || isFetching,
    isError: isFetchError || Boolean(draftBootstrapError),
    isSubmitting: isCreatingDraft || isEditing || form.formState.isSubmitting,
    submitFeedback:
      submitFeedback ??
      (draftBootstrapError
        ? {
            status: "error" as const,
            message: draftBootstrapError,
          }
        : null),
  };
}
