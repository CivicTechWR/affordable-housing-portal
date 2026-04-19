import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserForSession, isUserAllowedToSignIn } from "@/lib/auth/user-store";

type SessionErrorBody = {
  message: string;
};

type SessionGuardResult = {
  response: NextResponse<SessionErrorBody> | null;
  session: Awaited<ReturnType<typeof auth>>;
  authzUser: Awaited<ReturnType<typeof getUserForSession>>;
};

export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
      authzUser: null,
    } satisfies SessionGuardResult;
  }

  const authzUser = await getUserForSession(session.user.id);

  if (!authzUser || !isUserAllowedToSignIn(authzUser.status)) {
    return {
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
      authzUser: null,
    } satisfies SessionGuardResult;
  }

  return {
    response: null,
    session,
    authzUser,
  } satisfies SessionGuardResult;
}

export async function requireAdminSession() {
  const result = await requireSession();

  if (result.response) {
    return result;
  }

  if (result.authzUser?.role !== "admin") {
    return {
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
      session: null,
      authzUser: null,
    } satisfies SessionGuardResult;
  }

  return result;
}

export async function requireListingWriteSession() {
  const result = await requireSession();

  if (result.response) {
    return result;
  }

  if (result.authzUser?.role !== "admin" && result.authzUser?.role !== "partner") {
    return {
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
      session: null,
      authzUser: null,
    } satisfies SessionGuardResult;
  }

  return result;
}
