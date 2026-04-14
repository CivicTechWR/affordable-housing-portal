import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex h-14 items-center bg-primary px-6 shrink-0">
      <Link href="/" className="text-lg font-semibold text-primary-foreground tracking-tight">
        WR Housing Bridge
      </Link>
    </header>
  );
}