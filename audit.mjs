import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const SRC = 'client/src';
const issues = [];
let totalFiles = 0;

function walk(dir, ext) {
  let files = [];
  try {
    const entries = readdirSync(dir);
    for (const e of entries) {
      const p = join(dir, e);
      if (statSync(p).isDirectory() && !e.includes('node_modules') && !e.startsWith('.')) {
        files = files.concat(walk(p, ext));
      } else if (extname(p) === ext) {
        files.push(p);
      }
    }
  } catch {}
  return files;
}

function read(p) {
  try { return readFileSync(p, 'utf-8'); } catch { return ''; }
}

function add(sev, file, line, desc, fix) {
  issues.push({ sev, file: file.replace(/\\/g, '/'), line, desc, fix });
}

// ─── PHASE 1: All TSX pages audit ───
const pages = walk(join(SRC, 'pages'), '.tsx');
const components = walk(join(SRC, 'components'), '.tsx');
const allFiles = [...pages, ...components];
totalFiles = allFiles.length;

for (const file of allFiles) {
  const content = read(file);
  const lines = content.split('\n');
  const rel = file.replace(/\\/g, '/').replace('client/src/', '');

  // 1. Missing key prop in loops
  const mapMatches = content.matchAll(/\.map\(\(?(\w+)/g);
  for (const m of mapMatches) {
    const lineIdx = lines.findIndex(l => l.includes(m[0]));
    if (lineIdx >= 0) {
      const line = lines[lineIdx];
      if (!line.includes('key=') && !line.includes('key {')) {
        // Check if the parent has key
        let hasKey = false;
        for (let i = lineIdx; i >= Math.max(0, lineIdx - 3); i--) {
          if (lines[i].includes('key=') || lines[i].includes('key {')) { hasKey = true; break; }
        }
        if (!hasKey) {
          add('🟡', rel, lineIdx + 1, 'map() sans prop key', 'Ajouter key={item.id || i}');
        }
      }
    }
  }

  // 2. Dangerous patterns
  if (content.includes('dangerouslySetInnerHTML')) {
    const idx = lines.findIndex(l => l.includes('dangerouslySetInnerHTML'));
    add('🟠', rel, idx + 1, 'Utilise dangerouslySetInnerHTML', 'Remplacer par un composant React sécurisé');
  }

  // 3. Inline styles with hardcoded colors
  const styleMatches = content.matchAll(/style=\{\{[^}]*color[^}]*\}\}/g);
  for (const m of styleMatches) {
    const idx = lines.findIndex(l => l.includes(m[0].substring(0, 40)));
    if (idx >= 0) add('🟢', rel, idx + 1, 'Style inline avec couleur', 'Utiliser une classe Tailwind');
  }

  // 4. img without alt
  const imgMatches = content.matchAll(/<img\s[^>]*src=/g);
  for (const m of imgMatches) {
    const idx = lines.findIndex(l => l.includes(m[0].substring(0, 30)));
    if (idx >= 0) {
      const line = lines[idx];
      if (!line.includes('alt=')) {
        add('🟠', rel, idx + 1, 'Image sans attribut alt', 'Ajouter alt="" descriptive');
      }
    }
  }

  // 5. Button without type
  const btnMatches = content.matchAll(/<button\s[^>]*>/g);
  for (const m of btnMatches) {
    const idx = lines.findIndex(l => l.includes(m[0]));
    if (idx >= 0) {
      const line = lines[idx];
      if (!line.includes('type=') && !line.includes('onSubmit')) {
        add('🟢', rel, idx + 1, 'Bouton sans type explicite', 'Ajouter type="button"');
      }
    }
  }

  // 6. Direct DOM manipulation
  if (content.includes('document.')) {
    const idx = lines.findIndex(l => l.includes('document.'));
    add('🟡', rel, idx + 1, 'Manipulation DOM directe', 'Utiliser useRef/useEffect');
  }

  // 7. Input without label or aria-label
  const inputMatches = content.matchAll(/<(input|select|textarea)\s[^>]*>/g);
  for (const m of inputMatches) {
    const idx = lines.findIndex(l => l.includes(m[0].substring(0, 30)));
    if (idx >= 0) {
      const line = lines[idx];
      if (!line.includes('aria-label') && !line.includes('aria-labelledby')) {
        // Check if it's inside a component that provides label
        let hasLabel = false;
        for (let i = idx; i >= Math.max(0, idx - 5); i--) {
          if (lines[i].includes('label=') || lines[i].includes('<label')) { hasLabel = true; break; }
        }
        if (!hasLabel && !line.includes('type="hidden"')) {
          add('🟡', rel, idx + 1, 'Champ sans label ni aria-label', 'Ajouter aria-label ou un label');
        }
      }
    }
  }

  // 8. Check for hardcoded font sizes or px values
  const pxMatches = content.matchAll(/['"`]\d+px['"`]/g);
  for (const m of pxMatches) {
    const idx = lines.findIndex(l => l.includes(m[0]));
    if (idx >= 0) add('🟢', rel, idx + 1, `Valeur px hardcodée: ${m[0]}`, 'Utiliser classe Tailwind');
  }
}

// ─── PHASE 2: Check for missing exports or index files ───
const uiDir = join(SRC, 'components/ui');
const uiFiles = readdirSync(uiDir).filter(f => f.endsWith('.tsx') && !f.endsWith('.d.ts'));
// Check if each component is properly exported (default or named)
for (const f of uiFiles) {
  const content = read(join(uiDir, f));
  const name = f.replace('.tsx', '');
  if (!content.includes('export function') && !content.includes('export const') && !content.includes('export default')) {
    add('🟠', `components/ui/${f}`, 1, `Composant ${name} non exporté`, 'Ajouter export');
  }
}

// ─── PHASE 3: Check page title consistency ───
for (const file of pages) {
  const content = read(file);
  const lines = content.split('\n');
  const rel = file.replace(/\\/g, '/').replace('client/src/', '');
  // Check for h1
  const hasH1 = content.includes('<h1');
  const h1Idx = lines.findIndex(l => l.includes('<h1'));
  if (!hasH1) {
    add('🟡', rel, 1, 'Page sans titre h1', 'Ajouter un h1 pour l\'accessibilité');
  } else {
    // Extract h1 text
    const h1Line = lines[h1Idx];
    const match = h1Line.match(/>([^<]+)</);
    if (match && match[1].trim()) {
      // Check for loading
    }
  }
}

// ─── PHASE 4: CSS audit - check for unused custom properties ───
const indexCss = read(join(SRC, 'index.css'));
const cssMatches = indexCss.matchAll(/--[\w-]+/g);
const vars = [...new Set([...cssMatches].map(m => m[0]))];
// These are Tailwind CSS variables, skip them
const tailwindVars = ['--tw-'];
const customVars = vars.filter(v => !tailwindVars.some(t => v.startsWith(t)));

// ─── PHASE 5: Console.log audit ───
for (const file of allFiles) {
  const content = read(file);
  const lines = content.split('\n');
  const rel = file.replace(/\\/g, '/').replace('client/src/', '');
  const logIdx = lines.findIndex(l => l.includes('console.log'));
  if (logIdx >= 0) {
    add('🟢', rel, logIdx + 1, 'console.log dans le code', 'Supprimer avant production');
  }
  const errIdx = lines.findIndex(l => l.includes('console.error'));
  if (errIdx >= 0) {
    // Only flag if it's a bare console.error without proper error handling
    const line = lines[errIdx];
    if (line.includes('console.error(err') && !line.includes('toast')) {
      add('🟢', rel, errIdx + 1, 'console.error sans feedback utilisateur', 'Ajouter notification toast');
    }
  }
}

// ─── OUTPUT ───
console.log(`\n═══════════════════════════════════════════`);
console.log(`  AUDIT COMPLET - ${issues.length} problèmes trouvés`);
console.log(`  ${totalFiles} fichiers analysés`);
console.log(`═══════════════════════════════════════════\n`);

const bySeverity = {};
for (const i of issues) {
  bySeverity[i.sev] = (bySeverity[i.sev] || 0) + 1;
}
console.log(`  🔴 Critique: ${bySeverity['🔴'] || 0}`);
console.log(`  🟠 Important: ${bySeverity['🟠'] || 0}`);
console.log(`  🟡 Moyen:     ${bySeverity['🟡'] || 0}`);
console.log(`  🟢 Mineur:    ${bySeverity['🟢'] || 0}\n`);

let currentFile = '';
for (const i of issues) {
  if (i.file !== currentFile) {
    console.log(`\n📄 ${i.file}:`);
    currentFile = i.file;
  }
  console.log(`  ${i.sev} L${i.line} ${i.desc}`);
  console.log(`     → ${i.fix}`);
}

// Save detailed report
const report = issues.map(i => `| ${i.sev} | ${i.file}:${i.line} | ${i.desc} | ${i.fix} |`).join('\n');
const summary = `# Audit Report\n\n## Résumé\n- Problèmes: ${issues.length}\n- Fichiers: ${totalFiles}\n\n## Par sévérité\n${Object.entries(bySeverity).map(([k,v]) => `- ${k}: ${v}`).join('\n')}\n\n## Détails\n\n| Sévérité | Fichier | Problème | Correction |\n|----------|---------|----------|------------|\n${report}`;
import { writeFileSync } from 'fs';
writeFileSync('AUDIT_REPORT.md', summary);
console.log('\n📝 Rapport écrit dans AUDIT_REPORT.md');
