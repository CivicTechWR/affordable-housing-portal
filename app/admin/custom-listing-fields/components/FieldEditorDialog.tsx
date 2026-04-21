"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Control, useForm } from "react-hook-form";

import {
  createFieldDialogSchema,
  getDefaultCreateFieldDialogValues,
  toCreateFieldDialogPayload,
  type CreateFieldDialogValues,
} from "../custom-listing-fields-dashboard-forms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FIELD_HELP_TEXT,
  type CreateFieldDialogPayload,
  type FieldDialogState,
  getUniqueCategoryOptions,
  normalizeKeyDraft,
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
  const [keyWasEdited, setKeyWasEdited] = useState(false);
  const normalizedCategories = getUniqueCategoryOptions(categories);
  const form = useForm<CreateFieldDialogValues>({
    resolver: zodResolver(createFieldDialogSchema),
    defaultValues: getDefaultCreateFieldDialogValues(state),
  });

  const handleLabelChange = (label: string) => {
    form.setValue("label", label, { shouldDirty: true, shouldValidate: true });

    if (!keyWasEdited) {
      form.setValue("key", slugifyKey(label), { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleSubmit = async (values: CreateFieldDialogValues) => {
    if (isSaving) {
      return;
    }

    try {
      await onCreate(toCreateFieldDialogPayload(values, categories));
    } catch (caught) {
      form.setError("root", {
        message: caught instanceof Error ? caught.message : "Unable to save custom field.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
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
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-foreground">Label *</FormLabel>
                  <FormDescription className="text-xs">{FIELD_HELP_TEXT.label}</FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => handleLabelChange(event.target.value)}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-foreground">Key *</FormLabel>
                  <FormDescription className="text-xs">{FIELD_HELP_TEXT.key}</FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        setKeyWasEdited(true);
                        field.onChange(normalizeKeyDraft(event.target.value));
                      }}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-foreground">Category *</FormLabel>
                  <FormDescription className="text-xs">{FIELD_HELP_TEXT.category}</FormDescription>
                  <CategoryCombobox
                    id="field-category"
                    value={field.value}
                    options={normalizedCategories}
                    onValueChange={field.onChange}
                    disabled={isSaving}
                    required
                  />
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publicOnly"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-foreground">Visibility</FormLabel>
                  <FormDescription className="text-xs">
                    {FIELD_HELP_TEXT.visibility}
                  </FormDescription>
                  <FormControl>
                    <select
                      value={field.value ? "public" : "internal"}
                      onChange={(event) => field.onChange(event.target.value === "public")}
                      disabled={isSaving}
                      className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
                    >
                      <option value="public">Public</option>
                      <option value="internal">Internal</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormTextArea
              control={form.control}
              name="description"
              label="Description"
              helpText={FIELD_HELP_TEXT.description}
              disabled={isSaving}
            />
            <FormTextArea
              control={form.control}
              name="helpText"
              label="Partner Help Text"
              helpText={FIELD_HELP_TEXT.helpText}
              disabled={isSaving}
            />

            <div className="flex flex-wrap gap-6 md:col-span-2">
              <CheckboxFieldControl
                control={form.control}
                name="filterableOnly"
                label="Filterable"
                helpText={FIELD_HELP_TEXT.filterable}
                disabled={isSaving}
              />
              <CheckboxFieldControl
                control={form.control}
                name="required"
                label="Required"
                helpText={FIELD_HELP_TEXT.required}
                disabled={isSaving}
              />
            </div>
            {form.formState.errors.root?.message ? (
              <p className="text-sm text-destructive md:col-span-2">
                {form.formState.errors.root.message}
              </p>
            ) : null}
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
      </Form>
    </div>
  );
}

function FormTextArea({
  control,
  name,
  label,
  helpText,
  disabled,
}: {
  control: Control<CreateFieldDialogValues>;
  name: "description" | "helpText";
  label: string;
  helpText: string;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5 md:col-span-2">
          <FormLabel className="text-xs font-medium text-foreground">{label}</FormLabel>
          <FormDescription className="text-xs">{helpText}</FormDescription>
          <FormControl>
            <Textarea {...field} rows={3} disabled={disabled} />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

function CheckboxFieldControl({
  control,
  name,
  label,
  helpText,
  disabled,
}: {
  control: Control<CreateFieldDialogValues>;
  name: "filterableOnly" | "required";
  label: string;
  helpText: string;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <label className="flex max-w-xs items-start gap-2 text-sm font-medium">
              <Checkbox
                checked={field.value}
                disabled={disabled}
                className="mt-0.5"
                onCheckedChange={(value) => field.onChange(value === true)}
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span>{label}</span>
                <span className="text-xs font-normal leading-snug text-muted-foreground">
                  {helpText}
                </span>
              </span>
            </label>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
