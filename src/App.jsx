// src/App.jsx
import React, { useState } from "react";
import {
  Button,
  Text,
  TextField,
  Select,
  Option,
  Divider,
  Inline,
  Stack,
  Title,
  Tabs,
  Tab,
  IconButton,
  ColorSwatch,
} from "@canva/app-ui-kit";

// Ejemplos de imágenes para el carrusel
const sampleImages = [
  { id: "1", src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format" },
  { id: "2", src: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format" },
  { id: "3", src: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800&auto=format" },
];

// Paleta de colores
const palette = ["#0A6EFF", "#00C853", "#FF4081", "#FFC107", "#263238"];

export default function App({ payload, env }) {
  const [tab, setTab] = useState("images");
  const [prompt, setPrompt] = useState("Ideas de headline para Sofá Orion");
  const [tone, setTone] = useState("friendly");
  const [status, setStatus] = useState("Listo");
  const [color, setColor] = useState(palette[0]);

  const canva = env === "canva";

  // Estado del carrusel
  const [index, setIndex] = useState(0);
  const image = sampleImages[index];
  const next = () => setIndex((i) => (i + 1) % sampleImages.length);
  const prev = () => setIndex((i) => (i - 1 + sampleImages.length) % sampleImages.length);

  // Acción: insertar imagen
  async function insertSelectedImage() {
    setStatus("Insertando imagen...");
    try {
      await payload?.design?.insertImage?.({ src: image.src });
      await payload?.editor?.notify?.("Imagen insertada ✅");
      setStatus("Imagen insertada");
    } catch {
      setStatus("Preview web: imagen simulada ✅");
    }
  }

  // Acción: generar texto IA
  async function insertGeneratedText() {
    setStatus("Generando texto con IA...");
    const ideas = [
      "Sofá Orion: comodidad moderna que abraza tu estilo.",
      "Diseño que invita a quedarse: Orion en tu sala.",
      "Eleva tu espacio con la línea Orion.",
    ];
    const chosen = ideas[Math.floor(Math.random() * ideas.length)];
    const content = tone === "friendly" ? `${chosen} 😊` : chosen;
    try {
      await payload?.design?.insertText?.({ content, fontSize: 28 });
      await payload?.editor?.notify?.("Texto insertado ✅");
      setStatus("Texto insertado");
    } catch {
      setStatus("Preview web: texto simulado ✅");
    }
  }

  // Acción: aplicar color
  async function applyAccentColor() {
    setStatus("Aplicando color...");
    try {
      await payload?.editor?.notify?.(`Color aplicado: ${color}`);
      setStatus("Color aplicado");
    } catch {
      setStatus("Preview web: color simulado ✅");
    }
  }

  return (
    <Stack space="large" padding="large">
      <Title>Shopinista Canva</Title>
      <Text>Entorno: {env} · Diseño: {payload?.designId ?? "N/A"}</Text>

      <Tabs value={tab} onChange={setTab}>
        <Tab value="images" label="Imágenes" />
        <Tab value="text" label="Texto IA" />
        <Tab value="colors" label="Colores" />
      </Tabs>

      {tab === "images" && (
        <Stack space="medium">
          <Inline space="small" align="center">
            <IconButton icon="chevronLeft" aria-label="Anterior" onClick={prev} />
            <img
              src={image.src}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: 240,
                objectFit: "cover",
                borderRadius: 12,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
              }}
            />
            <IconButton icon="chevronRight" aria-label="Siguiente" onClick={next} />
          </Inline>
          <Button variant="primary" onClick={insertSelectedImage}>
            Insertar imagen seleccionada
          </Button>
        </Stack>
      )}

      {tab === "text" && (
        <Stack space="medium">
          <TextField label="Prompt" value={prompt} onChange={setPrompt} />
          <Select label="Tono" value={tone} onChange={setTone}>
            <Option value="friendly">Amigable</Option>
            <Option value="premium">Premium</Option>
            <Option value="direct">Directo</Option>
          </Select>
          <Button variant="primary" onClick={insertGeneratedText}>
            Generar e insertar texto
          </Button>
        </Stack>
      )}

      {tab === "colors" && (
        <Stack space="small">
          <Inline space="small" wrap>
            {palette.map((c) => (
              <ColorSwatch
                key={c}
                color={c}
                selected={c === color}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </Inline>
          <Button variant="secondary" onClick={applyAccentColor}>
            Aplicar color de acento
          </Button>
        </Stack>
      )}

      <Divider />
      <Text emphasize>Estado: {status}</Text>
      {!canva && <Text>Estás en modo preview web. Las acciones se simulan en consola.</Text>}
    </Stack>
  );
}
