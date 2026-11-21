import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, execute } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { nom, email, telephone, password, adresse } = req.body || {};
    const normalizedName = typeof nom === 'string' ? nom.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPhone = typeof telephone === 'string' ? telephone.trim() : '';
    if (!normalizedName || !normalizedEmail || !normalizedPhone || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Indiquez un nom, un email, un téléphone et un mot de passe de 8 caractères minimum.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await execute(
      `INSERT INTO users (nom, email, telephone, password, role, adresse) VALUES (?, ?, ?, ?, 'client', ?)`,
      [normalizedName, normalizedEmail, normalizedPhone, passwordHash, typeof adresse === 'string' && adresse.trim() ? adresse.trim() : null],
    );
    const user = { id: Number(result.insertId), nom: normalizedName, email: normalizedEmail, role: 'client' };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email déjà utilisé' });
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    const rows = await query('SELECT id, nom, email, password, role FROM users WHERE email = ?', [email]);
    const userRecord = rows[0];
    if (!userRecord || !(await bcrypt.compare(password, userRecord.password))) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    const user = { id: Number(userRecord.id), nom: userRecord.nom, email: userRecord.email, role: userRecord.role };
    res.json({ token: signToken(user), user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, nom, email, telephone, role, adresse, created_at FROM users WHERE id = ?',
      [req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
