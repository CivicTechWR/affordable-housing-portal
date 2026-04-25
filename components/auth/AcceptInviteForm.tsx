"use client";

import { useActionState } from "react";

import { acceptInviteAction } from "@/app/invite/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InviteState = {
  error: string;
};

const initialState: InviteState = {
  error: "",
};

export function AcceptInviteForm({ token, email }: Readonly<{ token: string; email: string }>) {
  const [state, action, pending] = useActionState(acceptInviteAction, initialState);

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <AuthCard
        title="Create your password"
        description={email}
        footer={
          <Button type="submit" size="sm" className="rounded-full px-4" disabled={pending}>
            {pending ? "Saving..." : "Set password"}
          </Button>
        }
      >
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-foreground">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      </AuthCard>
    </form>
  );
}
