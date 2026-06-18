# Site VTC Premium — Nanterre / La Défense

Site vitrine statique (HTML / CSS / JS, sans backend) avec calculateur de
tarif et réservation instantanée via WhatsApp.

## Arborescence
```
index.html        → page unique, toutes les sections (Accueil, Services, Tarifs, Avis, FAQ, Contact)
css/styles.css     → design system (noir / blanc ivoire / or), responsive, animations
js/script.js       → navigation, calculateur de tarif, envoi WhatsApp, formulaire
images/            → à compléter avec vos propres visuels (logo, photo véhicule…)
```

## ⚠️ À personnaliser avant mise en ligne

1. **Numéro WhatsApp / téléphone**
   Dans `js/script.js`, en haut du fichier :
   ```js
   const CONFIG = {
     whatsappNumber: "33612345678", // votre numéro, format international sans + ni 00
     phoneDisplay: "06 12 34 56 78",
   };
   ```
   Remplacez aussi les `tel:+33612345678` et `wa.me/33612345678` dans
   `index.html` (recherchez/remplacez ces deux chaînes dans tout le fichier).

2. **Email** — remplacez `contact@votre-domaine-vtc.fr` dans `index.html`.

3. **Nom de domaine** — remplacez `https://www.votre-domaine-vtc.fr/` dans les
   balises `<meta>` (Open Graph, canonical) et le JSON-LD en haut de `<head>`.

4. **SIRET / mentions légales** — section `.footer-legal` dans `index.html`.

5. **Tarifs** — la grille `ROUTE_PRICES` dans `js/script.js` (utilisée par le
   calculateur) et le tableau visible dans la section `#tarifs` de
   `index.html` doivent rester cohérents entre eux.

6. **Image Open Graph** — ajoutez une image `images/og-cover.jpg` (1200×630px)
   pour un bel aperçu lors du partage sur les réseaux sociaux.

7. **Carte** — l'iframe Google Maps dans la section Contact utilise une
   recherche texte simple ("La Défense, Nanterre"). Vous pouvez la remplacer
   par l'adresse exacte de votre zone de prise en charge si besoin.

## Comment ça fonctionne (pas de serveur requis)

- Le **calculateur de tarif** (section "Réservation instantanée") calcule une
  estimation à partir d'une grille de prix fixe, puis ouvre WhatsApp avec un
  message pré-rempli (trajet, date, heure, passagers, estimation).
- Le **formulaire de contact** fonctionne sur le même principe : à la
  soumission, un message structuré est généré et WhatsApp s'ouvre dans un
  nouvel onglet avec le texte prêt à envoyer (aucune donnée n'est stockée ou
  envoyée à un serveur).
- Le **bouton WhatsApp flottant** et la **barre d'actions mobile** (en bas de
  l'écran sur smartphone) permettent un contact direct à tout moment.

## Mise en ligne

Le site est 100% statique : vous pouvez l'héberger gratuitement sur GitHub
Pages, Netlify, Vercel ou tout hébergement mutualisé. Il suffit de copier les
fichiers (`index.html`, `css/`, `js/`, `images/`) tels quels, sans étape de
build.

## SEO déjà intégré

- Title, meta description et mots-clés ciblés (VTC Nanterre, chauffeur privé
  La Défense, VTC Paris, chauffeur privé CDG/Orly…).
- Open Graph + Twitter Card pour le partage.
- Données structurées `schema.org/TaxiService` (JSON-LD) pour le référencement
  local.
- Structure sémantique (`h1` unique, `h2`/`h3` hiérarchisés, `alt`/`aria-label`
  sur les éléments interactifs).

Pensez à créer une fiche **Google Business Profile** avec la même adresse,
le même numéro et les mêmes zones de service : c'est ce qui pèse le plus pour
le référencement local "VTC Nanterre" / "VTC La Défense".
