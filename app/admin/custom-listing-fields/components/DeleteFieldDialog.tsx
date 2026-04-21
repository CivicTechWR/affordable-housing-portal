import { Button } from "@/components/ui/button";
import type { AdminCustomListingField } from "@/shared/schemas/custom-listing-fields";

export function DeleteFieldDialog({
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
