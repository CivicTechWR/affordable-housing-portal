import Link from "next/link";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { auth, signOut } from "@/auth";
import { HeaderBreadcrumbs } from "@/components/site-header/HeaderBreadcrumbs";
import { HeaderMobileMenu } from "@/components/site-header/HeaderMobileMenu";
import { getOptionalSession } from "@/lib/auth/session";

export async function SiteHeader() {
  const rawSession = await auth();
  const optionalSession = await getOptionalSession(rawSession);
  const session = optionalSession.session;
  const canCreateListing =
    optionalSession.authzUser?.role === "admin" || optionalSession.authzUser?.role === "partner";
  const navPillClass =
    "rounded-full bg-primary-foreground/20 px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/30";

  return (
    <header data-site-header="true" className="bg-primary text-primary-foreground shrink-0">
      <div className="w-full px-4 sm:px-6">
        <div className="relative flex min-h-14 items-center justify-center py-2">
          <Link href="/" className="text-lg font-semibold tracking-tight text-primary-foreground">
            WR Housing Bridge
          </Link>

          <nav className="absolute right-0 hidden items-center gap-2 lg:flex">
            {rawSession?.user ? (
              <>
                {canCreateListing ? (
                  <>
                    <Link href="/my-listings" className={navPillClass}>
                      My Listings
                    </Link>
                  </>
                ) : null}

                {optionalSession.authzUser?.role === "admin" ? (
                  <Link href="/admin/custom-listing-fields" className={navPillClass}>
                    Field Dashboard
                  </Link>
                ) : null}

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

          <HeaderMobileMenu
            isSignedIn={Boolean(rawSession?.user)}
            isAdmin={optionalSession.authzUser?.role === "admin"}
            canCreateListing={canCreateListing}
            user={session?.user ?? null}
          />
        </div>

        <div className="border-t border-primary-foreground/15 py-2.5">
          <HeaderBreadcrumbs />
        </div>
      </div>
    </header>
  );
}
