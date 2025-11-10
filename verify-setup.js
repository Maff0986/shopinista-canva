import { readFile, stat, access } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const requiredFiles = [
  "package.json",
  "vite.config.js",
  "public/app.js",
  "public/manifest.json",
  "public/index.html",
  "src/main.tsx",
  "translations.json"
];

const requiredKeywords = [
  { file: "public/app.js", keyword: "registerApp({" },
  { file: "public/app.js", keyword: "edit_design:render" },
  { file: "public/manifest.json", keyword: "edit_design:render" },
  { file: "vite.config.js", keyword: 'external: ["@canva/app-sdk"]' }
];

const maxAppSizeKB = 5000;

console.log("🔍 Verificando estructura del proyecto...\n");

let allGood = true;

// Verifica existencia de archivos
for (const file of requiredFiles) {
  try {
    await access(path.join(__dirname, file), constants.F_OK);
    console.log(`✅ ${file}`);
  } catch {
    console.log(`❌ ${file}`);
    allGood = false;
  }
}

// Verifica contenido clave en archivos
for (const check of requiredKeywords) {
  try {
    const content = await readFile(path.join(__dirname, check.file), "utf8");
    const found = content.includes(check.keyword);
    console.log(`${found ? "✅" : "❌"} "${check.keyword}" en ${check.file}`);
    if (!found) allGood = false;
  } catch {
    console.log(`❌ No se pudo leer ${check.file}`);
    allGood = false;
  }
}

// Verifica tamaño de app.js
try {
  const stats = await stat(path.join(__dirname, "public/app.js"));
  const sizeKB = Math.round(stats.size / 1024);
  const sizeOK = sizeKB <= maxAppSizeKB;
  console.log(`${sizeOK ? "✅" : "❌"} app.js pesa ${sizeKB} KB`);
  if (!sizeOK) allGood = false;
} catch {
  console.log("❌ No se pudo verificar el tamaño de app.js");
  allGood = false;
}

console.log("\n📦 Resultado:");
if (allGood) {
  console.log("🎉 Todo listo para compilar y subir a Canva.");
} else {
  console.log("⚠️ Faltan archivos, claves o el bundle es demasiado grande. Revisa los ❌ anteriores.");
}
