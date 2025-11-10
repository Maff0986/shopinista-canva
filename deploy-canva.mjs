// deploy-canva.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";

const manifestPath = "public/manifest.json";
const expectedBaseUrl = "https://shopinista-canva.vercel.app";

// Step 1: Run verification
console.log("🔍 Ejecutando verificador...");
try {
  execSync("node verify-setup.mjs", { stdio: "inherit" });
} catch {
  console.error("❌ Verificación fallida. Corrige los errores antes de continuar.");
  process.exit(1);
}

// Step 2: Sync manifest base_url
console.log("🔧 Sincronizando manifest.json...");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.base_url = expectedBaseUrl;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log("✅ base_url actualizado:", expectedBaseUrl);

// Step 3: Git commit
console.log("📦 Preparando commit...");
try {
  execSync(`git add ${manifestPath}`, { stdio: "inherit" });
  execSync(`git commit -m "✅ Manifest sincronizado para Canva"`, { stdio: "inherit" });
  execSync("git pull --rebase origin main", { stdio: "inherit" });
  execSync("git push origin main", { stdio: "inherit" });
  console.log("✅ Cambios subidos a Git.");
} catch {
  console.warn("⚠️ No se pudo hacer push. Ejecuta 'git pull --rebase' manualmente si hay conflictos.");
}

// Step 4: Deploy to Vercel
console.log("🚀 Subiendo a Vercel...");
try {
  execSync("vercel deploy --prod --confirm", { stdio: "inherit" });
  console.log("🎉 App desplegada en Vercel.");
  console.log("🔗 Verifica en:", expectedBaseUrl + "/app.js");
} catch {
  console.error("❌ Error al subir a Vercel. Verifica tu configuración.");
}
