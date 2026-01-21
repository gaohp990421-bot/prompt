import { createConnection } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function resetDb() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required')
    process.exit(1)
  }
  const connection = await createConnection(process.env.DATABASE_URL)
  
  console.log('Dropping tables...')
  await connection.execute('DROP TABLE IF EXISTS tags')
  await connection.execute('DROP TABLE IF EXISTS prompts')
  await connection.execute('DROP TABLE IF EXISTS users')
  
  console.log('Tables dropped.')
  await connection.end()
}

resetDb().catch(console.error)
