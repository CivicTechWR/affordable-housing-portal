"use client";

import { useCallback, useRef, useState } from "react";

import type {
  AdminCustomListingField,
  AdminCustomListingFieldListResponse,
  CreateCustomListingFieldInput,
  CreateCustomListingFieldResponse,
  DeleteCustomListingFieldResponse,
  ReorderCustomListingFieldsInput,
  ReorderCustomListingFieldsResponse,
  UpdateCustomListingFieldInput,
  UpdateCustomListingFieldResponse,
} from "@/shared/schemas/custom-listing-fields";
import {
  normalizeFieldCategories,
  normalizeFieldCategory,
} from "./custom-listing-fields-dashboard-utils";

type RequestErrorBody = {
  message?: string;
};

export function useAdminCustomListingFieldsQuery() {
  const refreshFields = useCallback(async () => {
    const response = await requestJson<AdminCustomListingFieldListResponse>(
      "/api/admin/custom-listing-fields",
      { method: "GET" },
    );
    return normalizeFieldCategories(response.data);
  }, []);

  return { refreshFields };
}

export function useCreateAdminCustomListingFieldMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const createField = useCallback(async (input: CreateCustomListingFieldInput) => {
    if (isLoadingRef.current) {
      return null;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const response = await requestJson<CreateCustomListingFieldResponse>(
        "/api/admin/custom-listing-fields",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      return normalizeFieldCategory(response.data);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  return { createField, isLoading };
}

export function useUpdateAdminCustomListingFieldMutation() {
  const updateField = useCallback(async (fieldId: string, input: UpdateCustomListingFieldInput) => {
    const response = await requestJson<UpdateCustomListingFieldResponse>(
      `/api/admin/custom-listing-fields/${fieldId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    return normalizeFieldCategory(response.data);
  }, []);

  return { updateField };
}

export function useBulkUpdateAdminCustomListingFieldsMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const { updateField } = useUpdateAdminCustomListingFieldMutation();

  const updateFields = useCallback(
    async (fields: AdminCustomListingField[], input: UpdateCustomListingFieldInput) => {
      setIsLoading(true);

      try {
        return await Promise.all(fields.map((field) => updateField(field.id, input)));
      } finally {
        setIsLoading(false);
      }
    },
    [updateField],
  );

  return { updateFields, isLoading };
}

export function useReorderAdminCustomListingFieldsMutation() {
  const reorderFields = useCallback(async (input: ReorderCustomListingFieldsInput) => {
    const response = await requestJson<ReorderCustomListingFieldsResponse>(
      "/api/admin/custom-listing-fields/reorder",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    return normalizeFieldCategories(response.data);
  }, []);

  return { reorderFields };
}

export function useDeleteAdminCustomListingFieldMutation() {
  const deleteField = useCallback(async (fieldId: string) => {
    await requestJson<DeleteCustomListingFieldResponse>(
      `/api/admin/custom-listing-fields/${fieldId}`,
      { method: "DELETE" },
    );
  }, []);

  return { deleteField };
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as RequestErrorBody;

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return payload as T;
}
