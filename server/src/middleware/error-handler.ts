import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Server error:', err)
  const message = process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : err.message
  res.status(500).json({ error: message })
}
