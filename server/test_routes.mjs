import express from 'express';
import { initDb } from './src/db/index.ts';
import catalogueRouter from './src/routes/catalogue.ts';

const app = express();
app.use(express.json());
app.use('/api/v1/catalog', catalogueRouter);

initDb().then(() => {
  app.listen(3006, () => {
    console.log('listening on 3006');
    // test all routes
    const test = async () => {
      const resp = await fetch('http://localhost:3006/api/v1/catalog/types');
      const text = await resp.text();
      console.log('Status:', resp.status);
      console.log('Body:', text.substring(0, 200));
      process.exit(0);
    };
    test().catch(e => { console.log(e); process.exit(1); });
  });
}).catch(e => { console.log('Init error:', e); process.exit(1); });
