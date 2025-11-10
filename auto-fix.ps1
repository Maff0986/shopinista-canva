Write-Host "🧠 Iniciando verificación de entorno Shopinista Canva..." -ForegroundColor Cyan

$viteFile = "vite.config.ts"
$viteBackup = "vite.config.backup.ts"

# 1️⃣ Verificar si vite.config.ts existe
if (-Not (Test-Path $viteFile)) {
    Write-Host "❌ vite.config.ts no encontrado. Creando nuevo archivo limpio..." -ForegroundColor Yellow
    @'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: "dist", sourcemap: true },
});
'@ | Out-File $viteFile -Encoding utf8
} else {
    # 2️⃣ Validar contenido del archivo
    $viteContent = Get-Content $viteFile -Raw
    if ($viteContent -match "iimport|,opinista|Unexpected|Error") {
        Write-Host "⚠️ Archivo vite.config.ts corrupto. Restaurando desde backup..." -ForegroundColor Yellow
        if (Test-Path $viteBackup) {
            Copy-Item $viteBackup $viteFile -Force
        } else {
            @'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: "dist", sourcemap: true },
});
'@ | Out-File $viteFile -Encoding utf8
        }
    }
}

# 3️⃣ Respaldar vite.config.ts actual
Copy-Item $viteFile $viteBackup -Force

# 4️⃣ Probar compilación de Vite
Write-Host "🚀 Verificando build..." -ForegroundColor Cyan
try {
    npm run build | Out-Null
    Write-Host "✅ Build completado correctamente." -ForegroundColor Green
} catch {
    Write-Host "❌ Error detectado en build. Reparando..." -ForegroundColor Red
    Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
    npm install
}

# 5️⃣ Reiniciar servidor
Write-Host "🔁 Reiniciando servidor Vite + API..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Maximized
