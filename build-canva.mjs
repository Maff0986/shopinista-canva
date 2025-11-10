import { exec } from "child_process";
import { copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) return reject(stderr || stdout);
      resolve(stdout);
    });
  });
}

const distFile = path.join(__dirname, "dist", "app.js");
const publicFile = path.join(__dirname, "public", "app.js");

(async () => {
  console.log("⚙️ Compilando Canva app...");
  await run("npx vite build --config vite.config.canva.ts");

  console.log("📦 Copiando bundle...");
  await copyFile(distFile, publicFile);

  console.log("🔍 Ejecutando verificación...");
  const result = await run("node verify-setup.mjs");
  console.log(result);
})();
