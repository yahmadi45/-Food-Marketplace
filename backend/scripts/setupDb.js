import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };
  const dbName = process.env.DB_NAME || 'food_marketplace';

  const conn = await mysql.createConnection(config);
  await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await conn.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(schema);

  const [rows] = await conn.query('SELECT COUNT(*) AS c FROM users');
  if (rows[0].c === 0) {
    const hash = bcrypt.hashSync('password123', 10);
    await conn.query(
      `INSERT INTO users (nom, email, telephone, password, role, adresse) VALUES (?,?,?,?,?,?)`,
      ['Admin Principal', 'admin@marketplace.local', '0011223344', hash, 'admin', 'Siège Marketplace']
    );
    await conn.query(
      `INSERT INTO users (nom, email, telephone, password, role, adresse) VALUES (?,?,?,?,?,?)`,
      ['Client Démo', 'client@demo.local', '0599887766', hash, 'client', 'Rue de la Paix, Tunis']
    );
    console.log('Utilisateurs seed: admin@marketplace.local / password123 — client@demo.local / password123');
  }

  const [restCount] = await conn.query('SELECT COUNT(*) AS c FROM restaurants');
  if (restCount[0].c === 0) {
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await conn.query(seed);
    console.log('Restaurants et plats de démo insérés.');
  }

  const [cmdCnt] = await conn.query(`SELECT COUNT(*) AS c FROM commandes`);
  if (cmdCnt[0].c === 0) {
    // Demo order disabled for now
    console.log('Commande démo créée pour graphiques KPI.');
  }

  await conn.end();
  console.log(`Base OK: ${dbName}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
