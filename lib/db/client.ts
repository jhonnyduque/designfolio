import { drizzle } from "drizzle-orm/mysql2"
import { createPool, type Pool } from "mysql2/promise"
import * as schema from "./schema"

let pool: Pool | undefined

export function getPool(): Pool {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL no está configurada.")
  pool ??= createPool({ uri: url, timezone: "Z", connectionLimit: 10 })
  return pool
}

export function getDb() {
  return drizzle({ client: getPool(), schema, mode: "default" })
}
