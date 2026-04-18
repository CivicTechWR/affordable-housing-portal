import { NextRequest } from "next/server";

import { createInvite } from "@/lib/auth/invite-service";
import { requireAdminSession } from "@/lib/auth/session";
import { createAccountInviteSchema } from "@/lib/auth/validation";

/**
 * GET /api/admin/accounts
 *
 * Returns a paginated list of user accounts.
 * Admin-only endpoint.
 *
 * Supports query params:
 *   - ?page=1&limit=20
 *   - ?role=provider|seeker|admin
 *   - ?status=active|suspended|pending
 *   - ?search=email-or-name
 */
export async function GET(request: NextRequest) {
  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  const { searchParams } = request.nextUrl;

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  // TODO: query database with filters
  void [page, limit, role, status, search];

  return Response.json({
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  });
}

/**
 * POST /api/admin/accounts
 *
 * Creates a new user account (admin-provisioned).
 * Admin-only endpoint.
 *
 * Expected body:
 * {
 *   email: string
 *   name: string
 *   role: "provider" | "seeker" | "admin"
 *   organization?: string       // for housing providers
 *   sendInviteEmail?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  const { response, session } = await requireAdminSession();

  if (response || !session) {
    return response ?? new Response("Forbidden", { status: 403 });
  }

  const body = await request.json();
  const parsed = createAccountInviteSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid account invite payload." },
      { status: 400 },
    );
  }

  const invite = await createInvite({
    email: parsed.data.email,
    fullName: parsed.data.name,
    role: parsed.data.role,
    invitedByUserId: session.user.id,
    sendInviteEmail: parsed.data.sendInviteEmail === true,
  });

  return Response.json(
    {
      message: "Account invited",
      data: {
        id: invite.userId,
        email: invite.email,
        name: parsed.data.name,
        role: parsed.data.role,
        inviteUrl: invite.inviteUrl,
      },
    },
    { status: 201 },
  );
}
