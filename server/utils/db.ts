import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from '../database/schema'

let dbInstance: ReturnType<typeof drizzle> | null = null

export const useDb = () => {
  if (dbInstance) return dbInstance

  const connection = mysql.createPool({
    host: process.env.DB_HOST || '192.144.167.138',
    port: Number(process.env.DB_PORT) || 7306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Gaohp@990421',
    database: process.env.DB_NAME || 'prompt_dev',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  
  dbInstance = drizzle(connection, { schema, mode: 'default' })
  return dbInstance
}
