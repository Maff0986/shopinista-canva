Write-Host "Instalando dependencias y configurando proyecto..." -ForegroundColor Cyan
npm install
npm install -D @tailwindcss/postcss tailwindcss postcss autoprefixer
# Inicializar tailwind (no sobrescribe si ya tienes config)
npx tailwindcss init -p
Write-Host "Configuración completada. Ejecuta: npm run dev" -ForegroundColor Green
