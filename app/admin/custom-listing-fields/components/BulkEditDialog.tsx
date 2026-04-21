"use client";

import { type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Control, useForm } from "react-hook-form";

import {
  bulkEditDialogSchema,
  getDefaultBulkEditDialogValues,
  toBulkEditPayload,
  type BulkEditDialogValues,
} from "../custom-listing-fields-dashboard-forms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { type BulkEditPayload } from "../custom-listing-fields-dashboard-utils";
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
  const form = useForm<BulkEditDialogValues>({
    resolver: zodResolver(bulkEditDialogSchema),
    defaultValues: getDefaultBulkEditDialogValues(categories),
  });
  const categoryEnabled = form.watch("categoryEnabled");
  const visibilityEnabled = form.watch("visibilityEnabled");
  const filterableEnabled = form.watch("filterableEnabled");
  const requiredEnabled = form.watch("requiredEnabled");

  const handleSubmit = async (values: BulkEditDialogValues) => {
    if (isSaving) {
      return;
    }

    try {
      await onSubmit(toBulkEditPayload(values, categories));
    } catch (caught) {
      form.setError("root", {
        message: caught instanceof Error ? caught.message : "Unable to update selected fields.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4">
      <Form {...form}>
        <form
          className="w-full max-w-xl rounded-md border border-border bg-background shadow-2xl"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-xl font-semibold">Bulk Edit Fields</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Apply changes to {selectedCount} selected {selectedCount === 1 ? "field" : "fields"}.
            </p>
          </div>

          <div className="space-y-5 px-6 py-5">
            <BulkEditOption
              control={form.control}
              name="categoryEnabled"
              label="Set category"
              disabled={isSaving}
            >
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <CategoryCombobox
                      id="bulk-edit-category"
                      value={field.value}
                      options={categories}
                      onValueChange={field.onChange}
                      disabled={!categoryEnabled || isSaving}
                    />
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </BulkEditOption>

            <BulkEditOption
              control={form.control}
              name="visibilityEnabled"
              label="Set visibility"
              disabled={isSaving}
            >
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!visibilityEnabled || isSaving}
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
            </BulkEditOption>

            <BulkEditOption
              control={form.control}
              name="filterableEnabled"
              label="Set filterable"
              disabled={isSaving}
            >
              <FormField
                control={form.control}
                name="filterableOnly"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <select
                        value={field.value ? "yes" : "no"}
                        onChange={(event) => field.onChange(event.target.value === "yes")}
                        disabled={!filterableEnabled || isSaving}
                        className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
                      >
                        <option value="yes">Filterable</option>
                        <option value="no">Not filterable</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </BulkEditOption>

            <BulkEditOption
              control={form.control}
              name="requiredEnabled"
              label="Set required"
              disabled={isSaving}
            >
              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <select
                        value={field.value ? "yes" : "no"}
                        onChange={(event) => field.onChange(event.target.value === "yes")}
                        disabled={!requiredEnabled || isSaving}
                        className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 md:text-xs"
                      >
                        <option value="yes">Required</option>
                        <option value="no">Not required</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </BulkEditOption>

            {form.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            ) : null}
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
      </Form>
    </div>
  );
}

function BulkEditOption({
  control,
  name,
  label,
  disabled,
  children,
}: {
  control: Control<BulkEditDialogValues>;
  name: "categoryEnabled" | "visibilityEnabled" | "filterableEnabled" | "requiredEnabled";
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-4">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={field.value}
                  disabled={disabled}
                  onCheckedChange={(value) => field.onChange(value === true)}
                />
                {label}
              </label>
            </FormControl>
          </FormItem>
        )}
      />
      {children}
    </div>
  );
}
