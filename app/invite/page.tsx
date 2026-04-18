import Link from "next/link";

import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPendingInviteByToken } from "@/lib/auth/invite-store";

type InvitePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const resolvedSearchParams = await searchParams;
  const tokenValue = resolvedSearchParams.token;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;

  if (!token) {
    return <InvalidInviteState />;
  }

  const invite = await getPendingInviteByToken(token);

  if (!invite) {
    return <InvalidInviteState />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--color-muted)_0%,_transparent_45%),linear-gradient(180deg,_var(--color-background)_0%,_color-mix(in_oklab,var(--color-background),black_4%)_100%)] px-6 py-20">
      <AcceptInviteForm token={token} email={invite.user.email} />
    </main>
  );
}

function InvalidInviteState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-20">
      <Card className="w-full max-w-md border border-border/80 shadow-xl shadow-black/5">
        <CardHeader className="border-b border-border/60">
          <CardTitle>Invite unavailable</CardTitle>
          <CardDescription>
            This invite link is missing, expired, or has already been used.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/sign-in">Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
