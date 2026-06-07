// prisma.config.ts
// Prisma 7+ — configurazione datasource con adapter MariaDB (MySQL/MariaDB)

import path from "node:path";
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const { PrismaMariaDb } = await import("@prisma/adapter-mariadb");
      return new PrismaMariaDb(process.env.DATABASE_URL!);
    },
  },
});
