import mysql from 'mysql2/promise';

const required = ['DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'APP_DB_PASSWORD'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}

const username = process.env.APP_DB_USER || 'marketplace_app';
const database = process.env.DB_NAME;
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
});

try {
  const escapedUser = connection.escapeId(username);
  const escapedDatabase = connection.escapeId(database);
  const escapedPassword = connection.escape(process.env.APP_DB_PASSWORD);
  await connection.query(`CREATE USER IF NOT EXISTS ${escapedUser}@'%' IDENTIFIED BY ${escapedPassword}`);
  await connection.query(`ALTER USER ${escapedUser}@'%' IDENTIFIED BY ${escapedPassword}`);
  await connection.query(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ${escapedDatabase}.* TO ${escapedUser}@'%'`,
  );
  console.log(`Least-privilege database user '${username}' is ready.`);
} finally {
  await connection.end();
}
