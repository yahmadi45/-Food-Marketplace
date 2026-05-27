import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { q = '', cuisine, noteMin, tempsMax } = req.query;
    let sql =
      `SELECT id, nom, description, image, adresse, horaires, type_cuisine, note_moyenne,
              temps_livraison_estime, is_active
       FROM restaurants WHERE is_active = 1`;
    const params = [];
    if (q) {
      sql += ` AND nom LIKE ?`;
      params.push(`%${String(q)}%`);
    }
    if (cuisine) {
      sql += ` AND type_cuisine = ?`;
      params.push(String(cuisine));
    }
    if (noteMin) {
      sql += ` AND note_moyenne >= ?`;
      params.push(Number(noteMin));
    }
    if (tempsMax) {
      sql += ` AND temps_livraison_estime <= ?`;
      params.push(Number(tempsMax));
    }
    sql += ' ORDER BY note_moyenne DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/cuisine-types', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT DISTINCT type_cuisine FROM restaurants WHERE is_active = 1 ORDER BY type_cuisine`
    );
    res.json(rows.map((r) => r.type_cuisine));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, nom, description, image, adresse, horaires, type_cuisine, note_moyenne,
              temps_livraison_estime, is_active
       FROM restaurants WHERE id = ? AND is_active = 1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Restaurant introuvable' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id/plats', async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, restaurant_id, nom, description, prix, image, categorie, is_available
       FROM plats WHERE restaurant_id = ? AND is_available = 1 ORDER BY FIELD(categorie, 'Entrees','Plats','Desserts','Boissons'), nom`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id/avis', async (req, res) => {
  try {
    const rows = await query(
      `SELECT a.note, a.commentaire, a.created_at, u.nom as user_nom
       FROM avis a
       JOIN users u ON a.user_id = u.id
       WHERE a.restaurant_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
