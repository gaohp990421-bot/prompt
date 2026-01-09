import { createConnection } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function resetDb() {
  const connection = await createConnection(process.env.DATABASE_URL || 'mysql://root:123456@localhost:3306/prompt_dev')
  
  console.log('Dropping tables...')
  await connection.execute('DROP TABLE IF EXISTS tags')
  await connection.execute('DROP TABLE IF EXISTS prompts')
  await connection.execute('DROP TABLE IF EXISTS users')
  
  console.log('Tables dropped.')
  await connection.end()
}

resetDb().catch(console.error)
