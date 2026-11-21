import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { q = '', cuisine, noteMin, tempsMax } = req.query;
    const filters = [];
    const params = [];
    filters.push('is_active = 1');

    if (q) {
      filters.push('nom LIKE ?');
      params.push(`%${String(q).trim()}%`);
    }
    if (cuisine) {
      filters.push('type_cuisine = ?');
      params.push(String(cuisine));
    }
    if (noteMin !== undefined && noteMin !== '') {
      const rating = Number(noteMin);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'La note minimale doit être comprise entre 0 et 5.' });
      }
      filters.push('note_moyenne >= ?');
      params.push(rating);
    }
    if (tempsMax !== undefined && tempsMax !== '') {
      const minutes = Number(tempsMax);
      if (!Number.isInteger(minutes) || minutes < 1) {
        return res.status(400).json({ message: 'Le délai maximal doit être un nombre de minutes positif.' });
      }
      filters.push('temps_livraison_estime <= ?');
      params.push(minutes);
    }

    const rows = await query(
      `SELECT id, nom, description, image, adresse, horaires, type_cuisine, note_moyenne,
              temps_livraison_estime, is_active
       FROM restaurants WHERE ${filters.join(' AND ')} ORDER BY note_moyenne DESC, nom ASC`,
      params,
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/cuisine-types', async (_req, res) => {
  try {
    const rows = await query(
      'SELECT DISTINCT type_cuisine FROM restaurants WHERE is_active = 1 ORDER BY type_cuisine',
    );
    res.json(rows.map((row) => row.type_cuisine));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, nom, description, image, adresse, horaires, type_cuisine, note_moyenne,
              temps_livraison_estime, is_active
       FROM restaurants WHERE id = ? AND is_active = 1`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ message: 'Restaurant introuvable' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id/plats', async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, restaurant_id, nom, description, prix, image, categorie, is_available
       FROM plats WHERE restaurant_id = ? AND is_available = 1
       ORDER BY FIELD(categorie, 'Entrees','Plats','Desserts','Boissons'), nom`,
      [req.params.id],
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id/avis', async (req, res) => {
  try {
    const rows = await query(
      `SELECT a.note, a.commentaire, a.created_at, u.nom AS user_nom
       FROM avis a JOIN users u ON a.user_id = u.id
       WHERE a.restaurant_id = ? ORDER BY a.created_at DESC`,
      [req.params.id],
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
