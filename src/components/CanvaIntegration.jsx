import React, { useState, useEffect } from 'react';

export default function CanvaIntegration() {
  const [csvUrl, setCsvUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [canvaReady, setCanvaReady] = useState(false);

  useEffect(() => {
    // Registrar listener de Canva cuando esté disponible
    if (typeof window !== 'undefined' && window.canva) {
      try {
        window.canva.on?.('edit_design:render', async (event) => {
          console.log('edit_design:render activado', event);
          const confirmed = confirm("Shopinista: ¿desea importar recursos al diseño?");
          return { ok: true, accepted: confirmed };
        });
        console.log('Shopinista Canva App: controladores registrados');
        setCanvaReady(true);
      } catch (err) {
        console.error('Error registrando controladores Canva:', err);
      }
    }
  }, []);

  const handleGenerate = () => {
    if (!csvUrl && !imageUrl) {
      alert("Ingresa CSV o URL de imagen");
      return;
    }

    const assets = [];
    if (imageUrl) assets.push({ type: 'image', src: imageUrl });
    if (csvUrl) assets.push({ type: 'csv', src: csvUrl });

    // Trigger Canva integration
    if (canvaReady && window.canva) {
      window.canva.open?.({
        templateId: templateId || null,
        assets: assets,
        options: { preview: true }
      });
      setStatus('Generado en Canva');
      setPreview(imageUrl || null);
      console.log('Shopinista AI: Assets enviados a Canva', assets);
    } else {
      alert('Canva no está listo aún.');
    }
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow-md w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-2">Generador de Contenido</h2>

      <input
        type="text"
        placeholder="URL CSV o feed"
        value={csvUrl}
        onChange={(e) => setCsvUrl(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <input
        type="text"
        placeholder="URL de imagen"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <input
        type="text"
        placeholder="ID o nombre de plantilla Canva"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={handleGenerate}
      >
        Generar en Canva
      </button>

      {preview && (
        <div className="mt-4">
          <h3 className="font-semibold mb-1">Vista previa:</h3>
          <img src={preview} alt="Preview" className="w-full border rounded" />
        </div>
      )}

      <p className="mt-2">Estado: {status}</p>
    </div>
  );
}
