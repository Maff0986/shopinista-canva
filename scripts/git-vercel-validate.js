// scripts/git-vercel-validate.js
import fs from "fs";
import { execSync } from "child_process";

function fail(msg) {
  console.error("❌", msg);
  process.exit(1);
}
function ok(msg) {
  console.log("✅", msg);
}

// 1. Validar manifest.json
if (!fs.existsSync("manifest.json")) fail("manifest.json no encontrado.");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf-8"));
if (!manifest.intents || !manifest.intents.includes("edit_design:render")) {
  fail("El intent edit_design:render no está en manifest.json.");
}
ok("Manifest.json válido con intent edit_design:render.");

// 2. Validar estado de Git
try {
  const status = execSync("git status --porcelain").toString().trim();
  if (status) {
    console.log("⚠️ Tienes cambios sin commit:");
    console.log(status);
  } else {
    ok("No hay cambios pendientes en Git.");
  }
} catch {
  fail("Git no está inicializado en este proyecto.");
}

// 3. Validar carpeta dist para Vercel
if (!fs.existsSync("dist")) fail("No existe carpeta dist. Corre npm run build.");
ok("Carpeta dist lista para deploy en Vercel.");
