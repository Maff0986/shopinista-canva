import fs from "fs";
import { execSync } from "child_process";

const required = [
  "package.json",
  "vite.config.js",
  "postcss.config.js",
  "server.js",
  "public/index.html",
  "src/components/CanvaIntegration.jsx",
  "manifest.json"
];

console.log("🧠 Validando estructura de Shopinista Canva...");

let allGood = true;

for (const file of required) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Faltante: ${file}`);
    allGood = false;
  }
}

if (allGood) {
  console.log("🚀 Compilando para producción...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("🎉 Validación completada correctamente.");
} else {
  console.log("⚠️ Corrige los archivos faltantes antes de compilar.");
}

try {
  execSync("npx vite build --emptyOutDir", { stdio: "inherit" });
  console.log("✅ Build Vite compilado correctamente (JSX y CSS validados)");
} catch (err) {
  console.error("❌ Error en build Vite (revisar JSX/TSX y CSS)");
  allOk = false;
}
