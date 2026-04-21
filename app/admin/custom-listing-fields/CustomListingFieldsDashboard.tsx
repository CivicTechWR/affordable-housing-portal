"use client";

import {
  FormEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Add01Icon,
  ArrowDown01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  EyeIcon,
  Search01Icon,
  Sorting05Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  AdminCustomListingField,
  CreateCustomListingFieldInput,
  UpdateCustomListingFieldInput,
} from "@/shared/schemas/custom-listing-fields";

type SortKey =
  | "label"
  | "key"
  | "category"
  | "description"
  | "helpText"
  | "visibility"
  | "filterable"
  | "required";
type SortDirection = "asc" | "desc";

const TABLE_COLUMNS =
  "grid-cols-[48px_minmax(180px,1.1fr)_minmax(190px,1.15fr)_minmax(150px,0.85fr)_minmax(260px,1.35fr)_minmax(260px,1.35fr)_minmax(132px,0.7fr)_96px_96px_94px]";

const FIELD_HELP_TEXT = {
  label: "Human-readable field name shown to partners and renters.",
  key: "Stable identifier used by listing data and APIs.",
  category: "Groups related fields together in forms and listings.",
  description: "Public text shown to tenants and applicants.",
  helpText: "Partner guidance shown while creating listings.",
  visibility: "Controls whether renters can see the field.",
  filterable: "Makes the field available in search filters.",
  required: "Marks whether listings should answer this field.",
} satisfies Record<SortKey, string>;

type VisibilityFilter = "all" | "public" | "internal";
type FieldDialogState = {
  mode: "create";
  category: string;
};

type FieldFormState = {
  key: string;
  label: string;
  description: string;
  category: string;
  helpText: string;
  publicOnly: boolean;
  filterableOnly: boolean;
  required: boolean;
};

type CreateFieldDialogPayload = Omit<CreateCustomListingFieldInput, "placeholder" | "sortOrder">;

type RequestErrorBody = {
  message?: string;
};

type DisplayGroup = {
  category: string;
  label: string;
  fields: AdminCustomListingField[];
  visibleFields: AdminCustomListingField[];
  hiddenCount: number;
};

type BulkEditPayload = Pick<
  UpdateCustomListingFieldInput,
  "category" | "filterableOnly" | "publicOnly" | "required"
>;

type DraggingField = {
  fieldId: string;
  category: string;
};

