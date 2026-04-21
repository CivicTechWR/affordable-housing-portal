"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FIELD_HELP_TEXT,
  type CreateFieldDialogPayload,
  type FieldDialogState,
  type FieldFormState,
  getCanonicalCategoryValue,
  getInitialFormState,
  getUniqueCategoryOptions,
  normalizeKeyDraft,
  nullableTrim,
  slugifyKey,
} from "../custom-listing-fields-dashboard-utils";
import { CategoryCombobox } from "./CategoryCombobox";

export function FieldEditorDialog({
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

    if (isSaving) {
      return;
    }

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
            disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
              className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
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
              disabled={isSaving}
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
              disabled={isSaving}
            />
          </FieldControl>
          <div className="flex flex-wrap gap-6 md:col-span-2">
            <CheckboxFieldControl
              label="Filterable"
              helpText={FIELD_HELP_TEXT.filterable}
              checked={form.filterableOnly}
              disabled={isSaving}
              onCheckedChange={(checked) => updateForm("filterableOnly", checked)}
            />
            <CheckboxFieldControl
              label="Required"
              helpText={FIELD_HELP_TEXT.required}
              checked={form.required}
              disabled={isSaving}
              onCheckedChange={(checked) => updateForm("required", checked)}
            />
          </div>
          {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSaving}>
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
  disabled,
  onCheckedChange,
}: {
  label: string;
  helpText: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex max-w-xs items-start gap-2 text-sm font-medium">
      <Checkbox
        checked={checked}
        disabled={disabled}
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
