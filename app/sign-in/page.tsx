import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
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
    <AuthPageShell>
      <SignInForm callbackUrl={callbackPath} />
    </AuthPageShell>
  );
}
