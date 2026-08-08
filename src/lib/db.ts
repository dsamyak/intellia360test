/**
 * Prisma client singleton.
 *
 * Prisma 7 requires a driver adapter. We use @prisma/adapter-pg with the `pg`
 * pool. In development, Next.js hot-reload would create a new PrismaClient on
 * every module reload, quickly exhausting database connections. We store the
 * instance on the Node.js global object so it survives hot-reloads.
 */
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
