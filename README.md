# Kaio — Food Safety, Sorted

Free MPI food safety compliance app for NZ cafes and restaurants. Kaio helps you record temperatures, daily diary checks, staff training, supplier records, allergen registers, and more — all stored locally on your device.

## Features

- **13 compliance sections** — temperature logs, daily diary, cleaning, staff training, suppliers, allergens, cooking/cooling validation, calibration, complaints, incidents, and 4-week reviews
- **Audit & operator modes** — audit report home for inspections, operator dashboard for daily tasks
- **Backup & restore** — export and import all records as JSON
- **PDF & Excel export** — per-section exports for audits
- **PWA** — installable on phones and tablets, works offline after first visit
- **Dark mode** — easy on the eyes during early/late shifts

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/kaio/](http://localhost:5173/kaio/) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Deployment

Kaio deploys to GitHub Pages automatically on push to `main` or `master`. The app is served at `/kaio/`.

CI runs lint, build, and deploy. Enable GitHub Pages with the **GitHub Actions** source in your repo settings.

## Data storage

All data is stored in the browser's `localStorage` under `cafe-*` and `kaio-*` keys. Use **Backup & Export** in the sidebar to download a JSON backup. Restore replaces all Kaio records — back up before importing.

## Tech stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- date-fns, ExcelJS, jsPDF
- vite-plugin-pwa (service worker + manifest)

## License

Private — all rights reserved.
