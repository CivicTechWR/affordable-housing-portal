"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type DialogOverlayProps = React.ComponentProps<"div"> &
  Pick<React.ComponentProps<typeof DialogPrimitive.Root>, "open" | "onOpenChange">;

type DialogContentDismissProps = Pick<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "onEscapeKeyDown" | "onInteractOutside"
>;

function DialogOverlay({ className, open, onOpenChange, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
        <div
          className={cn("fixed inset-0 z-50 flex items-center justify-center px-4", className)}
          {...props}
        />
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DialogPanel({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Content
      className={cn(
        "w-full max-w-md rounded-md border border-border bg-background shadow-2xl",
        className,
      )}
      {...props}
    />
  );
}

function DialogFormPanel({
  className,
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: React.ComponentProps<"form"> & DialogContentDismissProps) {
  return (
    <DialogPrimitive.Content asChild {...{ onEscapeKeyDown, onInteractOutside }}>
      <form
        className={cn(
          "w-full max-w-md rounded-md border border-border bg-background shadow-2xl",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Content>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-border px-6 py-5", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-xl font-semibold", className)} {...props} />;
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex justify-end gap-3 px-6 py-4", className)} {...props} />;
}

export {
  DialogDescription,
  DialogFooter,
  DialogFormPanel,
  DialogHeader,
  DialogOverlay,
  DialogPanel,
  DialogTitle,
};
