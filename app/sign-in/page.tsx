import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/SignInForm";
import { getSafeCallbackPath } from "@/lib/auth/callback-url";
import { getOptionalSession } from "@/lib/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ session }, resolvedSearchParams] = await Promise.all([
    getOptionalSession(),
    searchParams,
  ]);
  const callbackPath = getSafeCallbackPath(resolvedSearchParams.callbackUrl);

  if (session?.user) {
    redirect(callbackPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--color-muted)_0%,_transparent_45%),linear-gradient(180deg,_var(--color-background)_0%,_color-mix(in_oklab,var(--color-background),black_4%)_100%)] px-6 py-20">
      <SignInForm callbackUrl={callbackPath} />
    </main>
  );
}
