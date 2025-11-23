// scripts/validate-canva.js
import fs from "fs";
import path from "path";

const manifestPath = path.resolve("manifest.json");
const distPath = path.resolve("dist/assets");

function fail(msg) {
  console.error("❌ Validation failed:", msg);
  process.exit(1);
}

function ok(msg) {
  console.log("✅", msg);
}

// 1. Verificar manifest.json
if (!fs.existsSync(manifestPath)) {
  fail("manifest.json no encontrado en la raíz del proyecto.");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

// 2. Validar runtime.src
if (!manifest.runtime || !manifest.runtime.src) {
  fail("manifest.json no tiene runtime.src definido.");
}

const runtimeFile = path.resolve("dist", manifest.runtime.src);
if (!fs.existsSync(runtimeFile)) {
  fail(`El archivo de runtime ${manifest.runtime.src} no existe en dist/.`);
}
ok(`runtime.src apunta a ${manifest.runtime.src} y existe.`);

// 3. Validar intents
if (!manifest.intents || !manifest.intents.includes("edit_design:render")) {
  fail("El intent edit_design:render no está registrado en manifest.json.");
}
ok("Intent edit_design:render está presente.");

// 4. Todo correcto
ok("Manifest validado correctamente.");
