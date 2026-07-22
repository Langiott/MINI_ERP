import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// L'adapter dice a Prisma come parlare con PostgreSQL.
// In Prisma 7 la connessione non sta piu' nello schema.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Un'unica istanza per tutta l'applicazione.
export const prisma = new PrismaClient({ adapter });
