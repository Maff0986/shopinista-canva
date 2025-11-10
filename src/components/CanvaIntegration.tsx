import React, { useState } from "react";

export default function CanvaIntegration() {
  const [csvFile, setCsvFile] = useState(null);
  const [csvUrl, setCsvUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [count, setCount] = useState(0);

  // 🔹 Procesar archivo CSV local
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split("\n").map((r) => r.split(","));
        setProducts(rows);
        setStatus("Archivo CSV cargado correctamente.");
      };
      reader.readAsText(file);
    }
  };

  // 🔹 Cargar CSV desde una URL
  const handleLoadCsvUrl = async () => {
    try {
      setStatus("Cargando CSV desde URL...");
      const response = await fetch(csvUrl);
      const text = await response.text();
      const rows = text.split("\n").map((r) => r.split(","));
      setProducts(rows);
      setStatus("CSV cargado exitosamente desde la URL.");
    } catch (error) {
      console.error(error);
      setStatus("Error al cargar CSV desde la URL.");
    }
  };

  // 🔹 Cargar imagen desde URL
  const handleImagePreview = () => {
    if (imageUrl) {
      setPreview(imageUrl);
      setStatus("Vista previa de imagen generada.");
    }
  };

  // 🔹 Simular conexión con Tiendanube
  const connectTiendanube = async () => {
    try {
      setStatus("Conectando con Tiendanube...");
      // Ejemplo de endpoint público de prueba
      const response = await fetch("https://api.tiendanube.com/v1/");
      if (response.ok) {
        setStatus("✅ Conexión con Tiendanube verificada.");
      } else {
        setStatus("⚠️ No se pudo verificar la conexión con Tiendanube.");
      }
    } catch {
      setStatus("⚠️ Error de conexión con Tiendanube.");
    }
  };

  // 🔹 Enviar producto o imagen a Canva (simulado)
  const sendToCanva = () => {
    setStatus("🧠 Enviando datos a Canva...");
    setTimeout(() => {
      setStatus("✅ Datos enviados correctamente a Canva.");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">
        🛋️ Shopinista Canva Integration
      </h1>
      <p className="mb-6 text-center text-gray-700">
        🚀 Tu entorno de desarrollo está listo para crear contenido visual e integraciones automáticas con Canva y Tiendanube.
      </p>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">✨ Generador de Contenido</h2>

        <input
          type="text"
          placeholder="Texto o promoción"
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-3"
        />

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="URL del archivo CSV"
            value={csvUrl}
            onChange={(e) => setCsvUrl(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={handleLoadCsvUrl}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Cargar
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="URL de imagen"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={handleImagePreview}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Vista previa
          </button>
        </div>

        {preview && (
          <div className="mb-3">
            <p className="text-gray-600 mb-1">Vista previa:</p>
            <img
              src={preview}
              alt="Vista previa"
              className="rounded-lg shadow-md w-full object-contain"
            />
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">
          {status || "Esperando acción..."}
        </p>

        <div className="flex gap-2">
          <button
            onClick={connectTiendanube}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-1/2"
          >
            Conectar Tiendanube
          </button>
          <button
            onClick={sendToCanva}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-1/2"
          >
            Enviar a Canva
          </button>
        </div>
      </div>

      <div className="mt-6 text-gray-700 text-sm text-center">
        <p>Contador de pruebas: {count}</p>
        <button
          onClick={() => setCount(count + 1)}
          className="bg-gray-700 text-white px-3 py-1 mt-2 rounded hover:bg-gray-800"
        >
          Incrementar contador
        </button>
      </div>

      <footer className="mt-8 text-gray-500 text-sm text-center">
        🧠 Powered by <strong>Shopinista AI</strong> · Canva & Tiendanube Integration
      </footer>
    </div>
  );
}
