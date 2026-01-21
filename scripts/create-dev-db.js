import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
    console.error('Error: Required environment variables not set (DB_HOST, DB_PASSWORD)');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
  });

  const dbName = process.env.DB_NAME || 'prompt_platform';
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  console.log(`Database ${dbName} created or already exists.`);
  await connection.end();
}

main().catch(console.error);
