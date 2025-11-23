// scripts/update-manifest.js
import fs from "fs";
import path from "path";

const manifestPath = path.resolve("manifest.json");
const distAssetsPath = path.resolve("dist/assets");

function fail(msg) {
  console.error("❌ Update failed:", msg);
  process.exit(1);
}

function ok(msg) {
  console.log("✅", msg);
}

// 1. Verificar que manifest.json existe
if (!fs.existsSync(manifestPath)) {
  fail("manifest.json no encontrado en la raíz del proyecto.");
}

// 2. Buscar el último archivo JS en dist/assets
if (!fs.existsSync(distAssetsPath)) {
  fail("dist/assets no existe. ¿Ya corriste npm run build?");
}

const files = fs.readdirSync(distAssetsPath).filter(f => f.endsWith(".js"));
if (!files.length) {
  fail("No se encontró ningún archivo .js en dist/assets.");
}

// Tomamos el más reciente por fecha de modificación
const latestFile = files
  .map(f => ({
    name: f,
    time: fs.statSync(path.join(distAssetsPath, f)).mtime.getTime()
  }))
  .sort((a, b) => b.time - a.time)[0].name;

// 3. Actualizar manifest.json
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.runtime = { src: `assets/${latestFile}` };

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
ok(`Updated manifest runtime src -> assets/${latestFile}`);
