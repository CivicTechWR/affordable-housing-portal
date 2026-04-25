import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function AppPageShell({ children, className }: AppPageShellProps) {
  return (
    <main className={cn("min-h-[calc(100vh-7rem)] bg-muted/40 px-4 py-8 sm:px-6", className)}>
      {children}
    </main>
  );
}

type PageMessageProps = {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  tone?: "default" | "error";
  width?: "3xl" | "5xl";
};

export function PageMessage({
  title,
  children,
  className,
  contentClassName,
  titleClassName,
  tone = "default",
  width = "3xl",
}: PageMessageProps) {
  return (
    <AppPageShell className={cn("bg-muted/60 px-6 py-10", className)}>
      <div
        className={cn(
          "mx-auto rounded-md border border-border bg-background p-6",
          width === "3xl" ? "max-w-3xl" : "max-w-5xl",
          contentClassName,
        )}
      >
        <h1 className={cn("text-xl font-semibold", titleClassName)}>{title}</h1>
        <p
          className={cn(
            "mt-2 text-sm",
            tone === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {children}
        </p>
      </div>
    </AppPageShell>
  );
}
