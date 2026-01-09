import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from '../database/schema'

let dbInstance: ReturnType<typeof drizzle> | null = null

export const useDb = () => {
  if (dbInstance) return dbInstance

  const connection = mysql.createPool({
    host: '192.144.167.138',
    port: 7306,
    user: 'root',
    password: 'Gaohp@990421',
    database: 'prompt_dev',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  
  dbInstance = drizzle(connection, { schema, mode: 'default' })
  return dbInstance
}
