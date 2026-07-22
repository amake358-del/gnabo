const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const dbFiles = fs.readdirSync(path.join('data')).filter(f => f.endsWith('.db'));
console.log('DB files:', dbFiles);
const db = new Database(path.join('data', dbFiles[0]));
const rows = db.prepare("SELECT cle, substr(valeur,1,80) as val_preview, length(valeur) as len FROM parametres WHERE cle IN ('logo','entreprise_nom','entreprise_slogan')").all();
console.table(rows);
db.close();
