const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join('data', 'gnabo.db');
const buffer = fs.readFileSync(DB_PATH);
initSqlJs().then(SQL => {
  const db = new SQL.Database(buffer);
  const r = db.exec("PRAGMA table_info(clients)");
  console.log("Clients columns:");
  r[0].values.forEach(v => console.log("  " + v[1] + " " + v[2]));
  const sample = db.exec("SELECT id, nom, prenom, company FROM clients LIMIT 3");
  console.log("\nSample clients:");
  if (sample.length > 0) sample[0].values.forEach(v => console.log("  id=" + v[0] + " nom=" + v[1] + " prenom=" + v[2] + " company=" + v[3]));
});
