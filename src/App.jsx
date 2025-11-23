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
      setStatus(`Feed cargado (${data.length} filas)`);
    })();
  }, [payload]);

  const variants = useMemo(() => {
    if (!current?.name) return [];
    return generateCopyVariants(current);
  }, [current]);

  const metrics = {
    totalProducts: rows.length,
    totalVariants: variants.length,
    lastUpdated: new Date().toLocaleString('es-MX')
  };

  const insertText = async () => {
    setStatus('Insertando texto...');
    try {
      await payload?.design?.insertText?.({
        content: `${current.name} — ${current.price}`,
        fontSize: 24
      });
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
        await payload?.design?.insertText?.({
          content: `${row.name} — ${row.price}`,
          fontSize: 22
        });
        await payload?.design?.insertImage?.({ src: row.image_url });
      }
      setStatus('Bulk listo ✅');
    } catch {
      setStatus('Preview web/local: bulk simulado ✅');
    }
  };

  return (
    <main className="min-h-screen flex flex-col gap-4 p-6 bg-neutral-50 text-neutral-800">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shopinista Canva Creator</h1>
        <span className="text-sm">Entorno: {env} | Diseño: {payload?.designId || 'N/A'}</span>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Productos</h2>
          <div className="space-y-2 max-h-96 overflow-auto">
            {rows.map((r, i) => (
              <button
                key={i}
                className={
                  'w-full flex items-center gap-3 p-2 rounded border ' +
                  (i === selectedIndex ? 'border-primary' : 'border-transparent')
                }
                onClick={() => setSelectedIndex(i)}
              >
                <img src={r.image_url} alt="prev" className="w-12 h-12 object-cover rounded border" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-neutral-600">
                    {r.price} • {r.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-1 bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Previsualización</h2>
          <div className="flex gap-4">
            <img src={current.image_url} alt="preview" className="w-28 h-28 object-cover rounded border" />
            <div>
              <p><strong>Nombre:</strong> {current.name}</p>
              <p><strong>Precio:</strong> {current.price}</p>
              <p className="text-xs"><strong>Descripción:</strong> {current.description}</p>
              <p className="text-xs"><strong>SKU:</strong> {current.sku}</p>
              <p className="text-xs"><strong>Categoría:</strong> {current.category}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Variantes (IA sin costo)</h2>
          <ul className="list-disc pl-5 text-sm">
            {variants.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex gap-3">
        <button className="bg-primary text-white px-3 py-2 rounded" onClick={insertText}>Insertar texto</button>
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={insertImage}>Insertar imagen</button>
        <button className="bg-secondary text-white px-3 py-2 rounded" onClick={bulkGenerate}>Generar en masa (20)</button>
      </section>

      <section className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Métricas</h2>
        <p className="text-sm">Productos cargados: {metrics.totalProducts}</p>
        <p className="text-sm">Variantes generadas: {metrics.totalVariants}</p>
        <p className="text-sm">Última actualización: {metrics.lastUpdated}</p>
      </section>

      <section className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Estado y payload</h2>
        <p className="text-sm">Estado: {status}</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </section>
    </main>
  );
}
