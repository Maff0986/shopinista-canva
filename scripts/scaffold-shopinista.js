import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function ok(m) { console.log("✅", m); }
function info(m) { console.log("ℹ️", m); }
function fail(m) { console.error("❌", m); process.exit(1); }

try {
  info("Instalando dependencias: react, ui kit, intents...");
  execSync("npm i @canva/app-ui-kit @canva/intents", { stdio: "inherit" });
  ok("Dependencias Canva instaladas.");
} catch {
  fail("No se pudieron instalar dependencias de Canva.");
}

fs.mkdirSync("src/components", { recursive: true });
fs.mkdirSync("src/mock", { recursive: true });
fs.mkdirSync("scripts", { recursive: true });

fs.writeFileSync("src/main.jsx", `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
let prepareEditDesign;
try { ({ prepareEditDesign } = await import("@canva/intents")); } catch {}
function mount({ payload, env }) {
  const el = document.getElementById("root");
  const root = createRoot(el);
  root.render(<App payload={payload} env={env} />);
}
if (prepareEditDesign) {
  prepareEditDesign({ render: async (context) => { mount({ payload: context, env: "canva" }); } });
} else {
  const mock = await import("./mock/mockCanva.js");
  mount({ payload: mock.default, env: "web" });
}`);

// App.jsx
fs.writeFileSync("src/App.jsx", `import React, { useState } from "react";
import { Button, Text, TextField, Select, Option, Divider, Inline, Stack, Title, Tabs, Tab, IconButton, ColorSwatch, Card, Caption } from "@canva/app-ui-kit";
import { fetchFeed, normalizeItem } from "./feed.js";
import { massCreate } from "./massCreator.js";
import { insertImageFromUrl } from "./renderImage.js";
const palette = ["#0A6EFF","#00C853","#FF4081","#FFC107","#263238"];
export default function App({ payload, env }) {
  const canva = env === "canva";
  const [tab,setTab]=useState("feed");
  const [feedUrl,setFeedUrl]=useState("");
  const [feedType,setFeedType]=useState("json");
  const [items,setItems]=useState([]);
  const [status,setStatus]=useState("Listo");
  const [batchSize,setBatchSize]=useState(10);
  const [tone,setTone]=useState("friendly");
  const [color,setColor]=useState(palette[0]);
  const [currentIndex,setCurrentIndex]=useState(0);
  const current=items[currentIndex];
  async function loadFeed(){
    setStatus("Cargando feed...");
    try{
      const raw=await fetchFeed({type:feedType,url:feedUrl});
      const normalized=raw.map(normalizeItem).filter(x=>x.image);
      setItems(normalized);setCurrentIndex(0);
      setStatus(\`Feed cargado: \${normalized.length} productos\`);
      if(canva)await payload.editor?.notify?.("Feed cargado ✅");
    }catch(err){setStatus("Error al cargar feed");}
  }
  function next(){setCurrentIndex(i=>(i+1)% (items.length||1));}
  function prev(){setCurrentIndex(i=>(i-1+(items.length||1))%(items.length||1));}
  async function insertPreviewImage(){
    if(!current)return;
    setStatus("Insertando imagen...");
    try{await insertImageFromUrl(payload,current.image);await payload.editor?.notify?.(\`Imagen insertada: \${current.title}\`);setStatus("Imagen insertada");}
    catch{setStatus("Fallo al insertar imagen");}
  }
  async function runMassCreation(){
    if(!items.length)return setStatus("No hay productos");
    setStatus("Creación en masa...");
    try{await massCreate({payload,items,batchSize,tone,color});await payload.editor?.notify?.("Creación en masa completada");setStatus("Completada ✅");}
    catch{setStatus("Error en creación en masa");}
  }
  return(<Stack space="large" padding="large">
    <Title>Shopinista Canva</Title>
    <Text>Entorno: {env} · Diseño: {payload?.designId??"N/A"}</Text>
    <Tabs value={tab} onChange={setTab}>
      <Tab value="feed" label="Feed"/><Tab value="preview" label="Vista previa"/><Tab value="mass" label="Creación en masa"/><Tab value="style" label="Estilo"/>
    </Tabs>
    {tab==="feed"&&(<Stack space="medium">
      <Select label="Tipo de feed" value={feedType} onChange={setFeedType}><Option value="json">JSON</Option><Option value="csv">CSV</Option><Option value="mock">Mock</Option></Select>
      {feedType!=="mock"&&(<TextField label="URL del feed" value={feedUrl} onChange={setFeedUrl}/>)}
      <Button variant="primary" onClick={loadFeed}>Cargar feed</Button>
      <Divider/>
      <Inline space="small" wrap>{items.slice(0,8).map((p,i)=>(<Card key={p.id??i} style={{width:160}}><img src={p.image} alt={p.title} style={{width:"100%",height:100,objectFit:"cover"}}/><Caption emphasize>{p.title}</Caption><Caption>{p.price}</Caption></Card>))}</Inline>
    </Stack>)}
    {tab==="preview"&&(<Stack space="medium">{!current?<Text>Sin items</Text>:<>
      <Inline space="small" align="center"><IconButton icon="chevronLeft" onClick={prev}/><img src={current.image} alt={current.title} style={{width:"100%",maxHeight:240,objectFit:"cover"}}/><IconButton icon="chevronRight" onClick={next}/></Inline>
      <Text emphasize>{current.title}</Text><Text>{current.description}</Text>
      <Button variant="primary" onClick={insertPreviewImage}>Insertar imagen</Button></>}</Stack>)}
    {tab==="mass"&&(<Stack space="medium"><Select label="Lote" value={String(batchSize)} onChange={v=>setBatchSize(Number(v))}><Option value="10">10</Option><Option value="50">50</Option><Option value="100">100</Option></Select>
      <Button variant="primary" onClick={runMassCreation}>Generar en masa</Button></Stack>)}
    {tab==="style"&&(<Stack space="small"><Inline space="small" wrap>{palette.map(c=>(<ColorSwatch key={c} color={c} selected={c===color} onClick={()=>setColor(c)}/>))}</Inline>
      <Select label="Tono" value={tone} onChange={setTone}><Option value="friendly">Amigable</Option><Option value="premium">Premium</Option><Option value="direct">Directo</Option></Select></Stack>)}
    <Divider/><Text emphasize>Estado: {status}</Text>{!canva&&<Text>Preview web</Text>}
  </Stack>);
}`);

