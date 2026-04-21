import { and, eq, ilike, or, type SQL } from "drizzle-orm";

import { users, type UserRole, type UserStatus } from "@/db/schema";

export type AccountFilterSpecification = SQL<unknown> | undefined;

export function accountRoleSpecification(role: UserRole | undefined): AccountFilterSpecification {
  if (!role) {
    return undefined;
  }

  return eq(users.role, role);
}

export function accountStatusSpecification(
  status: UserStatus | undefined,
): AccountFilterSpecification {
  if (!status) {
    return undefined;
  }

  return eq(users.status, status);
}

export function accountSearchSpecification(search: string | undefined): AccountFilterSpecification {
  if (!search) {
    return undefined;
  }

  const searchTerm = `%${search}%`;

  return or(
    ilike(users.email, searchTerm),
    ilike(users.fullName, searchTerm),
    ilike(users.organization, searchTerm),
  );
}

export function andAccountSpecifications(
  ...specifications: AccountFilterSpecification[]
): AccountFilterSpecification {
  const activeSpecifications = specifications.filter(
    (specification): specification is SQL<unknown> => specification !== undefined,
  );

  if (activeSpecifications.length === 0) {
    return undefined;
  }

  return and(...activeSpecifications);
}
