Param(
  [string]$Root = "C:\Users\HP-Home\Projects\shopinista-canva"
)

function WriteFile($path, $content) {
  $dir = Split-Path $path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  Set-Content -Path $path -Value $content -Encoding UTF8
}

# 1) .env example
WriteFile "$Root\.env.example" @"
VITE_FEED_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_PUBLISH_ID/pub?output=csv
VITE_FALLBACK_CSV=enabled
"@

# 2) src/config.js
WriteFile "$Root\src\config.js" @"
export const FEED_CSV_URL = import.meta.env.VITE_FEED_CSV_URL || '';
export const FALLBACK_CSV_ENABLED = String(import.meta.env.VITE_FALLBACK_CSV || 'enabled') === 'enabled';
"@

# 3) src/feed.js
WriteFile "$Root\src\feed.js" @"
import { FEED_CSV_URL, FALLBACK_CSV_ENABLED } from './config.js';

export const exampleCsv = \`name,price,description,image_url,sku,category
Sofá Orion,999,Moderno y cómodo,https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&auto=format,SOF-001,sala
Mesa Luna,249,Madera de roble,https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format,MES-002,comedor
Lámpara Nova,89,LED cálida,https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=400&auto=format,LAM-003,iluminacion\`;

export function parseCsvText(text) {
  const lines = text.split(/\\r?\\n/).filter(Boolean);
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
 * Carga el feed en este orden:
 * 1. Intent payload (si Canva lo provee)
 * 2. Google Sheets CSV (VITE_FEED_CSV_URL)
 * 3. Fallback CSV local (exampleCsv) si está habilitado
 */
export async function loadFeed({ payload } = {}) {
  // 1) Intent payload de Canva (si tuvieras datos: payload.feedCsvText)
  if (payload?.feedCsvText) {
    const parsed = parseCsvText(payload.feedCsvText);
    if (parsed.length) return parsed;
  }

  // 2) Google Sheets CSV
  if (FEED_CSV_URL) {
    try {
      const parsed = await fetchCsv(FEED_CSV_URL);
      if (parsed.length) return parsed;
    } catch (e) {
      console.warn('Sheets CSV fetch failed:', e);
    }
  }

  // 3) Fallback local
  if (FALLBACK_CSV_ENABLED) {
    return parseCsvText(exampleCsv);
  }

  return [];
}
"@

# 4) src/ai/rules.js (IA avanzada)
WriteFile "$Root\src\ai\rules.js" @"
function formatPrice(p) {
  if (!p) return '';
  const n = Number(String(p).replace(/[^0-9.]/g, ''));
  return isFinite(n) ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) : p;
}

const headlineTemplates = [
  ({ name, price }) => \`Descubre \${name} por solo \${formatPrice(price)}\`,
  ({ name }) => \`\${name}: diseño que eleva tu espacio\`,
  ({ name, description }) => \`\${name} — \${description}\`,
  ({ name, price }) => \`Oferta: \${name} a \${formatPrice(price)} hoy\`,
  ({ name }) => \`Convierte tu hogar con \${name}\`,
];

const hashtags = (category) => {
  const base = ['#Shopinista', '#Hogar', '#Diseño', '#Oferta'];
  const map = {
    sala: ['#Sala', '#Confort'],
    comedor: ['#Comedor', '#Madera'],
    iluminacion: ['#Iluminación', '#LED'],
  };
  return Array.from(new Set([...(map[category] || []), ...base]));
};

export function generateCopyVariants({ name, price, description, category }) {
  const base = { name: name || 'Producto', price: price || '', description: description || '', category: category || '' };
  const unique = new Set();
  for (const t of headlineTemplates) unique.add(t(base));
  unique.add(\`\${base.name} | Envío rápido\`);
  unique.add(\`\${base.name} | Garantía de satisfacción\`);
  unique.add(\`\${base.name} | Stock limitado\`);
  const tags = hashtags(base.category).join(' ');
  unique.add(\`Compra hoy: \${base.name} \${tags}\`);
  return Array.from(unique);
}
"@

# 5) src/App.jsx (UI mejorada web + Canva)
WriteFile "$Root\src\App.jsx" @"
import React, { useEffect, useMemo, useState } from 'react';
import { generateCopyVariants } from './ai/rules.js';
import { loadFeed } from './feed.js';

export default function App({ payload, env }) {
  const [status, setStatus] = useState('idle');
  const [rows, setRows] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = rows[selectedIndex] || {};

  useEffect(() => {
    (async () => {
      setStatus('Cargando feed...');
      const data = await loadFeed({ payload }).catch(() => []);
      setRows(data);
      setStatus(\`Feed cargado (\${data.length} filas)\`);
    })();
  }, [payload]);

  const variants = useMemo(() => {
    if (!current?.name) return [];
    return generateCopyVariants({
      name: current.name,
      price: current.price,
      description: current.description,
      category: current.category
    });
  }, [current]);

  const insertText = async () => {
    setStatus('Insertando texto...');
    try {
      await payload?.design?.insertText?.({ content: \`\${current.name} — \${current.price}\`, fontSize: 24 });
      setStatus('Texto insertado ✅');
    } catch {
      setStatus('Preview web/local: texto simulado ✅');
    }
  };

  const insertImage = async () => {
    setStatus('Insertando imagen...');
    try {
      await payload?.design?.insertImage?.({ src: current.image_url });
      setStatus('Imagen insertada ✅');
    } catch {
      setStatus('Preview web/local: imagen simulada ✅');
    }
  };

  const bulkGenerate = async () => {
    setStatus('Generando en masa...');
    try {
      for (const row of rows.slice(0, 20)) {
        await payload?.design?.insertText?.({ content: \`\${row.name} — \${row.price}\`, fontSize: 22 });
        await payload?.design?.insertImage?.({ src: row.image_url });
      }
      setStatus('Bulk listo ✅');
    } catch {
      setStatus('Preview web/local: bulk simulado ✅');
    }
  };

  return (
    <main className='min-h-screen flex flex-col gap-4 p-6 bg-neutral-50 text-neutral-800'>
      <header className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Shopinista Canva Creator</h1>
        <span className='text-sm'>Entorno: {env} | Diseño: {payload?.designId || 'N/A'}</span>
      </header>

      <section className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='md:col-span-1 bg-white rounded shadow p-4'>
          <h2 className='font-semibold mb-2'>Productos</h2>
          <div className='space-y-2 max-h-96 overflow-auto'>
            {rows.map((r, i) => (
              <button
                key={i}
                className={'w-full flex items-center gap-3 p-2 rounded border ' + (i === selectedIndex ? 'border-primary' : 'border-transparent')}
                onClick={() => setSelectedIndex(i)}
              >
                <img src={r.image_url} alt='prev' className='w-12 h-12 object-cover rounded border' />
                <div className='text-left'>
                  <div className='text-sm font-semibold'>{r.name}</div>
                  <div className='text-xs text-neutral-600'>{r.price} • {r.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className='md:col-span-1 bg-white rounded shadow p-4'>
          <h2 className='font-semibold mb-2'>Previsualización</h2>
          <div className='flex gap-4'>
            <img src={current.image_url} alt='preview' className='w-28 h-28 object-cover rounded border' />
            <div>
              <p><strong>Nombre:</strong> {current.name}</p>
              <p><strong>Precio:</strong> {current.price}</p>
              <p className='text-xs'><strong>Descripción:</strong> {current.description}</p>
              <p className='text-xs'><strong>SKU:</strong> {current.sku}</p>
              <p className='text-xs'><strong>Categoría:</strong> {current.category}</p>
            </div>
          </div>
        </div>

        <div className='md:col-span-1 bg-white rounded shadow p-4'>
          <h2 className='font-semibold mb-2'>Variantes (IA sin costo)</h2>
          <ul className='list-disc pl-5 text-sm'>
            {variants.map((v, i) => (<li key={i}>{v}</li>))}
          </ul>
        </div>
      </section>

      <section className='flex gap-3'>
        <button className='bg-primary text-white px-3 py-2 rounded' onClick={insertText}>Insertar texto</button>
        <button className='bg-green-600 text-white px-3 py-2 rounded' onClick={insertImage}>Insertar imagen</button>
        <button className='bg-secondary text-white px-3 py-2 rounded' onClick={bulkGenerate}>Generar en masa (20)</button>
      </section>

      <section className='bg-white rounded shadow p-4'>
        <h2 className='font-semibold mb-2'>Estado y payload</h2>
        <p className='text-sm'>Estado: {status}</p>
        <pre className='text-xs bg-gray-100 p-2 rounded overflow-x-auto'>{JSON.stringify(payload, null, 2)}</pre>
      </section>
    </main>
  );
}
"@

# 6) Tailwind: opcional mejora de theme
WriteFile "$Root\tailwind.config.js" @"
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2B6CB0',
        secondary: '#2C5282',
        success: '#16A34A'
      }
    }
  },
  plugins: []
};
"@

# 7) README: instrucciones para Sheets + web
WriteFile "$Root\README.md" @"
# Shopinista Canva Creator (Upgrade)

## Google Sheets como CSV (publicado)
1. Publica tu Sheet: Archivo → Publicar en la web → Como CSV.
2. Copia el enlace y pega en .env:
   VITE_FEED_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_PUBLISH_ID/pub?output=csv
3. Opcional: desactiva el CSV fallback local:
   VITE_FALLBACK_CSV=disabled

## Desarrollo web/local
- npm install
- npm run dev → http://localhost:8080 (mock Canva)
- Ajusta .env para tu feed real y recarga.

## Build y validación
- npm run build
- npm run validate (o usa validate-manifest.ps1)

## En Canva
- Sube dist/ + manifest.json.
- El intent edit_design:render se registra y usa el SDK inyectado.
"@

Write-Host "✅ Upgrade aplicado. Archivos actualizados:"
Write-Host " - .env.example"
Write-Host " - src/config.js"
Write-Host " - src/feed.js"
Write-Host " - src/ai/rules.js"
Write-Host " - src/App.jsx"
Write-Host " - tailwind.config.js"
Write-Host " - README.md"
