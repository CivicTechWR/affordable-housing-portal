import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    seed: `ts-node ${path.join(__dirname, 'prisma', 'seed.ts')}`,
  },
});
