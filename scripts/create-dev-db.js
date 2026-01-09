import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '192.144.167.138',
    port: 7306,
    user: 'root',
    password: 'Gaohp@990421',
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS prompt_dev');
  console.log('Database prompt_dev created or already exists.');
  await connection.end();
}

main().catch(console.error);
