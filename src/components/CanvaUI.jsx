import React, { useState } from "react";

export default function CanvaUI() {
  const [status, setStatus] = useState("idle");
  const [feed, setFeed] = useState("");
  const [template, setTemplate] = useState("");

  const handleGenerate = () => {
    setStatus("working...");
    console.log("⚙️ Generando contenido desde:", feed, "usando plantilla:", template);
    setTimeout(() => {
      setStatus("✅ Generado con éxito en Canva");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-800 to-indigo-700 text-white p-8 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold mb-4">🧠 Shopinista Canva</h1>
      <p className="text-sm mb-6 text-gray-200">Generador de contenido inteligente</p>

      <input
        type="text"
        placeholder="URL del feed o CSV"
        className="w-full max-w-md p-2 mb-2 rounded-lg text-gray-900"
        value={feed}
        onChange={(e) => setFeed(e.target.value)}
      />
      <input
        type="text"
        placeholder="ID o nombre de plantilla Canva"
        className="w-full max-w-md p-2 mb-4 rounded-lg text-gray-900"
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="bg-yellow-400 text-gray-900 font-semibold px-6 py-2 rounded-full hover:bg-yellow-500 transition-all"
      >
        Generar en Canva
      </button>

      <p className="mt-4 text-sm">{status}</p>
    </div>
  );
}
