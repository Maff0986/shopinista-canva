# Shopinista Canva Creator (Integrado)

## Google Sheets como CSV
- Publica: Archivo ? Publicar en la web ? Como CSV.
- .env:
  VITE_FEED_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_PUBLISH_ID/pub?output=csv
  VITE_FALLBACK_CSV=enabled

## Desarrollo web/local
- npm install
- npm run dev
- Ajusta .env y recarga.

## Build y validaci?n
- npm run build
- validate-manifest.ps1 (opcional) o postbuild

## En Canva
- Sube dist/ + manifest.json.
- Intent edit_design:render con SDK.
