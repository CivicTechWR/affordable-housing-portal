"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type BulkEditPayload,
  getCanonicalCategoryValue,
} from "../custom-listing-fields-dashboard-utils";
import { CategoryCombobox } from "./CategoryCombobox";

export function BulkEditDialog({
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

    if (isSaving) {
      return;
    }

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
            disabled={isSaving}
            onCheckedChange={setCategoryEnabled}
          >
            <CategoryCombobox
              id="bulk-edit-category"
              value={category}
              options={categories}
              onValueChange={setCategory}
              disabled={!categoryEnabled || isSaving}
            />
          </BulkEditOption>

          <BulkEditOption
            checked={visibilityEnabled}
            label="Set visibility"
            disabled={isSaving}
            onCheckedChange={setVisibilityEnabled}
          >
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as "public" | "internal")}
              disabled={!visibilityEnabled || isSaving}
              className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </BulkEditOption>

          <BulkEditOption
            checked={filterableEnabled}
            label="Set filterable"
            disabled={isSaving}
            onCheckedChange={setFilterableEnabled}
          >
            <select
              value={filterableOnly ? "yes" : "no"}
              onChange={(event) => setFilterableOnly(event.target.value === "yes")}
              disabled={!filterableEnabled || isSaving}
              className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
            >
              <option value="yes">Filterable</option>
              <option value="no">Not filterable</option>
            </select>
          </BulkEditOption>

          <BulkEditOption
            checked={requiredEnabled}
            label="Set required"
            disabled={isSaving}
            onCheckedChange={setRequiredEnabled}
          >
            <select
              value={required ? "yes" : "no"}
              onChange={(event) => setRequired(event.target.value === "yes")}
              disabled={!requiredEnabled || isSaving}
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
  disabled,
  onCheckedChange,
  children,
}: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-4">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        {label}
      </label>
      {children}
    </div>
  );
}
