#!/usr/bin/env node
/**
 * 🧩 Shopinista Canva - Repair Script
 * Este script limpia conflictos, reinstala dependencias base y valida entorno React + Vite.
 * Autor: Marco + GPT-5 🤖
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "repair-log.txt");

function log(msg) {
  const text = `[${new Date().toLocaleTimeString()}] ${msg}\n`;
  console.log(text);
  fs.appendFileSync(logFile, text);
}

function run(cmd, msg) {
  try {
    log(`→ ${msg}`);
    execSync(cmd, { stdio: "inherit" });
    log(`✔️  ${msg} completado correctamente.`);
  } catch (err) {
    log(`❌ ERROR en: ${msg}\n${err.message}`);
    process.exit(1);
  }
}

async function main() {
  log("=== 🔧 INICIO DEL SCRIPT DE REPARACIÓN SHOPINISTA-CANVA ===");

  // 1️⃣ Eliminar dependencias previas
  ["node_modules", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"].forEach((item) => {
    const filePath = path.join(__dirname, item);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
      log(`🗑️ Eliminado: ${item}`);
    }
  });

  // 2️⃣ Limpiar caché de npm
  run("npm cache clean --force", "Limpieza de caché npm");

  // 3️⃣ Instalar dependencias base
  run("npm install vite@latest react react-dom", "Instalando base Vite + React");
  run("npm install clsx lucide-react papaparse axios", "Instalando librerías auxiliares");
  run("npm install -D typescript @types/react @types/react-dom", "Instalando dependencias de desarrollo (TypeScript)");

  // 4️⃣ Crear estructura mínima si falta
  const folders = [
    "src",
    "src/components",
    "src/hooks",
    "src/services",
    "src/styles",
    "src/utils",
    "public",
    "public/icons",
  ];

  folders.forEach((dir) => {
    const folderPath = path.join(__dirname, dir);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      log(`📁 Creada carpeta: ${dir}`);
    }
  });

  // 5️⃣ Verificar vite.config.ts
  const viteConfig = path.join(__dirname, "vite.config.ts");
  if (!fs.existsSync(viteConfig)) {
    fs.writeFileSync(
      viteConfig,
      `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
      `.trim()
    );
    log("⚙️ Archivo vite.config.ts creado por defecto.");
  } else {
    log("✅ Archivo vite.config.ts ya existe.");
  }

  // 6️⃣ Validar instalación
  log("🔍 Validando instalación...");
  run("npx vite --version", "Verificación de Vite");
  run("npx tsc --version", "Verificación de TypeScript");

  // 7️⃣ Commit opcional
  if (fs.existsSync(".git")) {
    run('git add .', "Agregando archivos a Git");
    run('git commit -m "Reparación completa: entorno limpio y dependencias reinstaladas"', "Creando commit de reparación");
  } else {
    log("⚠️ No hay repositorio Git inicializado. Puedes hacerlo con: git init");
  }

  // 8️⃣ Ejecutar proyecto en prueba
  log("🚀 Ejecutando servidor de desarrollo para validación final...");
  log("Ejecuta manualmente: npm run dev");
  log("=== ✅ REPARACIÓN COMPLETADA CON ÉXITO ===");
}

main();
