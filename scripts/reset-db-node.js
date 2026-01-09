import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '192.144.167.138',
    port: 7306,
    user: 'root',
    password: 'Gaohp@990421',
    database: 'prompt_dev'
  });

  console.log('Dropping tables...');
  await connection.execute('DROP TABLE IF EXISTS tags');
  await connection.execute('DROP TABLE IF EXISTS prompts');
  await connection.execute('DROP TABLE IF EXISTS users');
  console.log('Tables dropped.');
  await connection.end();
}

main().catch(console.error);
