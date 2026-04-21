"use client";

import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AdminCustomListingField,
  CreateCustomListingFieldInput,
  UpdateCustomListingFieldInput,
} from "@/shared/schemas/custom-listing-fields";
import { BulkEditDialog } from "./components/BulkEditDialog";
import { CustomListingFieldsTable } from "./components/CustomListingFieldsTable";
import { DeleteFieldDialog } from "./components/DeleteFieldDialog";
import { FieldEditorDialog } from "./components/FieldEditorDialog";
import {
  type BulkEditPayload,
  type CreateFieldDialogPayload,
  type DraggingField,
  type DropIndicator,
  type FieldDialogState,
  type SortDirection,
  type SortKey,
  type VisibilityFilter,
  getCategoryStats,
  getDisplayGroups,
  getInsertionIndexForPointer,
  groupFields,
  isFormControlTarget,
  moveItemToInsertionIndex,
  nextSortOrder,
  normalizeCategoryPayload,
  normalizeFieldCategories,
  normalizeFieldCategory,
  shouldShowDropIndicator,
  sortCategoryFields,
  sortFields,
  sortVisibleFields,
} from "./custom-listing-fields-dashboard-utils";

type RequestErrorBody = {
  message?: string;
};

type ReorderCustomListingFieldsResponse = {
  data: AdminCustomListingField[];
};

