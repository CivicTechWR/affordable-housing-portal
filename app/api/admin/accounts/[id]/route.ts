import { NextRequest } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/accounts/:id
 *
 * Returns a single account by ID, including profile details,
 * role, associated organization, and account status.
 * Admin-only endpoint.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  // TODO: fetch account from database
  // TODO: return 404 if not found

  return Response.json({
    data: {
      id,
      email: null,
      name: null,
      role: null,
      organization: null,
      status: null,
      listingsCount: 0,
      lastLoginAt: null,
      createdAt: null,
      updatedAt: null,
    },
  });
}

/**
 * PUT /api/admin/accounts/:id
 *
 * Updates an account. Admin-only endpoint.
 *
 * Accepts a partial body. Common operations:
 *   - Change role
 *   - Suspend / reactivate account
 *   - Update organization association
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  const body = await request.json();

  // TODO: validate body schema
  // TODO: update account in database
  void body;

  return Response.json({
    message: "Account updated",
    data: { id },
  });
}

/**
 * DELETE /api/admin/accounts/:id
 *
 * Deactivates (soft-deletes) an account. Admin-only endpoint.
 * Does not permanently erase data — the account is marked
 * as deactivated and the user can no longer sign in.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  // TODO: soft-delete account in database
  // TODO: revoke active sessions

  return Response.json({
    message: "Account deactivated",
    data: { id },
  });
}
