import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  migrations: {
    // Aquí es donde Prisma 7 busca el comando ahora
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
