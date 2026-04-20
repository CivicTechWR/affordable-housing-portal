import Link from "next/link";

export default function ListingNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-lg rounded-lg border border-border bg-background p-6 text-center shadow-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">404</p>
        <h1 className="mt-2">Listing not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The listing you requested does not exist or is no longer available.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/listings"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse listings
          </Link>
          <Link
            href="/"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
