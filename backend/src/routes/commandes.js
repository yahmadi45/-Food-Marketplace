import { Router } from 'express';
import { query, execute } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/** Frais livraison fixe (démo) */
const DELIVERY_FEE = 5.5;

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      restaurant_id,
      items,
      adresse_livraison,
      telephone_contact,
      commentaire,
      mode_paiement,
    } = req.body || {};
    if (
      !restaurant_id ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !adresse_livraison ||
      !mode_paiement
    ) {
      return res.status(400).json({ message: 'Données de commande incomplètes' });
    }
    const modes = ['carte', 'livraison', 'mobile_money'];
    if (!modes.includes(mode_paiement)) {
      return res.status(400).json({ message: 'Mode de paiement invalide' });
    }

    let sousTotal = 0;
    const lines = [];
    for (const it of items) {
      const platRows = await query(
        `SELECT id, prix, restaurant_id, is_available FROM plats WHERE id = ?`,
        [it.plat_id]
      );
      const plat = platRows[0];
      if (!plat || plat.restaurant_id !== Number(restaurant_id) || !plat.is_available) {
        return res.status(400).json({ message: 'Plat invalide ou non disponible' });
      }
      const q = Number(it.quantite || 1);
      if (q < 1) return res.status(400).json({ message: 'Quantité invalide' });
      const lineTotal = plat.prix * q;
      sousTotal += lineTotal;
      lines.push({
        plat_id: plat.id,
        quantite: q,
        prix_unitaire: plat.prix,
        sous_total: lineTotal,
      });
    }

    const total = Math.round((sousTotal + DELIVERY_FEE) * 1000) / 1000;

    const hdr = await execute(
      `INSERT INTO commandes (user_id, restaurant_id, date, total, statut_livraison,
       adresse_livraison, telephone_contact, commentaire, mode_paiement)
       VALUES (?, ?, NOW(), ?, 'en_attente', ?, ?, ?, ?)`,
      [
        req.user.id,
        restaurant_id,
        total,
        adresse_livraison.trim(),
        (telephone_contact || '').trim(),
        commentaire || null,
        mode_paiement,
      ]
    );
    const commandeId = hdr.insertId;
    for (const l of lines) {
      await execute(
        `INSERT INTO commande_items (commande_id, plat_id, quantite, prix_unitaire, sous_total)
         VALUES (?, ?, ?, ?, ?)`,
        [commandeId, l.plat_id, l.quantite, l.prix_unitaire, l.sous_total]
      );
    }
    const full = await query(
      `SELECT c.*, r.nom AS restaurant_nom FROM commandes c
       JOIN restaurants r ON r.id = c.restaurant_id WHERE c.id = ?`,
      [commandeId]
    );
    const its = await query(
      `SELECT ci.*, p.nom AS plat_nom FROM commande_items ci
       JOIN plats p ON p.id = ci.plat_id WHERE ci.commande_id = ?`,
      [commandeId]
    );
    res.status(201).json({
      frais_livraison: DELIVERY_FEE,
      commande: full[0],
      items: its,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.id, c.restaurant_id, r.nom AS restaurant_nom, c.date, c.total, c.statut_livraison,
              c.mode_paiement
       FROM commandes c
       JOIN restaurants r ON r.id = c.restaurant_id
       WHERE c.user_id = ? ORDER BY c.date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
