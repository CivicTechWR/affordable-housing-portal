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
  DialogDescription,
  DialogFooter,
  DialogFormPanel,
  DialogHeader,
  DialogOverlay,
  DialogPanel,
  DialogTitle,
  useDialogOpenerFocus,
} from "@/components/ui/dialog-shell";
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
import { NativeSelect } from "@/components/ui/native-select";
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
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const normalizedCategories = getUniqueCategoryOptions(categories);
  const form = useForm<CreateFieldDialogValues>({
    resolver: zodResolver(createFieldDialogSchema),
    defaultValues: getDefaultCreateFieldDialogValues(state),
  });
  const { isDirty } = form.formState;
  const restoreFocusToOpener = useDialogOpenerFocus();

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

  const requestClose = () => {
    if (isSaving) {
      return;
    }

    if (isDirty) {
      setDiscardConfirmOpen(true);
      return;
    }

    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      requestClose();
    }
  };

  const handleDismiss = (event: Event) => {
    if (isSaving) {
      event.preventDefault();
      return;
    }

    if (isDirty) {
      event.preventDefault();
      setDiscardConfirmOpen(true);
    }
  };

  return (
    <DialogOverlay className="py-6" open onOpenChange={handleOpenChange}>
      <Form {...form}>
        <DialogFormPanel
          onSubmit={form.handleSubmit(handleSubmit)}
          className="max-h-[92vh] max-w-4xl overflow-y-auto"
          onCloseAutoFocus={restoreFocusToOpener}
          onEscapeKeyDown={handleDismiss}
          onInteractOutside={handleDismiss}
        >
          <DialogHeader className="flex items-start justify-between">
            <div>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>
                Configure how this field appears on listing forms, listing pages, and filters.
              </DialogDescription>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={requestClose}
              disabled={isSaving}
            >
              Close
            </button>
          </DialogHeader>

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
                    <NativeSelect
                      value={field.value ? "public" : "internal"}
                      onChange={(event) => field.onChange(event.target.value === "public")}
                      disabled={isSaving}
                    >
                      <option value="public">Public</option>
                      <option value="internal">Internal</option>
                    </NativeSelect>
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

          <DialogFooter className="border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={requestClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogFormPanel>
      </Form>

      <DialogOverlay open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <DialogPanel>
          <DialogHeader>
            <DialogTitle>Discard Custom Field?</DialogTitle>
            <DialogDescription className="mt-2">
              You have unsaved changes. Discard this custom field and lose the entered values?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setDiscardConfirmOpen(false)}
            >
              Keep Editing
            </Button>
            <Button type="button" variant="destructive" size="lg" onClick={onClose}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogPanel>
      </DialogOverlay>
    </DialogOverlay>
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
