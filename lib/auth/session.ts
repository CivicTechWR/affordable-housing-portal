import "server-only";

import { auth } from "@/auth";
import { isUserAllowedToSignIn } from "@/lib/auth/user-store";

type SessionGuardResult = {
  response: Response | null;
  session: Awaited<ReturnType<typeof auth>>;
};

export async function requireSession() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.status === undefined ||
    !isUserAllowedToSignIn(session.user.status)
  ) {
    return {
      response: new Response("Unauthorized", { status: 401 }),
      session: null,
    } satisfies SessionGuardResult;
  }

  return {
    response: null,
    session,
  } satisfies SessionGuardResult;
}

export async function requireAdminSession() {
  const result = await requireSession();

  if (result.response) {
    return result;
  }

  if (result.session?.user.role !== "admin") {
    return {
      response: new Response("Forbidden", { status: 403 }),
      session: null,
    } satisfies SessionGuardResult;
  }

  return result;
}

export async function requireListingWriteSession() {
  const result = await requireSession();

  if (result.response) {
    return result;
  }

  if (result.session?.user.role !== "admin" && result.session?.user.role !== "partner") {
    return {
      response: new Response("Forbidden", { status: 403 }),
      session: null,
    } satisfies SessionGuardResult;
  }

  return result;
}
