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

async function showData() {
  try {
    const conn = await mysql.createConnection(config);

    console.log('=== TABLES ===');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(tables.map(row => Object.values(row)[0]).join('\n'));

    console.log('\n=== USERS ===');
    const [users] = await conn.query('SELECT id, nom, email, role FROM users');
    users.forEach(u => console.log(`${u.id}: ${u.nom} (${u.email}) - ${u.role}`));

    console.log('\n=== RESTAURANTS ===');
    const [restaurants] = await conn.query('SELECT id, nom, type_cuisine FROM restaurants WHERE is_active = 1');
    restaurants.forEach(r => console.log(`${r.id}: ${r.nom} - ${r.type_cuisine}`));

    console.log('\n=== PLATS ===');
    const [plats] = await conn.query('SELECT p.nom, r.nom as restaurant FROM plats p JOIN restaurants r ON p.restaurant_id = r.id LIMIT 5');
    plats.forEach(p => console.log(`${p.nom} (${p.restaurant})`));

    await conn.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

showData();