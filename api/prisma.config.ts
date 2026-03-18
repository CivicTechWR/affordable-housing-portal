import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: `ts-node ${path.join(__dirname, 'prisma', 'seed.ts')}`,
  },
});
