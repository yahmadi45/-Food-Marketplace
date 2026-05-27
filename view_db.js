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

    console.log('=== TABLES DANS LA BASE DE DONNÉES ===');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(tables.map(row => Object.values(row)[0]).join('\n'));

    console.log('\n=== UTILISATEURS ===');
    const [users] = await conn.query('SELECT id, nom, email, role FROM users');
    console.table(users);

    console.log('\n=== RESTAURANTS ===');
    const [restaurants] = await conn.query('SELECT id, nom, type_cuisine, note_moyenne FROM restaurants WHERE is_active = 1');
    console.table(restaurants);

    console.log('\n=== PLATS (premiers 10) ===');
    const [plats] = await conn.query('SELECT id, nom, prix, categorie FROM plats WHERE is_available = 1 LIMIT 10');
    console.table(plats);

    console.log('\n=== COMMANDES (dernières 5) ===');
    const [commandes] = await conn.query('SELECT id, user_id, restaurant_id, statut, total FROM commandes ORDER BY id DESC LIMIT 5');
    console.table(commandes);

    await conn.end();
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error.message);
    console.log('\nPour accéder directement au prompt MySQL:');
    console.log('1. Ouvrir un terminal/cmd');
    console.log('2. Taper: mysql -u root -p (puis Enter pour mot de passe vide)');
    console.log('3. Taper: USE food_marketplace;');
    console.log('4. Taper: SHOW TABLES;');
    console.log('5. Taper: SELECT * FROM users; (pour voir les utilisateurs)');
    console.log('6. Taper: SELECT * FROM restaurants; (pour voir les restaurants)');
  }
}

showData();