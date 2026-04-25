import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPanel,
  DialogTitle,
  useDialogOpenerFocus,
} from "@/components/ui/dialog-shell";
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
  const restoreFocusToOpener = useDialogOpenerFocus();

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  const preventDismissWhileDeleting = (event: Event) => {
    if (isDeleting) {
      event.preventDefault();
    }
  };

  return (
    <DialogOverlay open onOpenChange={handleOpenChange}>
      <DialogPanel
        onCloseAutoFocus={restoreFocusToOpener}
        onEscapeKeyDown={preventDismissWhileDeleting}
        onInteractOutside={preventDismissWhileDeleting}
      >
        <DialogHeader>
          <DialogTitle>Delete Custom Field</DialogTitle>
          <DialogDescription className="mt-2">
            Delete {field.label}? Existing listing values with this key will no longer be managed by
            the custom field dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
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
        </DialogFooter>
      </DialogPanel>
    </DialogOverlay>
  );
}
