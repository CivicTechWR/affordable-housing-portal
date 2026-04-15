"use client";

import { useActionState } from "react";

import { signInWithPassword } from "@/app/sign-in/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState = {
  error: "",
};

export function SignInForm() {
  const [state, action, pending] = useActionState(signInWithPassword, initialState);

  return (
    <form action={action}>
      <Card className="w-full max-w-md border border-border/80 shadow-xl shadow-black/5">
        <CardHeader className="border-b border-border/60">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use the email address that was invited to the portal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              Email
            </label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        </CardContent>
        <CardFooter className="border-t border-border/60 pt-4">
          <Button type="submit" size="sm" className="rounded-full px-4" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
