import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertBannerVariants = cva("rounded-md border text-sm", {
  variants: {
    variant: {
      error: "border-destructive/20 bg-destructive/5 text-destructive",
      success: "border-primary/20 bg-primary/5 text-foreground",
      info: "border-border bg-muted/60 text-muted-foreground",
    },
    size: {
      default: "px-4 py-3",
      sm: "px-3 py-2",
      flush: "rounded-none border-x-0 px-4 py-2",
      lg: "rounded-lg p-8",
    },
  },
  defaultVariants: {
    variant: "info",
    size: "default",
  },
});

function AlertBanner({
  className,
  variant,
  size,
  role,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertBannerVariants>) {
  return (
    <div
      role={role ?? (variant === "error" ? "alert" : "status")}
      className={cn(alertBannerVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { AlertBanner, alertBannerVariants };
