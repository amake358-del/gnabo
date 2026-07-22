const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join('data', 'gnabo.db');
const buffer = fs.readFileSync(DB_PATH);
initSqlJs().then(SQL => {
  const db = new SQL.Database(buffer);
  const r = db.exec("PRAGMA table_info(parametres)");
  console.log("Columns:");
  r[0].values.forEach(v => console.log("  " + v[0] + " " + v[1] + " " + v[2] + " notnull=" + v[3]));
  
  const all = db.exec("SELECT cle, length(valeur) as len FROM parametres ORDER BY cle");
  console.log("\nAll params:");
  all[0].values.forEach(v => console.log("  " + v[0] + " (" + v[1] + " bytes)"));

  const logo = db.exec("SELECT substr(valeur,1,50) as preview FROM parametres WHERE cle='logo'");
  if (logo.length > 0 && logo[0].values.length > 0) {
    console.log("\nLogo preview: " + logo[0].values[0][0]);
  } else {
    console.log("\nNo logo in DB");
  }
});
