import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'mysql',
  schema: './server/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
})
