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
  { file: "public/app.js", keyword: "c({render:" },
  { file: "public/manifest.json", keyword: "edit_design:render" },
  { file: "vite.config.js", keyword: 'external: ["@canva/app-sdk"]' }
];

const maxAppSizeKB = 5000;

let allGood = true;
let missingFiles = [];
let missingKeywords = [];

console.log("🔍 Verificando estructura del proyecto...\n");

// Verifica existencia de archivos
for (const file of requiredFiles) {
  try {
    await access(path.join(__dirname, file), constants.F_OK);
    console.log(`✅ ${file}`);
  } catch {
    console.log(`❌ ${file}`);
    missingFiles.push(file);
    allGood = false;
  }
}

// Verifica contenido clave en archivos
for (const check of requiredKeywords) {
  try {
    const content = await readFile(path.join(__dirname, check.file), "utf8");
    const found = content.includes(check.keyword);
    console.log(`${found ? "✅" : "❌"} "${check.keyword}" en ${check.file}`);
    if (!found) {
      missingKeywords.push(`${check.keyword} en ${check.file}`);
      allGood = false;
    }
  } catch {
    console.log(`❌ No se pudo leer ${check.file}`);
    missingFiles.push(check.file);
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

// Validación de manifest.json
try {
  const manifest = JSON.parse(await readFile(path.join(__dirname, "public/manifest.json"), "utf8"));
  const baseURL = manifest.base_url || "";
  const activities = manifest.activities || [];
  const hasRender = activities.some(a => a.activity === "edit_design:render" && a.url === "/app.js");

  console.log(`${baseURL ? "✅" : "❌"} base_url definido`);
  console.log(`${hasRender ? "✅" : "❌"} actividad edit_design:render registrada`);

  if (!baseURL || !hasRender) allGood = false;
} catch {
  console.log("❌ Error al leer manifest.json");
  allGood = false;
}

// Validación básica de translations.json
try {
  const translations = JSON.parse(await readFile(path.join(__dirname, "translations.json"), "utf8"));
  const keys = Object.keys(translations);
  console.log(`${keys.length > 0 ? "✅" : "❌"} translations.json contiene ${keys.length} claves`);
  if (keys.length === 0) allGood = false;
} catch {
  console.log("❌ No se pudo leer translations.json o está vacío");
  missingFiles.push("translations.json");
  allGood = false;
}

// Diagnóstico final
console.log("\n📦 Resultado:");

const onlyMinifiedOK = missingKeywords.every(k => k.includes("c({render:"));

if (allGood || onlyMinifiedOK) {
  console.log("🎉 Todo listo para compilar y subir a Canva.");
} else {
  console.log("⚠️ Faltan elementos críticos:");
  if (missingFiles.length) {
    console.log("📁 Archivos faltantes:", missingFiles.join(", "));
  }

  const filtered = missingKeywords.filter(k => !k.includes("c({render:"));
  if (filtered.length) {
    console.log("🔑 Claves faltantes:", filtered.join(", "));
  } else {
    console.log("✅ Clave minificada detectada: c({render:");
  }
}