// 🧠 verify-setup.js — Verifica instalación del entorno
import { execSync } from 'child_process';
import fs from 'fs';

console.log("🔍 Verificando entorno...");

try {
  execSync('node -v', { stdio: 'inherit' });
  execSync('npm -v', { stdio: 'inherit' });
  console.log("✅ Node y npm instalados correctamente.");
} catch {
  console.error("❌ Node.js o npm no instalados.");
}

if (fs.existsSync('package.json')) {
  console.log("📦 package.json encontrado.");
} else {
  console.error("⚠️ No existe package.json. Ejecuta: npm init -y");
}

if (fs.existsSync('public/manifest.json')) {
  console.log("🪪 manifest.json detectado ✅");
} else {
  console.warn("⚠️ Falta manifest.json dentro de /public");
}
