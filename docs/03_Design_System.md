# Design System

## Principes

- **Mobile-first** — conçu d'abord pour téléphone (415px), puis tablette (768px), puis PC (1024px+), puis TV (1920px+)
- **Touch-friendly** — zones clics ≥ 48px, gestes (swipe, pull-to-refresh)
- **Atelier-ready** — contrastes élevés, lecture facile en environnement lumineux
- **Professionnel** — sobre, pas de fioritures, lisible

## Couleurs

| Rôle | Couleur | Hex | Usage |
|---|---|---|---|
| Primaire | Bleu professionnel | `#1B3A5C` | Entêtes, boutons principaux |
| Accent | Orange | `#E67E22` | Actions, alertes, statuts actifs |
| Succès | Vert | `#27AE60` | Terminé, payé, livré |
| Danger | Rouge | `#C0392B` | Erreur, suppression, alerte stock |
| Fond clair | Blanc cassé | `#F8F9FA` | Arrière-plan principal |
| Fond foncé | Gris ardoise | `#2C3E50` | Barre latérale, footer |
| Texte | Noir doux | `#2D3436` | Corps de texte |
| Texte secondaire | Gris | `#636E72` | Sous-titres, métadonnées |

Les services ont leur propre couleur d'identité :

| Service | Couleur |
|---|---|
| Aluminium & Inox | Argent `#BDC3C7` |
| Métallique | Acier `#7F8C8D` |
| Électronique | Bleu électrique `#2980B9` |

## Typographie

- **Titres** : Inter (sans-serif, Google Fonts) — bold 700
- **Corps** : Inter Regular 400
- **Monospace** : JetBrains Mono (pour codes, références, QR)

### Échelle

| Niveau | Taille | Poids |
|---|---|---|
| Display | 2.5rem (40px) | 700 |
| H1 | 2rem (32px) | 700 |
| H2 | 1.5rem (24px) | 600 |
| H3 | 1.25rem (20px) | 600 |
| Corps | 1rem (16px) | 400 |
| Petit | 0.875rem (14px) | 400 |
| Légende | 0.75rem (12px) | 400 |

## Responsive Breakpoints

| Appareil | Largeur | Comportement |
|---|---|---|
| Téléphone | < 576px | Navigation bottom, 1 colonne |
| Tablette | 576–1023px | Navigation latérale réduite, 2 colonnes |
| PC | 1024–1919px | Navigation latérale complète, grille flexible |
| TV / Grand écran | ≥ 1920px | Layout large, multi-colonnes |

## Composants

### Boutons

- `btn-primary` : fond bleu, texte blanc
- `btn-secondary` : fond transparent, bordure bleue
- `btn-danger` : fond rouge, texte blanc
- `btn-icon` : icône seule, arrondi, fond transparent
- `btn-ghost` : pas de fond ni bordure, uniquement au hover

### Cartes

Chaque entité (client, appareil, devis) est présentée dans une carte avec :
- Bordure légère (1px, `#E0E0E0`)
- Ombre douce (box-shadow: 0 2px 8px rgba(0,0,0,0.08))
- Coins arrondis (8px)
- Padding : 16px (mobile), 24px (PC)

### Formulaires

- Labels au-dessus des champs
- Hauteur de champ : 48px (touch)
- Bordure : 1.5px, focus : bordure bleue + ombre légère
- Messages d'erreur sous le champ en rouge

### Tableaux

- Lignes alternées (blanc / gris très clair)
- En-tête fixe en sticky
- Tri par colonne possible
- Version mobile : cartes horizontales (card layout) au lieu de tableau

## Icônes

- Lucide React (bibliothèque d'icônes)
- Taille standard : 20px (dans les boutons), 24px (navigation)
- Toujours accompagnées d'un texte ou d'un aria-label

## Animations

- **Transitions** : 200ms ease (couleurs, ombres)
- **Apparition** : fade-in 300ms
- **Navigation** : slide horizontal (stack navigation)
- **Pas de mouvement superflu** — l'atelier n'a pas besoin d'effets tape-à-l'œil

## Accessibilité

- Tous les boutons et liens accessibles au clavier
- `aria-label` sur les icônes seules
- Contraste minimum 4.5:1 pour le texte
- `prefers-reduced-motion` respecté
- Focus visible personnalisé (outline bleue 2px)
