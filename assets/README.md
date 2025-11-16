# Assets Directory

Ce dossier contient tous les assets statiques pour l'application Système de Suivi des Nageurs.

## Structure

```
assets/
├── css/          # Feuilles de style
├── js/           # Scripts JavaScript
└── images/       # Images et icônes
```

## Images

### Logo et Icônes
- `logo.png` (512x512) - Logo principal de l'application
- `favicon.ico` - Icône de navigateur multi-taille
- `favicon-16x16.png` - Favicon 16x16
- `favicon-32x32.png` - Favicon 32x32
- `apple-touch-icon.png` (180x180) - Icône pour appareils Apple

### PWA Icons
- `icon-192.png` (192x192) - Icône PWA taille standard
- `icon-512.png` (512x512) - Icône PWA haute résolution

### Social Media
- `og-image.png` (1200x630) - Image pour Open Graph (Facebook, LinkedIn)
  Utilisée pour les aperçus sur les réseaux sociaux

### Empty State Icons
- `empty-swimmers.png` - Placeholder pour liste de nageurs vide
- `empty-data.png` - Placeholder pour données vides
- `empty-analytics.png` - Placeholder pour analytics vides
- `empty-feedback.png` - Placeholder pour feedback vide

## Utilisation

### Dans le HTML
```html
<!-- Logo dans le header -->
<img src="assets/images/logo.png" alt="Logo">

<!-- Favicon -->
<link rel="icon" href="assets/images/favicon.ico">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png">
```

### Dans le manifest.json
Les icônes PWA sont référencées automatiquement via le fichier manifest.json à la racine.

## Design System

### Couleurs du Logo
- Bleu primaire: `#1a73e8`
- Blanc: `#ffffff`
- Vert (vagues): `#34a853`

### Tailles d'icônes
- Favicon: 16x16, 32x32
- Apple Touch Icon: 180x180
- PWA Icons: 192x192, 512x512
- Logo principal: 512x512
- Open Graph: 1200x630

## Génération d'Assets

Les assets ont été générés avec Python et Pillow. Pour régénérer:

```bash
pip install Pillow
# Utiliser les scripts de génération appropriés
```

## Notes

- Tous les fichiers PNG sont optimisés
- Les icônes sont conçues pour être lisibles sur fonds clairs et sombres
- Le logo représente un nageur stylisé avec des vagues
- Les couleurs sont cohérentes avec le design system de l'application
