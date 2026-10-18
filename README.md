# Handmade Crochet — Showcase

This repo has been converted from a US-state holiday planner into a lightweight static showcase for handmade crochet products.

What I changed
- Rewrote the UI into a modular vanilla JavaScript app (ES modules) under `js/`.
- Replaced the data model with curated sample products in `data/products.json`.
- Added a premium responsive CSS theme in `styles.css` with improved accessibility and keyboard controls.
- Simplified interactions: search, category filter, product detail panel, theme toggle.

How to run
1. Clone the repo
2. Open `index.html` in a modern browser (no build step required) — the app uses ES modules and fetch for static JSON.

Notes & suggestions
- Images in `data/products.json` use Unsplash placeholders. Replace with real images for production.
- Consider adding pagination, a shopping/cart flow, or a CMS for dynamic content.
- If you want, I can convert this to React or add unit tests and CI for deployment.

