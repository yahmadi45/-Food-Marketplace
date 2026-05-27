import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, execute } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { nom, email, telephone, password, adresse } = req.body || {};
    if (!nom || !email || !telephone || !password) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    const hashed = bcrypt.hashSync(password, 10);
    const hdr = await execute(
      `INSERT INTO users (nom, email, telephone, password, role, adresse) VALUES (?,?,?,?, 'client', ?)`,
      [nom.trim(), email.trim().toLowerCase(), telephone.trim(), hashed, adresse || null]
    );
    const id = hdr.insertId;
    const token = signToken({
      id: Number(id),
      email: email.trim().toLowerCase(),
      nom,
      role: 'client',
    });
    res.status(201).json({ token, user: { id: Number(id), nom, email, role: 'client' } });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email déjà utilisé' });
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    const rows = await query('SELECT id, nom, email, password, role FROM users WHERE email = ?', [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    const token = signToken({
      id: user.id,
      email: user.email,
      nom: user.nom,
      role: user.role,
    });
    res.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const rows = await query(
    'SELECT id, nom, email, telephone, role, adresse, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(rows[0]);
});

export default router;
