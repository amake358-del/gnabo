import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    role: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.role !== role) {
      res.status(403).json({ error: 'Accès refusé' });
      return;
    }
    next();
  };
}

export function requireRoleAny(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.role || !roles.includes(req.session.role)) {
      res.status(403).json({ error: 'Accès refusé' });
      return;
    }
    next();
  };
}
