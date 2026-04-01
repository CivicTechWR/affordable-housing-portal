import { NextRequest } from "next/server";

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
  // TODO: authenticate request (admin only)
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
  // TODO: authenticate request (admin only)
  const body = await request.json();

  // TODO: validate body schema
  // TODO: create account in database
  // TODO: optionally send invite email
  void body;

  return Response.json(
    { message: "Account created", data: { id: "placeholder-id", ...body } },
    { status: 201 }
  );
}