// feed.js
fs.writeFileSync("src/feed.js", `export async function fetchFeed({type,url}){if(type==="mock"){const mock=await import("./mock/mockFeed.js");return mock.default;}if(!url)throw new Error("URL requerida");const res=await fetch(url);const text=await res.text();if(type==="json"){const data=JSON.parse(text);if(Array.isArray(data))return data;if(Array.isArray(data.items))return data.items;throw new Error("JSON inválido");}else{const lines=text.split(/\\r?\\n/).filter(Boolean);const headers=lines[0].split(",");return lines.slice(1).map(line=>{const cols=line.split(",");const obj={};headers.forEach((h,i)=>obj[h]=cols[i]);return obj;});}}export function normalizeItem(item){const title=item.title??item.name??"";const price=item.price??"";const image=item.image??item.image_url??"";const description=item.description??"";const category=item.category??"";return{title,price,image,description,category,id:item.id??title};}`);

// mockFeed.js
fs.writeFileSync("src/mock/mockFeed.js", `export default[{id:"sku-001",title:"Sofá Orion",price:"14999",image:"https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1200&auto=format",description:"Comodidad moderna",category:"Sala"},{id:"sku-002",title:"Mesa Aurora",price:"8999",image:"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&auto=format",description:"Diseño minimalista",category:"Comedor"}];`);

// renderImage.js
fs.writeFileSync("src/renderImage.js", `function isValidUrl(u) {
  try { new URL(u); return true; } catch { return false; }
}

export async function insertImageFromUrl(payload, imageUrl) {
  if (!isValidUrl(imageUrl)) throw new Error("URL de imagen inválida");
  try {
    const ping = await fetch(imageUrl, { method: "HEAD" });
    if (!ping.ok) throw new Error("HEAD no ok");
  } catch {
    const ping2 = await fetch(imageUrl, { method: "GET" });
    if (!ping2.ok) throw new Error("No se pudo descargar imagen");
  }
  if (payload?.design?.insertImage) {
    await payload.design.insertImage({ src: imageUrl });
  } else {
    console.log("[WEB PREVIEW] Simulación insertImage", imageUrl);
  }
}
`);


// src/massCreator.js
fs.writeFileSync("src/massCreator.js", `import { insertImageFromUrl } from "./renderImage.js";

function pickHeadline(item, tone) {
  const base = item.title || "Producto";
  if (tone === "friendly") return \`\${base} que te abraza 😊\`;
  if (tone === "premium") return \`\${base}: elegancia atemporal\`;
  return \`\${base} al mejor precio\`;
}

export async function massCreate({ payload, items, batchSize, tone, color }) {
  const total = Math.min(items.length, batchSize);
  for (let i = 0; i < total; i++) {
    const item = items[i];
    try {
      await insertImageFromUrl(payload, item.image);
      if (payload?.design?.insertText) {
        await payload.design.insertText({ content: pickHeadline(item, tone), fontSize: 26 });
      } else {
        console.log("[WEB PREVIEW] Texto:", pickHeadline(item, tone));
      }
      await payload?.editor?.notify?.(\`Insertado \${i + 1}/\${total}: \${item.title}\`);
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error("Error procesando item", item.id, err);
    }
  }
}
`);

// src/mock/mockCanva.js
fs.writeFileSync("src/mock/mockCanva.js", `export default {
  designId: "web-preview",
  design: {
    insertText: async (p) => console.log("[WEB] insertText", p),
    insertImage: async (p) => console.log("[WEB] insertImage", p),
  },
  editor: { notify: async (m) => console.log("[WEB] notify", m) },
};
`);

// index.html
fs.writeFileSync("index.html", `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Shopinista Canva</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

// vite.config.js
fs.writeFileSync("vite.config.js", `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    open: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "unsafe-none"
    },
    hmr: { overlay: false }
  },
  build: {
    sourcemap: false,
    outDir: "dist",
    rollupOptions: {
      external: [
        "@canva/bridge",
        "@canva/app-ui-kit",
        "@canva/design",
        "@canva/intents",
        "@canva/intents/design",
        "@canva/user"
      ],
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    }
  }
});
`);

// Ajuste package.json
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  pkg.type = "module";
  pkg.scripts = {
    ...pkg.scripts,
    dev: "vite",
    preview: "vite preview --port 8080",
    build: "node scripts/build-validate.js",
    validate: "node scripts/validate-canva.js",
    postbuild: "node scripts/update-manifest.js",
    release: "node scripts/build-validate.js && node scripts/git-vercel-validate.js"
  };
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
  ok("package.json actualizado con scripts de build/validate/release.");
} else {
  info("package.json no encontrado; omite actualización de scripts.");
}
