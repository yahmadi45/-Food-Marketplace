import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'food_marketplace',
});

try {
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Database tables:');
  console.table(tables);

  for (const [label, sql] of [
    ['Users', 'SELECT id, nom, email, role FROM users ORDER BY id'],
    ['Active restaurants', 'SELECT id, nom, type_cuisine, note_moyenne FROM restaurants WHERE is_active = 1 ORDER BY id'],
    ['Available dishes (first 10)', 'SELECT id, nom, prix, categorie FROM plats WHERE is_available = 1 ORDER BY id LIMIT 10'],
    ['Recent orders (first 5)', 'SELECT id, user_id, restaurant_id, statut_livraison, total FROM commandes ORDER BY id DESC LIMIT 5'],
  ]) {
    const [rows] = await connection.query(sql);
    console.log(label);
    console.table(rows);
  }
} catch (error) {
  console.error(`Database inspection failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await connection.end();
}
