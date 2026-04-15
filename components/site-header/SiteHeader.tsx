import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative flex h-14 items-center justify-center bg-primary px-6 shrink-0">
      <Link href="/" className="text-lg font-semibold text-primary-foreground tracking-tight">
        WR Housing Bridge
      </Link>
      <nav className="absolute right-6 flex items-center gap-6">
        <Link
          href="/listings"
          className="rounded-full bg-primary-foreground/20 px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          Browse Listings
        </Link>
      </nav>
    </header>
  );
}
