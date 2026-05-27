import { Router } from 'express';
import { query, execute } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

/** --- Dashboard KPI & stats --- */
router.get('/dashboard', async (_req, res) => {
  try {
    const [rj] = await query(
      `SELECT COALESCE(SUM(total),0) AS ventes_jour FROM commandes
       WHERE DATE(date) = CURDATE() AND statut_livraison <> 'annulee'`
    );
    const [rm] = await query(
      `SELECT COALESCE(SUM(total),0) AS ventes_mois FROM commandes
       WHERE YEAR(date)=YEAR(NOW()) AND MONTH(date)=MONTH(NOW()) AND statut_livraison <> 'annulee'`
    );
    const [ra] = await query(
      `SELECT COALESCE(SUM(total),0) AS ventes_an FROM commandes
       WHERE YEAR(date)=YEAR(NOW()) AND statut_livraison <> 'annulee'`
    );
    const ventes_jour = Number(rj?.ventes_jour ?? 0);
    const ventes_mois = Number(rm?.ventes_mois ?? 0);
    const ventes_an = Number(ra?.ventes_an ?? 0);
    const [nb_cmd] = await query(`SELECT COUNT(*) AS n FROM commandes WHERE statut_livraison <> 'annulee'`);
    const [nb_clients] = await query(`SELECT COUNT(*) AS n FROM users WHERE role='client'`);
    const [nb_rest] = await query(`SELECT COUNT(*) AS n FROM restaurants WHERE is_active=1`);

    const caParJour = await query(
      `SELECT DATE(date) AS jour, SUM(total) AS ca FROM commandes
       WHERE statut_livraison <> 'annulee' AND date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
       GROUP BY DATE(date) ORDER BY jour`
    );
    const histoCmd = await query(
      `SELECT DATE(date) AS jour, COUNT(*) AS nb FROM commandes
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
       GROUP BY DATE(date) ORDER BY jour`
    );
    const ventesParResto = await query(
      `SELECT r.nom, SUM(c.total) AS ca FROM commandes c
       JOIN restaurants r ON r.id = c.restaurant_id
       WHERE c.statut_livraison <> 'annulee'
       GROUP BY r.id, r.nom ORDER BY ca DESC LIMIT 15`
    );
    const topPlats = await query(
      `SELECT p.nom, SUM(ci.quantite) AS vendus FROM commande_items ci
       JOIN plats p ON p.id = ci.plat_id
       JOIN commandes cmd ON cmd.id = ci.commande_id AND cmd.statut_livraison <> 'annulee'
       GROUP BY p.id, p.nom ORDER BY vendus DESC LIMIT 5`
    );
    const allPlatsVentes = await query(
      `SELECT p.id, p.nom, COALESCE(SUM(ci.quantite),0) AS vendus FROM plats p
       LEFT JOIN commande_items ci ON ci.plat_id = p.id
       LEFT JOIN commandes cmd ON cmd.id = ci.commande_id AND cmd.statut_livraison <> 'annulee'
       GROUP BY p.id, p.nom ORDER BY vendus ASC, p.nom LIMIT 5`
    );

    res.json({
      kpi: {
        ventes_jour: Number(ventes_jour),
        ventes_mois: Number(ventes_mois),
        ventes_an: Number(ventes_an),
        nombre_commandes: nb_cmd?.n ?? 0,
        nombre_clients: nb_clients?.n ?? 0,
        restaurants_actifs: nb_rest?.n ?? 0,
      },
      caParJour,
      histogramme_commandes: histoCmd,
      ventes_par_restaurant: ventesParResto,
      top_plats: topPlats,
      flop_plats: allPlatsVentes,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/** --- Restaurants CRUD --- */
router.get('/restaurants', async (_req, res) => {
  const rows = await query(`SELECT * FROM restaurants ORDER BY nom`);
  res.json(rows);
});

router.post('/restaurants', async (req, res) => {
  const b = req.body || {};
  const hdr = await execute(
    `INSERT INTO restaurants (nom, description, image, adresse, horaires, type_cuisine,
     note_moyenne, temps_livraison_estime, is_active)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      b.nom,
      b.description || null,
      b.image || null,
      b.adresse,
      b.horaires || null,
      b.type_cuisine,
      Number(b.note_moyenne ?? 4),
      Number(b.temps_livraison_estime ?? 30),
      b.is_active !== false ? 1 : 0,
    ]
  );
  const [row] = await query(`SELECT * FROM restaurants WHERE id = ?`, [hdr.insertId]);
  res.status(201).json(row);
});

router.put('/restaurants/:id', async (req, res) => {
  const b = req.body || {};
  await execute(
    `UPDATE restaurants SET nom=?, description=?, image=?, adresse=?, horaires=?, type_cuisine=?,
     note_moyenne=?, temps_livraison_estime=?, is_active=? WHERE id=?`,
    [
      b.nom,
      b.description ?? null,
      b.image ?? null,
      b.adresse,
      b.horaires ?? null,
      b.type_cuisine,
      Number(b.note_moyenne),
      Number(b.temps_livraison_estime),
      b.is_active ? 1 : 0,
      req.params.id,
    ]
  );
  const [row] = await query(`SELECT * FROM restaurants WHERE id = ?`, [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Introuvable' });
  res.json(row);
});

router.delete('/restaurants/:id', async (req, res) => {
  await execute(`DELETE FROM restaurants WHERE id = ?`, [req.params.id]);
  res.status(204).send();
});

/** --- Plats CRUD --- */
router.get('/plats', async (req, res) => {
  const rid = req.query.restaurant_id;
  let sql = `SELECT p.*, r.nom AS restaurant_nom FROM plats p JOIN restaurants r ON r.id = p.restaurant_id`;
  const params = [];
  if (rid) {
    sql += ` WHERE p.restaurant_id = ?`;
    params.push(rid);
  }
  sql += ` ORDER BY r.nom, p.categorie, p.nom`;
  res.json(await query(sql, params));
});

router.post('/plats', async (req, res) => {
  const b = req.body || {};
  const hdr = await execute(
    `INSERT INTO plats (restaurant_id, nom, description, prix, image, categorie, is_available)
     VALUES (?,?,?,?,?,?,?)`,
    [
      b.restaurant_id,
      b.nom,
      b.description || null,
      b.prix,
      b.image || null,
      b.categorie,
      b.is_available !== false ? 1 : 0,
    ]
  );
  const [row] = await query(`SELECT * FROM plats WHERE id = ?`, [hdr.insertId]);
  res.status(201).json(row);
});

router.put('/plats/:id', async (req, res) => {
  const b = req.body || {};
  await execute(
    `UPDATE plats SET restaurant_id=?, nom=?, description=?, prix=?, image=?, categorie=?, is_available=?
     WHERE id=?`,
    [
      b.restaurant_id,
      b.nom,
      b.description ?? null,
      b.prix,
      b.image ?? null,
      b.categorie,
      b.is_available ? 1 : 0,
      req.params.id,
    ]
  );
  const [row] = await query(`SELECT * FROM plats WHERE id = ?`, [req.params.id]);
  if (!row) return res.status(404).json({ message: 'Introuvable' });
  res.json(row);
});

router.delete('/plats/:id', async (req, res) => {
  await execute(`DELETE FROM plats WHERE id = ?`, [req.params.id]);
  res.status(204).send();
});

/** --- Commandes --- */
router.get('/commandes', async (req, res) => {
  const { statut, restaurant_id, du, au } = req.query;
  let sql = `SELECT c.*, u.nom AS client_nom, u.email AS client_email, r.nom AS restaurant_nom
             FROM commandes c
             JOIN users u ON u.id = c.user_id
             JOIN restaurants r ON r.id = c.restaurant_id WHERE 1=1`;
  const p = [];
  if (statut) {
    sql += ` AND c.statut_livraison = ?`;
    p.push(statut);
  }
  if (restaurant_id) {
    sql += ` AND c.restaurant_id = ?`;
    p.push(restaurant_id);
  }
  if (du) {
    sql += ` AND DATE(c.date) >= ?`;
    p.push(du);
  }
  if (au) {
    sql += ` AND DATE(c.date) <= ?`;
    p.push(au);
  }
  sql += ` ORDER BY c.date DESC`;
  const rows = await query(sql, p);
  res.json(rows);
});

router.get('/commandes/:id', async (req, res) => {
  const [c] = await query(
    `SELECT c.*, u.nom AS client_nom, u.email AS client_email, u.telephone AS client_telephone,
            r.nom AS restaurant_nom
     FROM commandes c
     JOIN users u ON u.id = c.user_id
     JOIN restaurants r ON r.id = c.restaurant_id WHERE c.id = ?`,
    [req.params.id]
  );
  if (!c) return res.status(404).json({ message: 'Introuvable' });
  const items = await query(
    `SELECT ci.*, p.nom AS plat_nom FROM commande_items ci
     JOIN plats p ON p.id = ci.plat_id WHERE ci.commande_id = ?`,
    [req.params.id]
  );
  res.json({ commande: c, items });
});

router.patch('/commandes/:id/statut', async (req, res) => {
  const { statut_livraison } = req.body || {};
  const allowed = [
    'en_attente',
    'confirmee',
    'en_preparation',
    'en_livraison',
    'livree',
    'annulee',
  ];
  if (!allowed.includes(statut_livraison)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }
  await execute(`UPDATE commandes SET statut_livraison = ? WHERE id = ?`, [
    statut_livraison,
    req.params.id,
  ]);
  const [row] = await query(`SELECT * FROM commandes WHERE id = ?`, [req.params.id]);
  res.json(row);
});

/** --- Utilisateurs --- */
router.get('/users', async (_req, res) => {
  const rows = await query(
    `SELECT id, nom, email, telephone, adresse, role, created_at FROM users ORDER BY created_at DESC`
  );
  res.json(rows);
});

router.get('/users/:id', async (req, res) => {
  const [u] = await query(
    `SELECT id, nom, email, telephone, adresse, role, created_at FROM users WHERE id = ?`,
    [req.params.id]
  );
  if (!u) return res.status(404).json({ message: 'Introuvable' });
  const orders = await query(
    `SELECT id, date, total, statut_livraison, restaurant_id FROM commandes WHERE user_id = ? ORDER BY date DESC`,
    [req.params.id]
  );
  const [agg] = await query(
    `SELECT COUNT(*) AS nb, COALESCE(SUM(total),0) AS depense FROM commandes WHERE user_id = ? AND statut_livraison <> 'annulee'`,
    [req.params.id]
  );
  res.json({
    user: u,
    historique: orders,
    total_depense: Number(agg?.depense ?? 0),
    nombre_commandes: agg?.nb ?? 0,
  });
});

export default router;
