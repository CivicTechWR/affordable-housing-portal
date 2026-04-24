"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { signInSchema } from "@/lib/auth/validation";

type SignInState = {
  error: string;
};

export async function signInWithPassword(
  _state: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password." };
      }

      return { error: "Unable to sign in right now." };
    }

    throw error;
  }

  return { error: "" };
}