type DropIndicator = {
  category: string;
  insertionIndex: number;
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
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCustomListingField | null>(null);
  const [feedback, setFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const rowHandleDragRef = useRef(false);

  const categories = useMemo(() => getCategoryStats(fields), [fields]);
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
    setFeedback(null);
    const normalizedPayload = normalizeCategoryPayload(payload);
    const requestPayload = {
      ...normalizedPayload,
      placeholder: null,
      sortOrder: nextSortOrder(fields, normalizedPayload.category),
    } satisfies CreateCustomListingFieldInput;
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
    const changedFields = reorderedFields.filter((field) => {
      const previous = categoryFields.find((current) => current.id === field.id);
      return previous && previous.sortOrder !== field.sortOrder;
    });

    if (changedFields.length === 0) {
      return;
    }

    const previousFields = fields;
    const changedById = new Map(changedFields.map((field) => [field.id, field]));

    setSortKey("category");
    setSortDirection("asc");
    setFeedback(null);
    setFields((current) => sortFields(current.map((field) => changedById.get(field.id) ?? field)));

    try {
      await Promise.all(
        changedFields.map((field) =>
          requestJson(`/api/admin/custom-listing-fields/${field.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: field.sortOrder }),
          }),
        ),
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
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
              Add Field
            </Button>
          </div>
        </div>

        <div className="mt-8 border-b border-border">
          <div className="flex gap-7 overflow-x-auto">
            <CategoryTab
              isActive={categoryFilter === "all"}
              label="All Fields"
              onClick={() => setCategoryFilter("all")}
            />
            {categories.map((category) => (
              <CategoryTab
                key={category.category}
                isActive={categoryFilter === category.category}
                label={category.label}
                count={category.count}
                onClick={() => setCategoryFilter(category.category)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative block w-full xl:w-80">
            <span className="sr-only">Search fields</span>
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search fields..."
              className="h-10 rounded-md bg-background pl-11 text-sm"
            />
          </label>

          <FilterSelect
            ariaLabel="Filter by category"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
          >
            <option value="all">Category: All</option>
            {categories.map((category) => (
              <option key={category.category} value={category.category}>
                Category: {category.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            ariaLabel="Filter by visibility"
            value={visibilityFilter}
            onChange={(value) => setVisibilityFilter(value as VisibilityFilter)}
          >
            <option value="all">Visibility: All</option>
            <option value="public">Visibility: Public</option>
            <option value="internal">Visibility: Internal</option>
          </FilterSelect>

          <button
            type="button"
            className="h-10 px-3 text-left text-sm font-medium text-foreground/80 hover:text-primary"
            onClick={handleClearFilters}
          >
            Clear filters
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-md border border-border bg-background">
          <div className="overflow-x-auto">
            {selectedFields.length > 0 ? (
              <div className="flex min-w-[1500px] items-center justify-between border-b border-border bg-primary/5 px-4 py-3">
                <span className="text-sm font-medium text-foreground">
                  {selectedFields.length} {selectedFields.length === 1 ? "field" : "fields"}{" "}
                  selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="bg-background"
                    onClick={() => setSelectedFieldIds(new Set())}
                  >
                    Clear selection
                  </Button>
                  <Button type="button" size="lg" onClick={() => setBulkEditOpen(true)}>
                    Bulk Edit
                  </Button>
                </div>
              </div>
            ) : null}
            <div
              className={cn(
                "grid min-w-[1500px] border-b border-border bg-muted/50",
                TABLE_COLUMNS,
              )}
            >
              <div />
              <SortHeader
                label="Label"
                sortKey="label"
                helperText={FIELD_HELP_TEXT.label}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                label="Key"
                sortKey="key"
                helperText={FIELD_HELP_TEXT.key}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                label="Category"
                sortKey="category"
                helperText={FIELD_HELP_TEXT.category}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                label="Description"
                sortKey="description"
                helperText={FIELD_HELP_TEXT.description}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                label="Help Text"
                sortKey="helpText"
                helperText={FIELD_HELP_TEXT.helpText}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                label="Visibility"
                sortKey="visibility"
                helperText={FIELD_HELP_TEXT.visibility}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                label="Filterable"
                sortKey="filterable"
                helperText={FIELD_HELP_TEXT.filterable}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                label="Required"
                sortKey="required"
                helperText={FIELD_HELP_TEXT.required}
                activeSortKey={sortKey}
                direction={sortDirection}
                onSort={handleSort}
              />
              <div className="px-4 py-4 text-xs font-medium text-foreground/80">Actions</div>
            </div>

            <div className="min-w-[1500px]">
              {displayGroups.length === 0 ? (
                <div className="px-8 py-14 text-center text-muted-foreground">
                  No custom fields match these filters.
                </div>
              ) : (
                displayGroups.map((group) => {
                  return (
                    <div key={group.category}>
                      <div className="flex h-10 items-center gap-3 border-y border-border bg-muted/20 px-14">
                        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
                          {group.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {group.fields.length} {group.fields.length === 1 ? "field" : "fields"}
                        </span>
                      </div>
                      {group.visibleFields.map((field, index) => (
                        <div key={field.id}>
                          {dropIndicator?.category === group.category &&
                          dropIndicator.insertionIndex === index ? (
                            <DropIndicatorLine />
                          ) : null}
                          <FieldRow
                            field={field}
                            isPending={pendingFieldId === field.id}
                            isSelected={selectedFieldIds.has(field.id)}
                            categoryOptions={categories.map((category) => category.category)}
                            onSelectToggle={(event) =>
                              handleRowHandleClick(field.id, event.shiftKey)
                            }
                            onDragStart={(event, rowElement) =>
                              handleRowDragStart(event, field, rowElement)
                            }
                            onDragEnd={handleRowDragEnd}
                            onDragOver={(event) => handleRowDragOver(event, field)}
                            onDrop={(event) => void handleRowDrop(event, field)}
                            onDelete={() => setDeleteTarget(field)}
                            onTextChange={(payload) =>
                              handleUpdateField(field.id, payload, false, true)
                            }
                            onVisibilityChange={(publicOnly) =>
                              void handleUpdateField(field.id, { publicOnly }, false)
                            }
                            onFilterableChange={(filterableOnly) =>
                              void handleUpdateField(field.id, { filterableOnly }, false)
                            }
                            onRequiredChange={(required) =>
                              void handleUpdateField(field.id, { required }, false)
                            }
                          />
                        </div>
                      ))}
                      {dropIndicator?.category === group.category &&
                      dropIndicator.insertionIndex === group.visibleFields.length ? (
                        <DropIndicatorLine />
                      ) : null}
                      {group.hiddenCount > 0 ? (
                        <button
                          type="button"
                          className="flex h-9 w-full items-center justify-center gap-2 border-b border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                          onClick={() =>
                            setExpandedCategories((current) => {
                              const next = new Set(current);
                              next.add(group.category);
                              return next;
                            })
                          }
                        >
                          Show more in this category ({group.hiddenCount} more)
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            strokeWidth={2}
                            className="size-4"
                          />
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

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
          categories={categories.map((category) => category.category)}
          isSaving={Boolean(pendingFieldId)}
          onClose={() => setFieldDialog(null)}
          onCreate={(payload) => handleCreateField(payload)}
        />
      ) : null}

      {bulkEditOpen ? (
        <BulkEditDialog
          categories={categories.map((category) => category.category)}
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

function CategoryTab({
  isActive,
  label,
  count,
  onClick,
}: {
  isActive: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 shrink-0 items-center gap-2 border-b-2 px-5 text-sm font-medium transition-colors",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-foreground/75 hover:text-foreground",
      )}
      onClick={onClick}
    >
      {label}
      {typeof count === "number" ? (
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function FilterSelect({
  ariaLabel,
  children,
  value,
  onChange,
}: {
  ariaLabel: string;
  children: ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-36 rounded-md border border-input bg-background px-4 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {children}
    </select>
  );
}

function SortHeader({
  label,
  sortKey,
  helperText,
  activeSortKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  helperText: string;
  activeSortKey: SortKey;
  direction: SortDirection;
  onSort: (sortKey: SortKey) => void;
}) {
  const isActive = sortKey === activeSortKey;

  return (
    <button
      type="button"
      title={helperText}
      aria-label={`${label}: ${helperText}`}
      className="flex items-center gap-1 px-4 py-4 text-left text-xs font-medium text-foreground/80"
      onClick={() => onSort(sortKey)}
    >
      {label}
      <HugeiconsIcon
        icon={Sorting05Icon}
        strokeWidth={2}
        className={cn(
          "size-3 text-muted-foreground",
          isActive && "text-primary",
          isActive && direction === "desc" && "rotate-180",
        )}
      />
    </button>
  );
}

function EditableTextCell({
  value,
  displayValue,
  className,
  disabled,
  required,
  multiline,
  ariaLabel,
  datalistId,
  datalistOptions,
  onCommit,
}: {
  value: string;
  displayValue?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  ariaLabel: string;
  datalistId?: string;
  datalistOptions?: string[];
  onCommit: (value: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  const shownValue = displayValue ?? value;

  const beginEditing = () => {
    if (disabled) {
      return;
    }

    setDraft(value);
    setError("");
    setIsEditing(true);
  };

  const commit = async (nextValue = draft) => {
    const trimmed = nextValue.trim();

    if (required && !trimmed) {
      setError("Required");
      return;
    }

    if (trimmed === value.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      await onCommit(required ? trimmed : nextValue);
      setIsEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save.");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(value);
      setError("");
      setIsEditing(false);
      return;
    }

    if (event.key === "Enter" && !multiline) {
      event.preventDefault();
      void commit();
    }
  };

  if (isEditing) {
    return (
      <div className="px-3 py-2">
        {multiline ? (
          <Textarea
            aria-label={ariaLabel}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={3}
            className="min-h-20 bg-background text-sm"
          />
        ) : datalistId && datalistOptions ? (
          <CategoryCombobox
            id={datalistId}
            value={draft}
            options={datalistOptions}
            onValueChange={setDraft}
            onValueCommit={(nextValue) => void commit(nextValue)}
            onBlur={() => void commit()}
            onKeyDown={handleKeyDown}
            required={required}
          />
        ) : (
          <Input
            aria-label={ariaLabel}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-background text-sm"
          />
        )}
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "h-full w-full cursor-text px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
      disabled={disabled}
      onClick={beginEditing}
    >
      {shownValue}
    </button>
  );
}

function DropIndicatorLine() {
  return (
    <div className="relative h-0" aria-hidden>
      <div className="pointer-events-none absolute left-0 right-0 top-[-1px] z-10 flex items-center">
        <span className="size-2 rounded-full bg-primary" />
        <span className="h-0.5 flex-1 bg-primary shadow-[0_0_0_1px_var(--color-background)]" />
      </div>
    </div>
  );
}

function FieldRow({
  field,
  isPending,
  isSelected,
  categoryOptions,
  onSelectToggle,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDelete,
  onTextChange,
  onVisibilityChange,
  onFilterableChange,
  onRequiredChange,
}: {
  field: AdminCustomListingField;
  isPending: boolean;
  isSelected: boolean;
  categoryOptions: string[];
  onSelectToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>, rowElement: HTMLDivElement | null) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDelete: () => void;
  onTextChange: (payload: UpdateCustomListingFieldInput) => Promise<void>;
  onVisibilityChange: (publicOnly: boolean) => void;
  onFilterableChange: (filterableOnly: boolean) => void;
  onRequiredChange: (required: boolean) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rowRef}
      className={cn(
        "grid min-h-16 items-center border-b border-border text-sm transition-colors last:border-b-0",
        TABLE_COLUMNS,
        isSelected && "bg-primary/5",
        isPending && "opacity-60",
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex justify-center px-1">
        <button
          type="button"
          draggable={!isPending}
          className={cn(
            "flex size-7 cursor-grab items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors active:cursor-grabbing",
            "hover:border-border hover:bg-muted hover:text-foreground",
            isSelected && "border-primary/30 bg-primary/10 text-primary",
          )}
          aria-label={`Select or drag ${field.label} to reorder`}
          aria-pressed={isSelected}
          title={`Drag ${field.label} to reorder within ${formatCategoryLabel(
            field.category,
          )}, or click to select`}
          disabled={isPending}
          onClick={onSelectToggle}
          onDragStart={(event) => onDragStart(event, rowRef.current)}
          onDragEnd={onDragEnd}
        >
          <HugeiconsIcon
            icon={isSelected ? Tick02Icon : DragDropVerticalIcon}
            strokeWidth={2}
            className="size-4"
          />
        </button>
      </div>
      <EditableTextCell
        value={field.label}
        className="font-medium text-foreground"
        disabled={isPending}
        required
        ariaLabel={`Edit label for ${field.label}`}
        onCommit={(label) => onTextChange({ label })}
      />
      <div
        className="cursor-not-allowed px-4 py-3 font-mono text-xs text-muted-foreground"
        title="Field keys are fixed after creation."
      >
        {field.key}
      </div>
      <EditableTextCell
        value={formatCategoryLabel(field.category)}
        displayValue={formatCategoryLabel(field.category)}
        className="text-foreground/80"
        disabled={isPending}
        required
        ariaLabel={`Edit category for ${field.label}`}
        datalistId={`field-category-options-${field.id}`}
        datalistOptions={categoryOptions}
        onCommit={(category) =>
          onTextChange({ category: getCanonicalCategoryValue(category, categoryOptions) })
        }
      />
      <EditableTextCell
        value={field.description ?? ""}
        displayValue={field.description || "No description."}
        className="text-foreground/90"
        disabled={isPending}
        ariaLabel={`Edit description for ${field.label}`}
        multiline
        onCommit={(description) => onTextChange({ description: nullableTrim(description) })}
      />
      <EditableTextCell
        value={field.helpText ?? ""}
        displayValue={field.helpText || "No help text."}
        className="text-foreground/90"
        disabled={isPending}
        ariaLabel={`Edit help text for ${field.label}`}
        multiline
        onCommit={(helpText) => onTextChange({ helpText: nullableTrim(helpText) })}
      />
      <div className="px-4 py-3">
        <label className="relative inline-flex">
          <span className="sr-only">Visibility for {field.label}</span>
          <HugeiconsIcon
            icon={EyeIcon}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-emerald-700"
          />
          <select
            value={field.publicOnly ? "public" : "internal"}
            onChange={(event) => onVisibilityChange(event.target.value === "public")}
            disabled={isPending}
            className="h-8 w-28 rounded-md border border-input bg-background py-1 pl-8 pr-2 text-xs font-medium text-emerald-700 outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60"
          >
            <option value="public">Public</option>
            <option value="internal">Internal</option>
          </select>
        </label>
      </div>
      <div className="px-4 py-3">
        <Checkbox
          aria-label={`Toggle filterable for ${field.label}`}
          checked={field.filterableOnly}
          disabled={isPending}
          onCheckedChange={(checked) => onFilterableChange(checked === true)}
        />
      </div>
      <div className="px-4 py-3">
        <Checkbox
          aria-label={`Toggle required for ${field.label}`}
          checked={field.required}
          disabled={isPending}
          onCheckedChange={(checked) => onRequiredChange(checked === true)}
        />
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50"
          aria-label={`Delete ${field.label}`}
          disabled={isPending}
          onClick={onDelete}
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
        </button>
      </div>
    </div>
  );
}

function FieldEditorDialog({
  state,
  categories,
  isSaving,
  onClose,
  onCreate,
}: {
  state: FieldDialogState;
  categories: string[];
  isSaving: boolean;
  onClose: () => void;
  onCreate: (payload: CreateFieldDialogPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<FieldFormState>(() => getInitialFormState(state));
  const [keyWasEdited, setKeyWasEdited] = useState(false);
  const [error, setError] = useState("");
  const normalizedCategories = getUniqueCategoryOptions(categories);

  const updateForm = <K extends keyof FieldFormState>(key: K, value: FieldFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleLabelChange = (label: string) => {
    setForm((current) => ({
      ...current,
      label,
      key: keyWasEdited ? current.key : slugifyKey(label),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.label.trim() || !form.key.trim() || !form.category.trim()) {
      setError("Label, key, and category are required.");
      return;
    }

    const payload = {
      key: form.key.trim(),
      label: form.label.trim(),
      description: nullableTrim(form.description),
      type: "boolean",
      category: getCanonicalCategoryValue(form.category, categories),
      helpText: nullableTrim(form.helpText),
      publicOnly: form.publicOnly,
      filterableOnly: form.filterableOnly,
      required: form.required,
      options: null,
    } satisfies CreateFieldDialogPayload;

    try {
      await onCreate(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save custom field.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-md border border-border bg-background shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">Add Custom Field</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure how this field appears on listing forms, listing pages, and filters.
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 px-6 py-5 md:grid-cols-2">
          <FieldControl
            label="Label"
            htmlFor="field-label"
            helpText={FIELD_HELP_TEXT.label}
            required
          >
            <Input
              id="field-label"
              value={form.label}
              onChange={(event) => handleLabelChange(event.target.value)}
              required
            />
          </FieldControl>
          <FieldControl label="Key" htmlFor="field-key" helpText={FIELD_HELP_TEXT.key} required>
            <Input
              id="field-key"
              value={form.key}
              onChange={(event) => {
                setKeyWasEdited(true);
                updateForm("key", normalizeKeyDraft(event.target.value));
              }}
              required
            />
          </FieldControl>
          <FieldControl
            label="Category"
            htmlFor="field-category"
            helpText={FIELD_HELP_TEXT.category}
            required
          >
            <CategoryCombobox
              id="field-category"
              value={form.category}
              options={normalizedCategories}
              onValueChange={(category) => updateForm("category", category)}
              required
            />
          </FieldControl>
          <FieldControl
            label="Visibility"
            htmlFor="field-visibility"
            helpText={FIELD_HELP_TEXT.visibility}
          >
            <select
              id="field-visibility"
              value={form.publicOnly ? "public" : "internal"}
              onChange={(event) => updateForm("publicOnly", event.target.value === "public")}
              className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </FieldControl>
          <FieldControl
            label="Description"
            htmlFor="field-description"
            helpText={FIELD_HELP_TEXT.description}
            className="md:col-span-2"
          >
            <Textarea
              id="field-description"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              rows={3}
            />
          </FieldControl>
          <FieldControl
            label="Partner Help Text"
            htmlFor="field-help-text"
            helpText={FIELD_HELP_TEXT.helpText}
            className="md:col-span-2"
          >
            <Textarea
              id="field-help-text"
              value={form.helpText}
              onChange={(event) => updateForm("helpText", event.target.value)}
              rows={3}
            />
          </FieldControl>
          <div className="flex flex-wrap gap-6 md:col-span-2">
            <CheckboxFieldControl
              label="Filterable"
              helpText={FIELD_HELP_TEXT.filterable}
              checked={form.filterableOnly}
              onCheckedChange={(checked) => updateForm("filterableOnly", checked)}
            />
            <CheckboxFieldControl
              label="Required"
              helpText={FIELD_HELP_TEXT.required}
              checked={form.required}
              onCheckedChange={(checked) => updateForm("required", checked)}
            />
          </div>
          {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Field"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FieldControl({
  label,
  htmlFor,
  required,
  helpText,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  helpText?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
      {children}
    </div>
  );
}

function CheckboxFieldControl({
  label,
  helpText,
  checked,
  onCheckedChange,
}: {
  label: string;
  helpText: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex max-w-xs items-start gap-2 text-sm font-medium">
      <Checkbox
        checked={checked}
        className="mt-0.5"
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span>{label}</span>
        <span className="text-xs font-normal leading-snug text-muted-foreground">{helpText}</span>
      </span>
    </label>
  );
}

function CategoryCombobox({
  id,
  value,
  options,
  disabled,
  required,
  onValueChange,
  onValueCommit,
  onBlur,
  onKeyDown,
}: {
  id: string;
  value: string;
  options: string[];
  disabled?: boolean;
  required?: boolean;
  onValueChange: (value: string) => void;
  onValueCommit?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const query = value.trim().toLowerCase();
  const uniqueOptions = useMemo(() => {
    return getUniqueCategoryOptions(options);
  }, [options]);
  const matchingOptions = useMemo(() => {
    if (!query) {
      return uniqueOptions;
    }

    return uniqueOptions.filter((option) => {
      const label = formatCategoryLabel(option).toLowerCase();
      return option.toLowerCase().includes(query) || label.includes(query);
    });
  }, [query, uniqueOptions]);
  const exactMatch = uniqueOptions.some((option) => isSameCategoryOption(value, option));
  const customCategory = normalizeCategoryValue(value);

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          globalThis.setTimeout(() => setIsOpen(false), 120);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
        disabled={disabled}
        required={required}
        autoFocus={Boolean(onBlur)}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
      />
      {isOpen && !disabled ? (
        <div
          id={`${id}-options`}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg"
          role="listbox"
        >
          {matchingOptions.map((option) => (
            <button
              key={option}
              type="button"
              className="flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onValueChange(option);
                onValueCommit?.(option);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={isSameCategoryOption(value, option)}
            >
              <span className="font-medium text-foreground">{formatCategoryLabel(option)}</span>
              <span className="text-xs text-muted-foreground">Existing category</span>
            </button>
          ))}

          {customCategory && !exactMatch ? (
            <button
              type="button"
              className="mt-1 flex w-full flex-col rounded-sm border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onValueChange(customCategory);
                onValueCommit?.(customCategory);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={false}
            >
              <span className="font-medium text-primary">
                Create new category "{customCategory}"
              </span>
              <span className="text-xs text-muted-foreground">
                Saving with this value will create it.
              </span>
            </button>
          ) : null}

          {!matchingOptions.length && !customCategory ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Type to search or create a category.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function BulkEditDialog({
  categories,
  selectedCount,
  isSaving,
  onClose,
  onSubmit,
}: {
  categories: string[];
  selectedCount: number;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: BulkEditPayload) => Promise<void>;
}) {
  const [categoryEnabled, setCategoryEnabled] = useState(false);
  const [category, setCategory] = useState(categories[0] ?? "");
  const [visibilityEnabled, setVisibilityEnabled] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "internal">("public");
  const [filterableEnabled, setFilterableEnabled] = useState(false);
  const [filterableOnly, setFilterableOnly] = useState(true);
  const [requiredEnabled, setRequiredEnabled] = useState(false);
  const [required, setRequired] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const payload: BulkEditPayload = {};

    if (categoryEnabled) {
      if (!category.trim()) {
        setError("Category is required.");
        return;
      }
      payload.category = getCanonicalCategoryValue(category, categories);
    }

    if (visibilityEnabled) {
      payload.publicOnly = visibility === "public";
    }

    if (filterableEnabled) {
      payload.filterableOnly = filterableOnly;
    }

    if (requiredEnabled) {
      payload.required = required;
    }

    if (Object.keys(payload).length === 0) {
      setError("Choose at least one bulk edit.");
      return;
    }

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4">
      <form
        className="w-full max-w-xl rounded-md border border-border bg-background shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-xl font-semibold">Bulk Edit Fields</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Apply changes to {selectedCount} selected {selectedCount === 1 ? "field" : "fields"}.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <BulkEditOption
            checked={categoryEnabled}
            label="Set category"
            onCheckedChange={setCategoryEnabled}
          >
            <CategoryCombobox
              id="bulk-edit-category"
              value={category}
              options={categories}
              onValueChange={setCategory}
              disabled={!categoryEnabled}
            />
          </BulkEditOption>

          <BulkEditOption
            checked={visibilityEnabled}
            label="Set visibility"
            onCheckedChange={setVisibilityEnabled}
          >
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as "public" | "internal")}
              disabled={!visibilityEnabled}
              className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </BulkEditOption>

          <BulkEditOption
            checked={filterableEnabled}
            label="Set filterable"
            onCheckedChange={setFilterableEnabled}
          >
            <select
              value={filterableOnly ? "yes" : "no"}
              onChange={(event) => setFilterableOnly(event.target.value === "yes")}
              disabled={!filterableEnabled}
              className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
            >
              <option value="yes">Filterable</option>
              <option value="no">Not filterable</option>
            </select>
          </BulkEditOption>

          <BulkEditOption
            checked={requiredEnabled}
            label="Set required"
            onCheckedChange={setRequiredEnabled}
          >
            <select
              value={required ? "yes" : "no"}
              onChange={(event) => setRequired(event.target.value === "yes")}
              disabled={!requiredEnabled}
              className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
            >
              <option value="yes">Required</option>
              <option value="no">Not required</option>
            </select>
          </BulkEditOption>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? "Applying..." : "Apply Bulk Edit"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function BulkEditOption({
  checked,
  label,
  onCheckedChange,
  children,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-4">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
        {label}
      </label>
      {children}
    </div>
  );
}

function DeleteFieldDialog({
  field,
  isDeleting,
  onClose,
  onConfirm,
}: {
  field: AdminCustomListingField;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4">
      <div className="w-full max-w-md rounded-md border border-border bg-background shadow-2xl">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-xl font-semibold">Delete Custom Field</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Delete {field.label}? Existing listing values with this key will no longer be managed by
            the custom field dashboard.
          </p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Field"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getInitialFormState(state: FieldDialogState): FieldFormState {
  return {
    key: "",
    label: "",
    description: "",
    category: state.category,
    helpText: "",
    publicOnly: true,
    filterableOnly: true,
    required: false,
  };
}

function getCategoryStats(fields: AdminCustomListingField[]) {
  const stats = new Map<string, { category: string; label: string; count: number }>();

  for (const field of fields) {
    const category = normalizeCategoryValue(field.category);
    const current = stats.get(category);
    if (current) {
      current.count += 1;
    } else {
      stats.set(category, {
        category,
        label: formatCategoryLabel(category),
        count: 1,
      });
    }
  }

  return Array.from(stats.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function groupFields(fields: AdminCustomListingField[]) {
  const groups = new Map<
    string,
    {
      category: string;
      label: string;
      fields: AdminCustomListingField[];
    }
  >();

  for (const field of fields) {
    const category = normalizeCategoryValue(field.category);
    const group = groups.get(category);

    if (group) {
      group.fields.push(field);
    } else {
      groups.set(category, {
        category,
        label: formatCategoryLabel(category),
        fields: [field],
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function getDisplayGroups(input: {
  activeCategory: string;
  expandedCategories: Set<string>;
  groupedFields: Array<{
    category: string;
    label: string;
    fields: AdminCustomListingField[];
  }>;
  isFiltered: boolean;
}): DisplayGroup[] {
  return input.groupedFields.map((group, groupIndex) => {
    const isExpanded = input.expandedCategories.has(group.category);
    const shouldCollapse =
      input.activeCategory === "all" && !input.isFiltered && groupIndex > 0 && !isExpanded;
    const visibleFields = shouldCollapse ? group.fields.slice(0, 3) : group.fields;

    return {
      ...group,
      visibleFields,
      hiddenCount: group.fields.length - visibleFields.length,
    };
  });
}

function sortFields(fields: AdminCustomListingField[]) {
  return [...fields].sort((a, b) => {
    const byCategory = formatCategoryLabel(a.category).localeCompare(
      formatCategoryLabel(b.category),
    );
    return byCategory || compareCategoryFields(a, b);
  });
}

function sortCategoryFields(fields: AdminCustomListingField[]) {
  return [...fields].sort(compareCategoryFields);
}

function compareCategoryFields(a: AdminCustomListingField, b: AdminCustomListingField) {
  const bySortOrder = a.sortOrder - b.sortOrder;
  if (bySortOrder !== 0) {
    return bySortOrder;
  }

  return a.label.localeCompare(b.label);
}

function moveItemToInsertionIndex<T>(items: T[], fromIndex: number, insertionIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);

  if (!item) {
    return nextItems;
  }

  const adjustedIndex = fromIndex < insertionIndex ? insertionIndex - 1 : insertionIndex;
  const boundedIndex = Math.max(0, Math.min(adjustedIndex, nextItems.length));

  nextItems.splice(boundedIndex, 0, item);
  return nextItems;
}

function getInsertionIndexForPointer(input: {
  category: string;
  fields: AdminCustomListingField[];
  pointerY: number;
  rowRect: DOMRect;
  targetFieldId: string;
}) {
  const categoryFields = sortCategoryFields(
    input.fields.filter((field) => field.category === input.category),
  );
  const targetIndex = categoryFields.findIndex((field) => field.id === input.targetFieldId);

  if (targetIndex < 0) {
    return 0;
  }

  const position =
    input.pointerY < input.rowRect.top + input.rowRect.height / 2 ? "before" : "after";
  return position === "after" ? targetIndex + 1 : targetIndex;
}

function shouldShowDropIndicator(input: {
  draggingField: DraggingField;
  fields: AdminCustomListingField[];
  insertionIndex: number;
}) {
  const categoryFields = sortCategoryFields(
    input.fields.filter((field) => field.category === input.draggingField.category),
  );
  const draggedIndex = categoryFields.findIndex(
    (field) => field.id === input.draggingField.fieldId,
  );

  return (
    draggedIndex >= 0 &&
    input.insertionIndex !== draggedIndex &&
    input.insertionIndex !== draggedIndex + 1
  );
}

function sortVisibleFields(
  fields: AdminCustomListingField[],
  sortKey: SortKey,
  direction: SortDirection,
) {
  const factor = direction === "asc" ? 1 : -1;

  return [...fields].sort((a, b) => {
    const compare = compareBySortKey(a, b, sortKey);
    if (compare !== 0) {
      return compare * factor;
    }

    return (a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)) * factor;
  });
}

function compareBySortKey(
  a: AdminCustomListingField,
  b: AdminCustomListingField,
  sortKey: SortKey,
) {
  switch (sortKey) {
    case "label":
      return a.label.localeCompare(b.label);
    case "key":
      return a.key.localeCompare(b.key);
    case "category":
      return formatCategoryLabel(a.category).localeCompare(formatCategoryLabel(b.category));
    case "description":
      return (a.description ?? "").localeCompare(b.description ?? "");
    case "helpText":
      return (a.helpText ?? "").localeCompare(b.helpText ?? "");
    case "visibility":
      return Number(a.publicOnly) - Number(b.publicOnly);
    case "filterable":
      return Number(a.filterableOnly) - Number(b.filterableOnly);
    case "required":
      return Number(a.required) - Number(b.required);
  }
}

function nextSortOrder(fields: AdminCustomListingField[], category: string) {
  const normalizedCategory = normalizeCategoryValue(category);
  const orders = fields
    .filter((field) => normalizeCategoryValue(field.category) === normalizedCategory)
    .map((field) => field.sortOrder);

  return orders.length > 0 ? Math.max(...orders) + 1 : 1;
}

function formatCategoryLabel(category: string) {
  return category
    .split(/\s*&\s*/)
    .map((part) =>
      part
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" & ");
}

function getCanonicalCategoryValue(value: string, categories: string[]) {
  const normalizedValue = normalizeCategoryValue(value);
  const match = categories.find((category) => isSameCategoryOption(normalizedValue, category));
  return match ? normalizeCategoryValue(match) : normalizedValue;
}

function isSameCategoryOption(value: string, option: string) {
  const normalizedValue = normalizeCategoryValue(value);
  const normalizedOption = normalizeCategoryValue(option);
  return (
    normalizedValue === normalizedOption ||
    normalizedValue === normalizeCategoryValue(formatCategoryLabel(option))
  );
}

function normalizeCategoryValue(value: string) {
  return value.trim().toUpperCase();
}

function getUniqueCategoryOptions(categories: string[]) {
  const seen = new Set<string>();
  const uniqueCategories: string[] = [];

  for (const category of categories) {
    const normalizedCategory = normalizeCategoryValue(category);
    if (!normalizedCategory || seen.has(normalizedCategory)) {
      continue;
    }

    seen.add(normalizedCategory);
    uniqueCategories.push(normalizedCategory);
  }

  return uniqueCategories;
}

function normalizeFieldCategory(field: AdminCustomListingField) {
  return {
    ...field,
    category: normalizeCategoryValue(field.category),
  };
}

function normalizeFieldCategories(fields: AdminCustomListingField[]) {
  return fields.map(normalizeFieldCategory);
}

function normalizeCategoryPayload<T extends { category?: string }>(payload: T) {
  if (!payload.category) {
    return payload;
  }

  return {
    ...payload,
    category: normalizeCategoryValue(payload.category),
  };
}

function slugifyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeKeyDraft(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
}

function nullableTrim(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function isFormControlTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
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
