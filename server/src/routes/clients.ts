import { Router, Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db';
import { requireAuth } from '../middleware/auth';
import { auditLog } from '../utils/audit';

export const clientsRouter = Router();
clientsRouter.use(requireAuth);

clientsRouter.get('/', (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  let clients;
  if (search) {
    clients = dbAll('SELECT * FROM clients WHERE nom LIKE ? OR prenom LIKE ? OR telephone LIKE ? ORDER BY nom', [`%${search}%`, `%${search}%`, `%${search}%`]);
  } else {
    clients = dbAll('SELECT * FROM clients ORDER BY nom');
  }
  res.json({ data: clients });
});

clientsRouter.get('/:id', (req: Request, res: Response) => {
  const client = dbGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!client) { res.status(404).json({ error: 'Client non trouvé' }); return; }
  res.json({ data: client });
});

clientsRouter.post('/', (req: Request, res: Response) => {
  const { nom, prenom, telephone, telephone2, email, adresse, ville, code_postal, notes } = req.body;
  if (!nom) { res.status(400).json({ error: 'Le nom est requis' }); return; }
  const result = dbRun(
    `INSERT INTO clients (nom, prenom, telephone, telephone2, email, adresse, ville, code_postal, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nom, prenom || null, telephone || null, telephone2 || null, email || null, adresse || null, ville || null, code_postal || null, notes || null]
  );
  const client = dbGet('SELECT * FROM clients WHERE id = ?', [result.lastInsertRowid]);
  auditLog({ utilisateur_id: req.session.userId, module: 'clients', action: 'creation', nouvelle_valeur: JSON.stringify(client), adresse_ip: req.ip });
  res.status(201).json(client);
});

clientsRouter.put('/:id', (req: Request, res: Response) => {
  const old = dbGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  const { nom, prenom, telephone, telephone2, email, adresse, ville, code_postal, notes } = req.body;
  dbRun(
    `UPDATE clients SET nom=?, prenom=?, telephone=?, telephone2=?, email=?, adresse=?, ville=?, code_postal=?, notes=?, modifie_le=datetime('now') WHERE id=?`,
    [nom, prenom, telephone, telephone2, email, adresse, ville, code_postal, notes, req.params.id]
  );
  const client = dbGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  auditLog({ utilisateur_id: req.session.userId, module: 'clients', action: 'modification', ancienne_valeur: old ? JSON.stringify(old) : null, nouvelle_valeur: JSON.stringify(client), adresse_ip: req.ip });
  res.json({ data: client });
});

clientsRouter.delete('/:id', (req: Request, res: Response) => {
  const old = dbGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  dbRun('DELETE FROM clients WHERE id = ?', [req.params.id]);
  auditLog({ utilisateur_id: req.session.userId, module: 'clients', action: 'suppression', ancienne_valeur: old ? JSON.stringify(old) : null, adresse_ip: req.ip });
  res.json({ message: 'Client supprimé' });
});