export function CustomListingFieldsDashboard({
  initialFields,
}: {
  initialFields: AdminCustomListingField[];
}) {
  const [fields, setFields] = useState(() => sortFields(normalizeFieldCategories(initialFields)));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const [pendingFieldId, setPendingFieldId] = useState<string | null>(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(() => new Set());
  const [lastSelectedFieldId, setLastSelectedFieldId] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<DraggingField | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const [fieldDialog, setFieldDialog] = useState<FieldDialogState | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCustomListingField | null>(null);
  const [feedback, setFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const rowHandleDragRef = useRef(false);
  const isCreatingRef = useRef(false);

  const categories = useMemo(() => getCategoryStats(fields), [fields]);
  const categoryOptions = useMemo(
    () => categories.map((category) => category.category),
    [categories],
  );
  const isFiltered = search.trim() !== "" || categoryFilter !== "all" || visibilityFilter !== "all";

  const filteredFields = useMemo(() => {
    const query = search.trim().toLowerCase();
    const nextFields = fields.filter((field) => {
      const matchesCategory = categoryFilter === "all" || field.category === categoryFilter;
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" ? field.publicOnly : !field.publicOnly);
      const matchesSearch =
        query === "" ||
        [
          field.label,
          field.key,
          field.category,
          field.description ?? "",
          field.helpText ?? "",
        ].some((value) => value.toLowerCase().includes(query));

      return matchesCategory && matchesVisibility && matchesSearch;
    });

    return sortVisibleFields(nextFields, sortKey, sortDirection);
  }, [categoryFilter, fields, search, sortDirection, sortKey, visibilityFilter]);

  const groupedFields = useMemo(() => groupFields(filteredFields), [filteredFields]);
  const displayGroups = useMemo(
    () =>
      getDisplayGroups({
        activeCategory: categoryFilter,
        expandedCategories,
        groupedFields,
        isFiltered,
      }),
    [categoryFilter, expandedCategories, groupedFields, isFiltered],
  );
  const visibleFieldIds = useMemo(
    () => displayGroups.flatMap((group) => group.visibleFields.map((field) => field.id)),
    [displayGroups],
  );
  const selectedFields = useMemo(
    () => fields.filter((field) => selectedFieldIds.has(field.id)),
    [fields, selectedFieldIds],
  );

  useEffect(() => {
    const handleEscapeSelection = (event: globalThis.KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        selectedFieldIds.size === 0 ||
        fieldDialog ||
        bulkEditOpen ||
        deleteTarget ||
        isFormControlTarget(event.target)
      ) {
        return;
      }

      setSelectedFieldIds(new Set());
      setLastSelectedFieldId(null);
    };

    window.addEventListener("keydown", handleEscapeSelection);
    return () => window.removeEventListener("keydown", handleEscapeSelection);
  }, [bulkEditOpen, deleteTarget, fieldDialog, selectedFieldIds.size]);

  const openCreateDialog = (category?: string) => {
    const resolvedCategory =
      category ??
      (categoryFilter !== "all"
        ? categoryFilter
        : (categories[0]?.category ?? "BUILDING AMENITIES"));

    setFieldDialog({
      mode: "create",
      category: resolvedCategory,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setVisibilityFilter("all");
    setExpandedCategories(new Set());
  };

  const handleSort = (nextSortKey: SortKey) => {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection("asc");
  };

  const refreshFieldsFromServer = async () => {
    const response = await requestJson<{ data: AdminCustomListingField[] }>(
      "/api/admin/custom-listing-fields",
      { method: "GET" },
    );
    setFields(sortFields(normalizeFieldCategories(response.data)));
  };

  const handleCreateField = async (payload: CreateFieldDialogPayload) => {
    if (isCreatingRef.current) {
      return;
    }

    isCreatingRef.current = true;
    setFeedback(null);
    setIsCreating(true);
    const normalizedPayload = normalizeCategoryPayload(payload);
    const requestPayload = {
      ...normalizedPayload,
      placeholder: null,
      sortOrder: nextSortOrder(fields, normalizedPayload.category),
    } satisfies CreateCustomListingFieldInput;

    try {
      const response = await requestJson<{ data: AdminCustomListingField }>(
        "/api/admin/custom-listing-fields",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        },
      );
      const createdField = normalizeFieldCategory(response.data);
      setFields((current) => sortFields([...current, createdField]));
      setCategoryFilter(createdField.category);
      setFieldDialog(null);
      setFeedback({ status: "success", message: "Custom field created." });
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  };

  const handleReorderField = async (input: {
    fieldId: string;
    category: string;
    insertionIndex: number;
  }) => {
    const categoryFields = sortCategoryFields(
      fields.filter((field) => field.category === input.category),
    );
    const draggedIndex = categoryFields.findIndex((field) => field.id === input.fieldId);

    if (
      draggedIndex < 0 ||
      input.insertionIndex === draggedIndex ||
      input.insertionIndex === draggedIndex + 1
    ) {
      return;
    }

    const reorderedFields = moveItemToInsertionIndex(
      categoryFields,
      draggedIndex,
      input.insertionIndex,
    ).map((field, index) => ({
      ...field,
      sortOrder: index + 1,
    }));
    const previousFields = fields;
    const optimisticById = new Map(reorderedFields.map((field) => [field.id, field]));

    setSortKey("category");
    setSortDirection("asc");
    setFeedback(null);
    setFields((current) =>
      sortFields(current.map((field) => optimisticById.get(field.id) ?? field)),
    );

    try {
      const response = await requestJson<ReorderCustomListingFieldsResponse>(
        "/api/admin/custom-listing-fields/reorder",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: input.category,
            fields: reorderedFields.map((field) => ({
              id: field.id,
              sortOrder: field.sortOrder,
            })),
          }),
        },
      );
      const updatedById = new Map(
        response.data.map((field) => {
          const normalizedField = normalizeFieldCategory(field);
          return [normalizedField.id, normalizedField];
        }),
      );
      setFields((current) =>
        sortFields(current.map((field) => updatedById.get(field.id) ?? field)),
      );
      setFeedback({ status: "success", message: "Custom field order updated." });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to update custom field order.";

      try {
        await refreshFieldsFromServer();
        setFeedback({
          status: "error",
          message: `${message} Refreshed fields to match the latest saved order.`,
        });
      } catch {
        setFields(previousFields);
        setFeedback({
          status: "error",
          message: `${message} Unable to refresh the latest saved order.`,
        });
      }
    }
  };

  const handleRowHandleClick = (fieldId: string, shiftKey: boolean) => {
    if (rowHandleDragRef.current) {
      rowHandleDragRef.current = false;
      return;
    }

    if (shiftKey && lastSelectedFieldId) {
      const startIndex = visibleFieldIds.indexOf(lastSelectedFieldId);
      const endIndex = visibleFieldIds.indexOf(fieldId);

      if (startIndex >= 0 && endIndex >= 0) {
        const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
        const rangeIds = visibleFieldIds.slice(from, to + 1);

        setSelectedFieldIds((current) => {
          const next = new Set(current);
          for (const id of rangeIds) {
            next.add(id);
          }
          return next;
        });
        return;
      }
    }

    setSelectedFieldIds((current) => {
      const next = new Set(current);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
    setLastSelectedFieldId(fieldId);
  };

  const handleRowDragStart = (
    event: DragEvent<HTMLButtonElement>,
    field: AdminCustomListingField,
    rowElement: HTMLDivElement | null,
  ) => {
    rowHandleDragRef.current = true;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", field.id);
    if (rowElement) {
      const rect = rowElement.getBoundingClientRect();
      event.dataTransfer.setDragImage(
        rowElement,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    }
    setSortKey("category");
    setSortDirection("asc");
    setDraggingField({
      fieldId: field.id,
      category: field.category,
    });
  };

  const handleRowDragEnd = () => {
    setDraggingField(null);
    setDropIndicator(null);
    window.setTimeout(() => {
      rowHandleDragRef.current = false;
    }, 0);
  };

  const handleRowDragOver = (
    event: DragEvent<HTMLDivElement>,
    targetField: AdminCustomListingField,
  ) => {
    if (!draggingField || draggingField.category !== targetField.category) {
      setDropIndicator(null);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const insertionIndex = getInsertionIndexForPointer({
      category: targetField.category,
      fields,
      pointerY: event.clientY,
      rowRect: event.currentTarget.getBoundingClientRect(),
      targetFieldId: targetField.id,
    });

    if (shouldShowDropIndicator({ draggingField, fields, insertionIndex })) {
      setDropIndicator({ category: targetField.category, insertionIndex });
    } else {
      setDropIndicator(null);
    }
  };

  const handleRowDrop = async (
    event: DragEvent<HTMLDivElement>,
    targetField: AdminCustomListingField,
  ) => {
    if (!draggingField || draggingField.category !== targetField.category) {
      return;
    }

    event.preventDefault();
    const insertionIndex = getInsertionIndexForPointer({
      category: targetField.category,
      fields,
      pointerY: event.clientY,
      rowRect: event.currentTarget.getBoundingClientRect(),
      targetFieldId: targetField.id,
    });

    setDropIndicator(null);
    await handleReorderField({
      fieldId: draggingField.fieldId,
      category: targetField.category,
      insertionIndex,
    });
  };

  const handleBulkEdit = async (payload: BulkEditPayload) => {
    if (selectedFields.length === 0 || Object.keys(payload).length === 0) {
      return;
    }

    setFeedback(null);
    setIsBulkSaving(true);
    const normalizedPayload = normalizeCategoryPayload(payload);

    try {
      const responses = await Promise.all(
        selectedFields.map((field) =>
          requestJson<{ data: AdminCustomListingField }>(
            `/api/admin/custom-listing-fields/${field.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(normalizedPayload),
            },
          ),
        ),
      );
      const updatedById = new Map(
        responses.map((response) => {
          const field = normalizeFieldCategory(response.data);
          return [field.id, field];
        }),
      );
      setFields((current) =>
        sortFields(current.map((field) => updatedById.get(field.id) ?? field)),
      );
      setBulkEditOpen(false);
      setFeedback({
        status: "success",
        message: `${responses.length} custom ${responses.length === 1 ? "field" : "fields"} updated.`,
      });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to update selected fields.";

      try {
        await refreshFieldsFromServer();
        setFeedback({
          status: "error",
          message: `${message} Refreshed fields to match the latest saved values.`,
        });
      } catch {
        setFeedback({
          status: "error",
          message: `${message} Unable to refresh the latest saved values.`,
        });
      }
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleUpdateField = async (
    fieldId: string,
    payload: UpdateCustomListingFieldInput,
    closeDialog = true,
    throwOnError = closeDialog,
  ) => {
    setFeedback(null);
    setPendingFieldId(fieldId);
    const normalizedPayload = normalizeCategoryPayload(payload);

    try {
      const response = await requestJson<{ data: AdminCustomListingField }>(
        `/api/admin/custom-listing-fields/${fieldId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizedPayload),
        },
      );
      const updatedField = normalizeFieldCategory(response.data);
      setFields((current) =>
        sortFields(current.map((field) => (field.id === fieldId ? updatedField : field))),
      );
      if (closeDialog) {
        setFieldDialog(null);
        setFeedback({ status: "success", message: "Custom field updated." });
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to update custom field.";
      if (closeDialog) {
        throw caught;
      }
      setFeedback({ status: "error", message });
      if (throwOnError) {
        throw caught;
      }
    } finally {
      setPendingFieldId(null);
    }
  };

  const handleDeleteField = async () => {
    if (!deleteTarget) {
      return;
    }

    setFeedback(null);
    setPendingFieldId(deleteTarget.id);

    try {
      await requestJson(`/api/admin/custom-listing-fields/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setFields((current) => current.filter((field) => field.id !== deleteTarget.id));
      setDeleteTarget(null);
      setFeedback({ status: "success", message: "Custom field deleted." });
    } catch (caught) {
      setFeedback({
        status: "error",
        message: caught instanceof Error ? caught.message : "Unable to delete custom field.",
      });
    } finally {
      setPendingFieldId(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-7rem)] bg-muted/60 px-5 py-7 text-sm text-foreground md:px-7">
      <div className="mx-auto max-w-[1920px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Custom Listing Fields</h1>
            <p className="mt-1 text-base text-muted-foreground">
              Manage the custom fields that appear on listings and filters. The order in this table
              is the order renters and partners will see on each listing.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button
              type="button"
              size="lg"
              className="h-10 gap-2 rounded-md px-5 text-sm"
              onClick={() => openCreateDialog()}
              disabled={isCreating}
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
              Add Field
            </Button>
          </div>
        </div>

        <CustomListingFieldsTable
          categories={categories}
          categoryOptions={categoryOptions}
          categoryFilter={categoryFilter}
          visibilityFilter={visibilityFilter}
          search={search}
          sortKey={sortKey}
          sortDirection={sortDirection}
          selectedFieldIds={selectedFieldIds}
          selectedFieldCount={selectedFields.length}
          displayGroups={displayGroups}
          dropIndicator={dropIndicator}
          pendingFieldId={pendingFieldId}
          onSearchChange={setSearch}
          onCategoryFilterChange={setCategoryFilter}
          onVisibilityFilterChange={setVisibilityFilter}
          onClearFilters={handleClearFilters}
          onClearSelection={() => setSelectedFieldIds(new Set())}
          onOpenBulkEdit={() => setBulkEditOpen(true)}
          onSort={handleSort}
          onExpandCategory={(category) =>
            setExpandedCategories((current) => {
              const next = new Set(current);
              next.add(category);
              return next;
            })
          }
          onRowSelectToggle={handleRowHandleClick}
          onRowDragStart={handleRowDragStart}
          onRowDragEnd={handleRowDragEnd}
          onRowDragOver={handleRowDragOver}
          onRowDrop={(event, field) => void handleRowDrop(event, field)}
          onDeleteField={setDeleteTarget}
          onTextChange={(fieldId, payload) => handleUpdateField(fieldId, payload, false, true)}
          onVisibilityChange={(fieldId, publicOnly) =>
            void handleUpdateField(fieldId, { publicOnly }, false)
          }
          onFilterableChange={(fieldId, filterableOnly) =>
            void handleUpdateField(fieldId, { filterableOnly }, false)
          }
          onRequiredChange={(fieldId, required) =>
            void handleUpdateField(fieldId, { required }, false)
          }
        />

        {feedback ? (
          <p
            className={cn(
              "mt-4 text-sm",
              feedback.status === "success" ? "text-emerald-700" : "text-destructive",
            )}
            role="status"
            aria-live="polite"
          >
            {feedback.message}
          </p>
        ) : null}
      </div>

      {fieldDialog ? (
        <FieldEditorDialog
          state={fieldDialog}
          categories={categoryOptions}
          isSaving={isCreating}
          onClose={() => setFieldDialog(null)}
          onCreate={(payload) => handleCreateField(payload)}
        />
      ) : null}

      {bulkEditOpen ? (
        <BulkEditDialog
          categories={categoryOptions}
          selectedCount={selectedFields.length}
          isSaving={isBulkSaving}
          onClose={() => setBulkEditOpen(false)}
          onSubmit={handleBulkEdit}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteFieldDialog
          field={deleteTarget}
          isDeleting={pendingFieldId === deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void handleDeleteField()}
        />
      ) : null}
    </main>
  );
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as RequestErrorBody;

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return payload as T;
}
