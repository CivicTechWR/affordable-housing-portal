import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const emptyStateVariants = cva("border border-dashed text-center text-muted-foreground", {
  variants: {
    size: {
      default: "rounded-xl border-border bg-background px-4 py-8 text-sm",
      sm: "rounded-md px-3 py-4 text-xs",
      spacious: "rounded-lg px-4 py-10 text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function EmptyState({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyStateVariants>) {
  return <div className={cn(emptyStateVariants({ size, className }))} {...props} />;
}

export { EmptyState, emptyStateVariants };
