import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient";
};

export function AuthPageShell({ children, className, variant = "gradient" }: AuthPageShellProps) {
  return (
    <main
      className={cn(
        "flex min-h-screen items-center justify-center px-6 py-20",
        variant === "gradient"
          ? "bg-[radial-gradient(circle_at_top,_var(--color-muted)_0%,_transparent_45%),linear-gradient(180deg,_var(--color-background)_0%,_color-mix(in_oklab,var(--color-background),black_4%)_100%)]"
          : "bg-background",
        className,
      )}
    >
      {children}
    </main>
  );
}
