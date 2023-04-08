import { PrismaClient } from '@prisma/client';

export const prisma = global.prisma as PrismaClient || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;
