import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Verifica se esta em ambiente Turso (Vercel)
  if (process.env.TURSO_DATABASE_URL) {
    // Turso/libsql para producao
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    return new PrismaClient({ adapter: new PrismaLibSQL(libsql) })
  }

  // SQLite local para desenvolvimento
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
