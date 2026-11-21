import bcrypt from 'bcryptjs';
import pool from '../src/db.js';

const demoUser = {
  nom: 'Client Démo',
  email: 'client@demo.local',
  telephone: '0599887766',
  password: process.env.DEMO_USER_PASSWORD || '',
  adresse: 'Rue de la Paix, Tunis',
};

const restaurants = [
  {
    nom: 'La Table Méditerranéenne', description: 'Cuisine fraîche et du marché.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
    adresse: '12 Av. Habib Bourguiba, Tunis', horaires: '11h-23h', cuisine: 'Méditerranéenne', note: 4.6, delivery: 35,
    dishes: [
      ['Salade niçoise', 'Thon, œufs, olives', 14.5, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', 'Entrees'],
      ['Soupe aux légumes', 'Maison du jour', 9, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', 'Entrees'],
      ['Dorade grillée', 'Légumes de saison', 32, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', 'Plats'],
      ['Pâtes pesto', 'Basilic frais', 18.75, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop', 'Plats'],
      ['Tiramisu', 'Espresso mascarpone', 11, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', 'Desserts'],
      ['Citronnade artisanale', 'Menthe fraîche', 6.5, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', 'Boissons'],
    ],
    review: [5, 'Service rapide et plats délicieux.'],
  },
  {
    nom: 'Sushi Zen', description: 'Sushis et makis signatures.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=400&fit=crop',
    adresse: '5 Rue de Carthage, La Marsa', horaires: '12h-22h30', cuisine: 'Japonaise', note: 4.8, delivery: 40,
    dishes: [
      ['California Roll', 'Avocat, crab stick', 16.5, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Entrees'],
      ['Sashimi saumon', '6 pièces', 24, 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop', 'Plats'],
      ['Gyoza vapeur', '6 pièces', 12, 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop', 'Entrees'],
      ['Mochi assortis', '3 parfums', 9.5, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'Desserts'],
      ['Thé vert glacé', '500ml', 5.5, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', 'Boissons'],
    ],
    review: [4, 'Très bons sushis, livraison rapide.'],
  },
  {
    nom: 'Grill Station', description: 'Burgers et viandes grillées.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop',
    adresse: 'Zone industrielle Ariana', horaires: '11h-minuit', cuisine: 'Américaine', note: 4.2, delivery: 25,
    dishes: [
      ['Burger classic', 'Double steak, cheddar', 19, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', 'Plats'],
      ['Wings BBQ', '8 pièces', 15, 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?w=400&h=300&fit=crop', 'Entrees'],
      ['Brownie fondant', 'Chocolat noir', 8, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop', 'Desserts'],
      ['Milkshake vanille', 'Crème glacée', 10, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', 'Boissons'],
    ],
    review: [4, 'Burgers savoureux et portions généreuses.'],
  },
];

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to create or reset demo data when NODE_ENV=production.');
  }
  if (!demoUser.password || demoUser.password.length < 12) {
    throw new Error('Set DEMO_USER_PASSWORD to a unique password of at least 12 characters before seeding demo data.');
  }

  const passwordHash = await bcrypt.hash(demoUser.password, 10);
  const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [demoUser.email]);
  let userId = users[0]?.id;
  if (!userId) {
    const [result] = await pool.execute(
      'INSERT INTO users (nom, email, telephone, password, role, adresse) VALUES (?, ?, ?, ?, ?, ?)',
      [demoUser.nom, demoUser.email, demoUser.telephone, passwordHash, 'client', demoUser.adresse],
    );
    userId = result.insertId;
  } else {
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, userId]);
  }

  let dishCount = 0;
  for (const restaurant of restaurants) {
    const [existing] = await pool.execute('SELECT id FROM restaurants WHERE nom = ? LIMIT 1', [restaurant.nom]);
    let restaurantId = existing[0]?.id;
    if (!restaurantId) {
      const [result] = await pool.execute(
        `INSERT INTO restaurants
          (nom, description, image, adresse, horaires, type_cuisine, note_moyenne, temps_livraison_estime, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [restaurant.nom, restaurant.description, restaurant.image, restaurant.adresse, restaurant.horaires, restaurant.cuisine, restaurant.note, restaurant.delivery],
      );
      restaurantId = result.insertId;
    }

    for (const [name, description, price, image, category] of restaurant.dishes) {
      const [existingDish] = await pool.execute(
        'SELECT id FROM plats WHERE restaurant_id = ? AND nom = ? LIMIT 1',
        [restaurantId, name],
      );
      if (!existingDish.length) {
        await pool.execute(
          'INSERT INTO plats (restaurant_id, nom, description, prix, image, categorie, is_available) VALUES (?, ?, ?, ?, ?, ?, 1)',
          [restaurantId, name, description, price, image, category],
        );
      }
      dishCount += 1;
    }

    const [existingReview] = await pool.execute(
      'SELECT id FROM avis WHERE user_id = ? AND restaurant_id = ? LIMIT 1',
      [userId, restaurantId],
    );
    if (!existingReview.length) {
      await pool.execute(
        'INSERT INTO avis (user_id, restaurant_id, note, commentaire) VALUES (?, ?, ?, ?)',
        [userId, restaurantId, restaurant.review[0], restaurant.review[1]],
      );
    }
  }

  console.log(`Demo seed complete: ${restaurants.length} restaurants, ${dishCount} dishes.`);
  await pool.end();
}

main().catch(async (error) => {
  console.error('Demo seed failed:', error.message);
  await pool.end();
  process.exit(1);
});
