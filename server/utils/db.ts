import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from '../database/schema'

let dbInstance: ReturnType<typeof drizzle> | null = null

export const useDb = () => {
  if (dbInstance) return dbInstance

  const connection = mysql.createPool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  
  dbInstance = drizzle(connection as any, { schema, mode: 'default' })
  return dbInstance
}
