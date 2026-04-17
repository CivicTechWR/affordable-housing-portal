import { defineConfig } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (see .env.example) before running Drizzle commands.",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    prefix: "timestamp",
  },
  strict: true,
  verbose: true,
});
