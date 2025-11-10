import { exec } from "child_process";
import { readdir, rm, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "dist", "assets");
const publicPath = path.join(__dirname, "public", "app.js");

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) return reject(stderr || stdout);
      resolve(stdout);
    });
  });
}

async function buildAndVerify() {
  console.log("🧹 Limpiando carpeta dist...");
  await rm(path.join(__dirname, "dist"), { recursive: true, force: true });

  console.log("⚙️ Ejecutando build...");
  await run("npm run build");

  console.log("📦 Buscando archivo generado...");
  const files = await readdir(distPath);
  const jsFile = files.find(f => f.endsWith(".js"));
  if (!jsFile) throw new Error("❌ No se encontró archivo JS en dist/assets");

  const source = path.join(distPath, jsFile);
  await copyFile(source, publicPath);
  console.log(`✅ Copiado: ${jsFile} → public/app.js`);

  console.log("🔍 Ejecutando verificación final...");
  const output = await run("node verify-setup.mjs");
  console.log(output);
}

buildAndVerify().catch(err => {
  console.error("❌ Error en postbuild:", err);
});
