import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use DATABASE_URL if provided (e.g. locally), otherwise use the default
const dbUrl = process.env.DATABASE_URL || 'file:dev.db';
console.log('Prisma initializing with adapter for:', dbUrl);

// Pass the config object directly to the adapter. 
// The adapter will handle creating the better-sqlite3 instance internally.
const adapter = new PrismaBetterSqlite3({
  url: dbUrl
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
