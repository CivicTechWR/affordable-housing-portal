import * as React from "react";

import { cn } from "@/lib/utils";

function DialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4",
        className,
      )}
      {...props}
    />
  );
}

function DialogPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-md border border-border bg-background shadow-2xl",
        className,
      )}
      {...props}
    />
  );
}

function DialogFormPanel({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      className={cn(
        "w-full max-w-md rounded-md border border-border bg-background shadow-2xl",
        className,
      )}
      {...props}
    />
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-border px-6 py-5", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-xl font-semibold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />;
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
