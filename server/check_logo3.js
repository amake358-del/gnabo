const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join('data', 'gnabo.db');
const buffer = fs.readFileSync(DB_PATH);
initSqlJs().then(SQL => {
  const db = new SQL.Database(buffer);
  const CLIENT_KEY_MAP = { logo: 'logo_url', signature: 'signature_url', cachet: 'cachet_url' };
  const sql = "SELECT cle, valeur FROM parametres WHERE cle IN ('logo','signature','cachet','entreprise_nom')";
  const result = db.exec(sql);
  if (!result.length) { console.log('No results'); return; }
  const config = {};
  result[0].values.forEach(r => {
    const key = CLIENT_KEY_MAP[r[0]] || r[0];
    const val = r[1];
    config[key] = val ? (val.substring(0, 60) + '... [' + val.length + ' bytes]') : '(empty)';
  });
  console.log(JSON.stringify(config, null, 2));
  
  // Now test the actual routes module
  console.log('\n--- Testing getDb/company route ---');
  // Simulate dbRowToCompanyConfig
  const allRows = db.exec("SELECT cle, valeur FROM parametres")[0];
  const fullConfig = {};
  const DB_KEY_MAP = {
    company_name: 'entreprise_nom', slogan: 'entreprise_slogan',
    description: 'entreprise_description', rccm: 'entreprise_registre',
    nif: 'entreprise_nif', address: 'entreprise_adresse',
    city: 'entreprise_ville', country: 'entreprise_pays',
    phone: 'entreprise_telephone', phone2: 'entreprise_telephone2',
    email: 'entreprise_email', website: 'entreprise_site_web',
    signatory_name: 'signataire_nom', signatory_title: 'signataire_fonction',
    default_tva: 'tva_default', currency: 'devise',
    date_format: 'format_date', primary_color: 'couleur_principale',
    secondary_color: 'couleur_secondaire', conditions: 'conditions',
    footer_text: 'pied_de_page', logo_url: 'logo',
    favicon_url: 'favicon', signature_url: 'signature', cachet_url: 'cachet',
  };
  const revMap = {};
  for (const [k, v] of Object.entries(DB_KEY_MAP)) revMap[v] = k;
  allRows.values.forEach(r => {
    const key = revMap[r[0]] || r[0];
    fullConfig[key] = r[1];
  });
  console.log('logo_url exists:', 'logo_url' in fullConfig);
  console.log('logo_url length:', fullConfig.logo_url ? fullConfig.logo_url.length : 0);
  console.log('logo_url starts with:', fullConfig.logo_url ? fullConfig.logo_url.substring(0, 40) : 'N/A');
});
