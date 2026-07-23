import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { initDb } from './db';
import { authRouter } from './routes/auth';
import { clientsRouter } from './routes/clients';
import { devisRouter } from './routes/devis';
import { catalogueRouter } from './routes/catalogue';
import { appareilsRouter } from './routes/appareils';
import { diagnosticRouter } from './routes/diagnostic-reparation';
import { facturationRouter } from './routes/facturation-electronique';
import { qrCodesRouter } from './routes/qr-codes';
import { dashboardRouter } from './routes/dashboard';
import { settingsRouter } from './routes/settings';
import { usersRouter } from './routes/users';
import { actionLogRouter } from './routes/action-log';
import { notificationsRouter } from './routes/notifications';
import { backupsRouter } from './routes/backups';
import { caisseRouter } from './routes/caisse';
import { stocksRouter } from './routes/stocks';
import { interventionsRouter } from './routes/interventions';
import { etiquettesRouter } from './routes/etiquettes';
import { errorHandler } from './middleware/error-handler';

const app = express();
const PORT = 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'gnabo-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 },
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/clients', clientsRouter);
app.use('/api/v1/devis', devisRouter);
app.use('/api/v1/catalog', catalogueRouter);
app.use('/api/v1/appareils', appareilsRouter);
app.use('/api/v1/diagnostic', diagnosticRouter);
app.use('/api/v1/electronique', facturationRouter);
app.use('/api/v1/qr-codes', qrCodesRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/action-log', actionLogRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/backups', backupsRouter);
app.use('/api/v1/caisse', caisseRouter);
app.use('/api/v1/stocks', stocksRouter);
app.use('/api/v1/interventions', interventionsRouter);
app.use('/api/v1/etiquettes', etiquettesRouter);

const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
