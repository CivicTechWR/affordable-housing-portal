import Link from "next/link";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { auth, signOut } from "@/auth";
import { getOptionalSession } from "@/lib/auth/session";

export async function SiteHeader() {
  const [rawSession, optionalSession] = await Promise.all([auth(), getOptionalSession()]);
  const session = optionalSession.session;
  const navPillClass =
    "rounded-full bg-primary-foreground/20 px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/30";

  return (
    <header
      data-site-header="true"
      className="relative flex h-14 items-center justify-center bg-primary px-6 shrink-0"
    >
      <Link href="/" className="text-lg font-semibold text-primary-foreground tracking-tight">
        WR Housing Bridge
      </Link>
      <nav className="absolute right-6 flex items-center gap-2">
        <Link href="/listings" className={navPillClass}>
          Browse Listings
        </Link>

        {rawSession?.user ? (
          <>
            {session?.user ? (
              <span className="inline-flex max-w-56 items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1.5 text-sm font-medium text-primary-foreground">
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} size={16} />
                <span className="truncate">{session.user.name ?? session.user.email}</span>
              </span>
            ) : null}

            <form
              action={async () => {
                "use server";

                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className={navPillClass}>
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/sign-in" className={navPillClass}>
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
