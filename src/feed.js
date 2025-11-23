import { FEED_CSV_URL, FALLBACK_CSV_ENABLED } from './config.js';

export const exampleCsv = `name,price,description,image_url,sku,category
Sofá Orion,999,Moderno y cómodo,https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&auto=format,SOF-001,sala
Mesa Luna,249,Madera de roble,https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format,MES-002,comedor
Lámpara Nova,89,LED cálida,https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=400&auto=format,LAM-003,iluminacion`;

export function parseCsvText(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const row = {};
    headers.forEach((h, i) => { row[h] = (cols[i] || '').trim(); });
    return row;
  });
}

export async function fetchCsv(url) {
  const res = await fetch(url, { mode: 'cors' }).catch(() => null);
  if (!res || !res.ok) throw new Error('CSV fetch failed');
  const text = await res.text();
  return parseCsvText(text);
}

/**
 * Orden de carga:
 * 1) payload.feedCsvText (si Canva lo env?a)
 * 2) CSV publicado de Google Sheets (FEED_CSV_URL)
 * 3) Fallback local (exampleCsv) si est? habilitado
 */
export async function loadFeed({ payload } = {}) {
  if (payload?.feedCsvText) {
    const parsed = parseCsvText(payload.feedCsvText);
    if (parsed.length) return parsed;
  }
  if (FEED_CSV_URL) {
    try {
      const parsed = await fetchCsv(FEED_CSV_URL);
      if (parsed.length) return parsed;
    } catch (e) {
      console.warn('Sheets CSV fetch failed:', e);
    }
  }
  if (FALLBACK_CSV_ENABLED) return parseCsvText(exampleCsv);
  return [];
}
