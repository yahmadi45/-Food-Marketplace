import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_marketplace',
};

async function showDatabase() {
  try {
    const conn = await mysql.createConnection(config);

    console.log('=== TABLES ===');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(tables.map(row => Object.values(row)[0]).join('\n'));

    console.log('\n=== USERS ===');
    const [users] = await conn.query('SELECT id, nom, email, role FROM users');
    console.table(users);

    console.log('\n=== RESTAURANTS ===');
    const [restaurants] = await conn.query('SELECT id, nom, type_cuisine, note_moyenne FROM restaurants');
    console.table(restaurants);

    console.log('\n=== PLATS ===');
    const [plats] = await conn.query('SELECT id, nom, prix, categorie FROM plats LIMIT 10');
    console.table(plats);

    console.log('\n=== COMMANDES ===');
    const [commandes] = await conn.query('SELECT id, user_id, restaurant_id, statut, total FROM commandes LIMIT 5');
    console.table(commandes);

    await conn.end();
  } catch (error) {
    console.error('Erreur de connexion:', error.message);
  }
}

showDatabase();