"use server";

import { signOut } from "@/auth";

export async function signOutFromHeader() {
  await signOut({ redirectTo: "/" });
}
