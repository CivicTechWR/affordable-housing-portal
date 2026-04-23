import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/SignInForm";
import { getOptionalSession } from "@/lib/auth/session";

export default async function SignInPage() {
  const rawSession = await auth();
  const { session } = await getOptionalSession(rawSession);

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--color-muted)_0%,_transparent_45%),linear-gradient(180deg,_var(--color-background)_0%,_color-mix(in_oklab,var(--color-background),black_4%)_100%)] px-6 py-20">
      <SignInForm />
    </main>
  );
}
