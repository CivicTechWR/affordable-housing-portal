import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOptionalSession } from "@/lib/auth/session";
import { findPendingAccountInvites } from "@/lib/auth/invite-store";
import { getAccountsService } from "@/lib/accounts/account.service";
import type { AccountListResponse } from "@/shared/schemas/account-management";
import { AppPageShell, PageMessage } from "@/components/page-shell/AppPageShell";

export const metadata: Metadata = {
  title: "Manage Users | WR Housing Bridge",
};

export const dynamic = "force-dynamic";

const pageLimit = 100;

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
});

async function getAllAccounts() {
  const firstPageResult = await getAccountsService({
    page: "1",
    limit: pageLimit.toString(),
  });

  if (!firstPageResult.ok) {
    return firstPageResult;
  }

  const firstPage = firstPageResult.value;

  if (firstPage.pagination.totalPages <= 1) {
    return {
      ok: true as const,
      value: firstPage,
    };
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.totalPages - 1 }, (_, index) =>
      getAccountsService({
        page: (index + 2).toString(),
        limit: pageLimit.toString(),
      }),
    ),
  );

  const failedPage = remainingPages.find((result) => !result.ok);

  if (failedPage && !failedPage.ok) {
    return failedPage;
  }

  const data = [
    ...firstPage.data,
    ...remainingPages.flatMap((result) => (result.ok ? result.value.data : [])),
  ];

  return {
    ok: true as const,
    value: {
      data,
      pagination: {
        ...firstPage.pagination,
        limit: data.length,
      },
    } satisfies AccountListResponse,
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  return dateTimeFormatter.format(new Date(value));
}

function roleBadgeVariant(role: AccountListResponse["data"][number]["role"]) {
  switch (role) {
    case "admin":
      return "default" as const;
    case "partner":
      return "secondary" as const;
    case "user":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function statusBadgeVariant(status: AccountListResponse["data"][number]["status"]) {
  switch (status) {
    case "active":
      return "secondary" as const;
    case "invited":
      return "outline" as const;
    case "suspended":
      return "destructive" as const;
    case "deactivated":
      return "ghost" as const;
    default:
      return "outline" as const;
  }
}

function formatRole(role: AccountListResponse["data"][number]["role"]) {
  switch (role) {
    case "partner":
      return "Housing Lister";
    case "user":
      return "Housing Searcher";
    case "admin":
      return "Admin";
    default:
      return "Unknown";
  }
}

function formatStatus(status: AccountListResponse["data"][number]["status"]) {
  switch (status) {
    case "active":
      return "Active";
    case "invited":
      return "Invited";
    case "suspended":
      return "Suspended";
    case "deactivated":
      return "Deactivated";
    default:
      return "Unknown";
  }
}

export default async function AdminUsersPage() {
  const { session, authzUser } = await getOptionalSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (authzUser?.role !== "admin") {
    return (
      <PageMessage title="Admin access required">Only admin accounts can manage users.</PageMessage>
    );
  }

  const result = await getAllAccounts();
  const pendingInvites = await findPendingAccountInvites();

  if (!result.ok) {
    return <PageMessage title="Unable to load users">{result.error.message}</PageMessage>;
  }

  const accounts = result.value.data;

  return (
    <AppPageShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Manage Users</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Review all portal accounts, their access levels, and recent activity.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/invite">Invite user</Link>
          </Button>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b bg-background py-4">
            <CardTitle>Pending invites</CardTitle>
          </CardHeader>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Invitee</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Invited</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvites.length > 0 ? (
                  pendingInvites.map((invite) => (
                    <tr key={invite.id} className="border-t border-border/80 align-top">
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{invite.name}</p>
                          <p className="text-xs text-muted-foreground">{invite.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {invite.organization ?? "Not provided"}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={roleBadgeVariant(invite.role)}>
                          {formatRole(invite.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">Pending</Badge>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatDateTime(invite.invitedAt.toISOString())}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatDateTime(invite.expiresAt.toISOString())}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-border/80">
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No active invites found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <CardContent className="grid gap-4 p-4 lg:hidden">
            {pendingInvites.length > 0 ? (
              pendingInvites.map((invite) => (
                <div key={invite.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{invite.name}</p>
                      <p className="text-sm text-muted-foreground">{invite.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={roleBadgeVariant(invite.role)}>
                        {formatRole(invite.role)}
                      </Badge>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Organization</dt>
                      <dd className="mt-1 text-foreground">
                        {invite.organization ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Invited</dt>
                      <dd className="mt-1 text-foreground">
                        {formatDateTime(invite.invitedAt.toISOString())}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Expires</dt>
                      <dd className="mt-1 text-foreground">
                        {formatDateTime(invite.expiresAt.toISOString())}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                No active invites found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b bg-background py-4">
            <CardTitle>User directory</CardTitle>
          </CardHeader>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-t border-border/80 align-top">
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {account.name ?? account.email ?? "Unnamed user"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.email ?? "No email"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {account.organization ?? "Not provided"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={roleBadgeVariant(account.role)}>
                        {formatRole(account.role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusBadgeVariant(account.status)}>
                        {formatStatus(account.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <div className="space-y-1">
                        <p>{formatDateTime(account.createdAt)}</p>
                        <p className="text-xs">Updated {formatDateTime(account.updatedAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDateTime(account.lastLoginAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CardContent className="grid gap-4 p-4 lg:hidden">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {account.name ?? account.email ?? "Unnamed user"}
                    </p>
                    <p className="text-sm text-muted-foreground">{account.email ?? "No email"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={roleBadgeVariant(account.role)}>
                      {formatRole(account.role)}
                    </Badge>
                    <Badge variant={statusBadgeVariant(account.status)}>
                      {formatStatus(account.status)}
                    </Badge>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Organization</dt>
                    <dd className="mt-1 text-foreground">
                      {account.organization ?? "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="mt-1 text-foreground">{formatDateTime(account.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="mt-1 text-foreground">{formatDateTime(account.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last login</dt>
                    <dd className="mt-1 text-foreground">{formatDateTime(account.lastLoginAt)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppPageShell>
  );
}
