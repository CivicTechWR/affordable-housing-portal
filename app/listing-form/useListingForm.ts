import { useCallback, useEffect, useRef, useState } from "react";
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
  const isPublishedEditMode = Boolean(initialListingId && initialData?.status === "published");
  const shouldAutosaveDraft =
    !isPublishedEditMode &&
    Boolean(
      activeListingId &&
      initialData &&
      autosavePayload &&
      autosavePayloadKey &&
      lastAutosavedPayloadRef.current !== autosavePayloadKey &&
      !form.formState.isSubmitting,
    );
  const shouldWarnOnNavigateAway =
    isPublishedEditMode && form.formState.isDirty && !form.formState.isSubmitting;

  const bootstrapDraft = useCallback(async () => {
    setDraftBootstrapError(null);

    try {
      const draftListing = await createDraftListing();
      setActiveListingId(draftListing.id);
      router.replace(`/listing-form/${draftListing.id}`);
    } catch (error) {
      setDraftBootstrapError(
        error instanceof Error
          ? error.message
          : "Unable to create a draft listing. Please try again.",
      );
    }
  }, [createDraftListing, router]);

  useEffect(() => {
    setActiveListingId(initialListingId);
  }, [initialListingId]);

  useEffect(() => {
    if (initialListingId || hasRequestedDraftRef.current) {
      return;
    }

    hasRequestedDraftRef.current = true;
    void bootstrapDraft();
  }, [bootstrapDraft, initialListingId]);

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
    if (!activeListingId || !autosavePayload || !autosavePayloadKey || !shouldAutosaveDraft) {
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
  }, [activeListingId, autosavePayload, autosavePayloadKey, editListing, shouldAutosaveDraft]);

  useEffect(() => {
    if (shouldAutosaveDraft) {
      return;
    }

    setAutosaveFeedback(null);
  }, [shouldAutosaveDraft]);

  useEffect(() => {
    if (!shouldWarnOnNavigateAway) {
      return;
    }

    const warningMessage =
      "You have unsaved changes to this published listing. Leave this page without saving?";

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = warningMessage;
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      if (link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(link.href, window.location.href);

      if (nextUrl.href === window.location.href) {
        return;
      }

      if (!window.confirm(warningMessage)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [shouldWarnOnNavigateAway]);

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
    retryDraftBootstrap: async () => {
      hasRequestedDraftRef.current = false;
      await bootstrapDraft();
      hasRequestedDraftRef.current = true;
    },
    listingId: activeListingId,
    autosaveFeedback,
    isLoading:
      isCreatingDraft ||
      (!activeListingId && !initialListingId && !draftBootstrapError) ||
      isFetching,
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
