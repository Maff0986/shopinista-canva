// scripts/build-validate.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function fail(msg) {
  console.error("❌", msg);
  process.exit(1);
}
function ok(msg) {
  console.log("✅", msg);
}

// 1. Ejecutar vite build
try {
  console.log("🚀 Ejecutando vite build...");
  execSync("vite build", { stdio: "inherit" });
} catch (err) {
  fail("Error durante vite build");
}

// 2. Actualizar manifest.json con el último archivo en dist/assets
const manifestPath = path.resolve("manifest.json");
const distAssetsPath = path.resolve("dist/assets");

if (!fs.existsSync(manifestPath)) fail("manifest.json no encontrado.");
if (!fs.existsSync(distAssetsPath)) fail("dist/assets no existe.");

const files = fs.readdirSync(distAssetsPath).filter(f => f.endsWith(".js"));
if (!files.length) fail("No se encontró ningún archivo .js en dist/assets.");

const latestFile = files
  .map(f => ({
    name: f,
    time: fs.statSync(path.join(distAssetsPath, f)).mtime.getTime()
  }))
  .sort((a, b) => b.time - a.time)[0].name;

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.runtime = { src: `assets/${latestFile}` };

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
ok(`Manifest actualizado: runtime.src -> assets/${latestFile}`);

// 3. Validar manifest.json
if (!manifest.intents || !manifest.intents.includes("edit_design:render")) {
  fail("El intent edit_design:render no está presente en manifest.json.");
}
ok("Intent edit_design:render está presente.");
ok("Manifest validado correctamente ✅");
