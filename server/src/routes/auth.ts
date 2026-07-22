import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun } from '../db';
import { auditLog } from '../utils/audit';

export const authRouter = Router();

const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    res.status(400).json({ error: 'Email et mot de passe requis' });
    return;
  }
  const user = dbGet('SELECT * FROM utilisateurs WHERE email = ? AND actif = 1', [email]) as any;
  if (!user) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    return;
  }

  const now = new Date();
  const lockedUntil = user.verrouille_jusque ? new Date(user.verrouille_jusque) : null;
  if (lockedUntil && lockedUntil > now) {
    const minutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);
    res.status(429).json({ error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` });
    return;
  }

  if (!bcrypt.compareSync(mot_de_passe, user.mot_de_passe_hash)) {
    const attempts = (user.tentatives_echouees || 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60000).toISOString();
      dbRun('UPDATE utilisateurs SET tentatives_echouees = ?, verrouille_jusque = ? WHERE id = ?', [attempts, lockUntil, user.id]);
      auditLog({ utilisateur_id: user.id, module: 'auth', action: 'blocage', nouvelle_valeur: JSON.stringify({ raison: 'trop de tentatives', duree: LOCKOUT_MINUTES }), adresse_ip: req.ip });
      res.status(429).json({ error: `Trop de tentatives. Réessayez dans ${LOCKOUT_MINUTES} minutes.` });
    } else {
      dbRun('UPDATE utilisateurs SET tentatives_echouees = ? WHERE id = ?', [attempts, user.id]);
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    return;
  }

  dbRun('UPDATE utilisateurs SET tentatives_echouees = 0, verrouille_jusque = NULL WHERE id = ?', [user.id]);
  req.session.userId = user.id;
  req.session.role = user.role;
  auditLog({ utilisateur_id: user.id, module: 'auth', action: 'connexion', adresse_ip: req.ip });
  res.json({ id: user.id, nom: user.nom, email: user.email, role: user.role });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  if (req.session.userId) {
    auditLog({ utilisateur_id: req.session.userId, module: 'auth', action: 'deconnexion', adresse_ip: req.ip });
  }
  req.session.destroy((err) => {
    if (err) { res.status(500).json({ error: 'Erreur lors de la déconnexion' }); return; }
    res.json({ message: 'Déconnecté' });
  });
});

authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.session.userId) { res.status(401).json({ error: 'Non authentifié' }); return; }
  const user = dbGet('SELECT id, nom, email, role FROM utilisateurs WHERE id = ?', [req.session.userId]);
  res.json(user);
});
