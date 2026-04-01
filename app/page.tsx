import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  GridViewIcon,
  MapsLocation01Icon,
} from "@hugeicons/core-free-icons";

const routes = [
  {
    href: "/listings",
    label: "Listings",
    description: "Assembled search layout with sidebar, filters, and map.",
    icon: MapsLocation01Icon,
  },
  {
    href: "/preview",
    label: "Component Preview",
    description: "Inspect UI components in isolation with mock data.",
    icon: GridViewIcon,
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-background px-6 pt-32">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Affordable Housing Portal
          </h1>
          <p className="text-sm text-muted-foreground">Dev navigation</p>
        </div>

        <div className="flex flex-col gap-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                <HugeiconsIcon icon={route.icon} className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{route.label}</p>
                <p className="text-xs text-muted-foreground truncate">{route.description}</p>
              </div>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="size-4 text-muted-foreground/50 group-hover:text-foreground"
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
