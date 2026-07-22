const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'devis.db');
const db = Database(dbPath);
const users = db.prepare('SELECT id, password FROM users').all();
let m = 0;
for (const u of users) {
  if (!u.password.startsWith('$2')) {
    const h = bcrypt.hashSync(u.password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(h, u.id);
    m++;
  }
}
console.log('Migrated ' + m + ' passwords');
db.close();
