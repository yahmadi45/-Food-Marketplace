INSERT INTO avis (user_id, restaurant_id, note, commentaire) VALUES
(2, 1, 5, 'Excellent service et plats délicieux ! Recommande vivement.'),
(2, 2, 4, 'Très bon sushi, livraison rapide.'),
(2, 3, 4, 'Burgers savoureux, mais attente un peu longue.');

INSERT INTO restaurants (nom, description, image, adresse, horaires, type_cuisine, note_moyenne, temps_livraison_estime, is_active) VALUES
('La Table Méditerranéenne', 'Cuisine fraîche et du marché.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
 '12 Av. Habib Bourguiba, Tunis', '11h-23h', 'Méditerranéenne', 4.60, 35, 1),
('Sushi Zen', 'Sushis et makis signatures.', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=400&fit=crop',
 '5 Rue de Carthage, La Marsa', '12h-22h30', 'Japonaise', 4.80, 40, 1),
('Grill Station', 'Burgers et viandes grillées.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop',
 'Zone industrielle Ariana', '11h-minuit', 'Américaine', 4.20, 25, 1);

INSERT INTO plats (restaurant_id, nom, description, prix, image, categorie, is_available) VALUES
(1, 'Salade niçoise', 'Thon, œufs, olives', 14.500, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', 'Entrees', 1),
(1, 'Soupe aux légumes', 'Maison du jour', 9.000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', 'Entrees', 1),
(1, 'Dorade grillée', 'Légumes de saison', 32.000, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', 'Plats', 1),
(1, 'Pâtes pesto', 'Basilic frais', 18.750, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop', 'Plats', 1),
(1, 'Tiramisu', 'Espresso mascarpone', 11.000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', 'Desserts', 1),
(1, 'Citronnade artisanale', 'Menthe fraîche', 6.500, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', 'Boissons', 1),
(2, 'California Roll', 'Avocat, crab stick', 16.500, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Entrees', 1),
(2, 'Sashimi saumon', '6 pièces', 24.000, 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop', 'Plats', 1),
(2, 'Gyoza vapeur', '6 pièces', 12.000, 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop', 'Entrees', 1),
(2, 'Mochi assortis', '3 parfums', 9.500, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'Desserts', 1),
(2, 'Thé vert glacé', '500ml', 5.500, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', 'Boissons', 1),
(3, 'Burger classic', 'Double steak, cheddar', 19.000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', 'Plats', 1),
(3, 'Wings BBQ', '8 pièces', 15.000, 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?w=400&h=300&fit=crop', 'Entrees', 1),
(3, 'Brownie fondant', 'Chocolat noir', 8.000, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop', 'Desserts', 1),
(3, 'Milkshake vanille', 'Crème glacée', 10.000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', 'Boissons', 1);
