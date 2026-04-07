import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

type SqlClient = ReturnType<typeof postgres>;
type Database = ReturnType<typeof createDatabase>;

const globalForDatabase = globalThis as typeof globalThis & {
  __ahpSqlClient?: SqlClient;
  __ahpDatabase?: Database;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment before using the database.",
    );
  }

  return databaseUrl;
}

function createSqlClient() {
  // prepare: false disables prepared statements, which is required when
  // connecting through a connection pooler (e.g. PgBouncer) in transaction mode.
  // If you connect directly to Postgres without a pooler, you can remove this
  // flag to enable prepared statements for better query performance.
  return postgres(getDatabaseUrl(), {
    prepare: false,
  });
}

function createDatabase() {
  const sqlClient = globalForDatabase.__ahpSqlClient ?? createSqlClient();

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.__ahpSqlClient = sqlClient;
  }

  return drizzle(sqlClient, { schema });
}

export const db = globalForDatabase.__ahpDatabase ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__ahpDatabase = db;
}
