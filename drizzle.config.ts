import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'mysql',
  schema: './server/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: '192.144.167.138',
    port: 7306,
    user: 'root',
    password: 'Gaohp@990421',
    database: 'prompt_dev',
  },
})
