"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

type SignInState = {
  error: string;
};

export async function signInWithPassword(
  _state: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
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
