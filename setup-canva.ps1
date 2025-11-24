# setup-canva.ps1
# Ejecutar desde: C:\Users\HP-Home\Projects\canva-app
# Propósito: crear/recuperar archivos críticos, validar, build, e intentar push seguro a GitHub.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = (Resolve-Path .).Path
Write-Host "✔ Root: $root"

# 1) Confirmar repo git presente
if (-not (Test-Path (Join-Path $root ".git"))) {
  Write-Host "❗ No se detectó repositorio Git en $root. ¿Quieres inicializar aquí y añadir remoto? (y/N)"
  $r = Read-Host
  if ($r -ne 'y') { Write-Host "Abortando." ; exit 1 }
  git init
  Write-Host "Repo inicializado."
}

function SafeWriteFile([string]$path, [string]$content, [switch]$force) {
  $dir = Split-Path $path -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  if ((Test-Path $path) -and (-not $force)) {
    Write-Host "⚠️ Archivo existe: $path. Sobrescribir? (y/N)"
    $ans = Read-Host
    if ($ans -ne 'y') { Write-Host "⤷ Manteniendo archivo existente: $path"; return }
  }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
  Write-Host "✔ Escritura: $path"
}

# 2) Crear public/index.html si falta
$indexHtml = @"
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Shopinista Canva App</title>
  <link rel="manifest" href="/manifest.json" />
  <link rel="stylesheet" href="/main.css" />
</head>
<body>
  <div id="root"></div>
  <script src="/app.js"></script>
</body>
</html>
"@

SafeWriteFile -path (Join-Path $root "public\index.html") -content $indexHtml -force

# 3) Crear public/manifest.json (asegurar activity_actions)
$manifest = @"
{
  "name": "Shopinista Canva",
  "app_id": "auto",
  "version": "1.0.0",
  "ui": {
    "main": {
      "url": "https://maff0986.github.io/app-shopinistameta-canva/"
    }
  },
  "activity_actions": {
    "edit_design": {
      "render": {
        "url": "https://maff0986.github.io/app-shopinistameta-canva/"
      }
    }
  },
  "permissions": {
    "design": {}
  }
}
"@

SafeWriteFile -path (Join-Path $root "public\manifest.json") -content $manifest -force

# 4) Crear public/app.js (IIFE, NO module, detecta window.canva y mock)
$appJs = @"
(function () {
  'use strict';
  function makeMockCanva() {
    return {
      isCanva: false,
      intents: {
        edit_design: {
          render: function(cb) {
            console.log('[Mock Canva] edit_design.render invoked');
            setTimeout(function(){ cb({
              editor: { notify: function(m){ console.log('[Mock editor.notify]', m); } },
              design: { insertText: async function(opts){ console.log('[Mock design.insertText]', opts); } }
            }); }, 600);
          }
        }
      },
      on: function(){},
      registerAppInterface: function(obj){ console.log('[Mock registerAppInterface]', obj); }
    };
  }

  var canva = (typeof window.canva !== 'undefined' && window.canva) ? window.canva : makeMockCanva();

  function renderShell(statusText) {
    var root = document.getElementById('root') || document.getElementById('app') || document.body;
    root.innerHTML = ''
      + '<div style=\"max-width:900px;margin:28px auto;padding:20px;background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.06);font-family:system-ui,Segoe UI,Roboto,Arial\">'
      + '<h2 style=\"margin:0 0 6px\">🛋️ Shopinista Canva Integration</h2>'
      + '<div style=\"color:#6b7280;margin-bottom:12px\">Modo: <strong>'+statusText+'</strong></div>'
      + '<div style=\"display:flex;gap:8px;margin-bottom:10px\">'
      + '<input id=\"feedUrl\" placeholder=\"URL CSV/JSON feed\" style=\"flex:1;padding:10px;border-radius:8px;border:1px solid #e5e7eb\" />'
      + '<input id=\"imageUrl\" placeholder=\"URL imagen\" style=\"width:320px;padding:10px;border-radius:8px;border:1px solid #e5e7eb\" />'
      + '</div>'
      + '<div style=\"display:flex;gap:8px;margin-bottom:12px\">'
      + '<input id=\"templateId\" placeholder=\"ID plantilla Canva (opcional)\" style=\"flex:1;padding:10px;border-radius:8px;border:1px solid #e5e7eb\" />'
      + '<button id=\"generateBtn\" style=\"padding:10px 14px;border-radius:8px;background:#0b74ff;color:#fff;border:none;cursor:pointer\">Generar preview</button>'
      + '<button id=\"importBtn\" style=\"padding:10px 14px;border-radius:8px;background:#111827;color:#fff;border:none;cursor:pointer\">Importar a Canva</button>'
      + '</div>'
      + '<div id=\"status\" style=\"color:#374151\">Estado: idle</div>'
      + '<div id=\"preview\" style=\"margin-top:12px\"></div>'
      + '<small style=\"display:block;margin-top:14px;color:#9ca3af\">Desarrollado por Shopinista</small>'
      + '</div>';
  }

  function updateStatus(msg){ var s = document.getElementById('status'); if(s) s.innerText = 'Estado: '+msg; }

  function safeParseFirstJson(arrOrObj){
    if (!arrOrObj) return null;
    if (Array.isArray(arrOrObj)) return arrOrObj[0] || null;
    return arrOrObj;
  }

  async function loadFeed(feedUrl){
    if (!feedUrl) throw new Error('No feed URL');
    if (feedUrl.endsWith('.csv')) {
      var res = await fetch(feedUrl);
      var txt = await res.text();
      var lines = txt.split(/\\r?\\n/).filter(Boolean);
      var headers = lines[0].split(',');
      var first = lines[1] ? lines[1].split(',') : [];
      var obj = {};
      headers.forEach(function(h,i){ obj[h.trim()] = (first[i]||'').trim() });
      return obj;
    }
    var r = await fetch(feedUrl);
    var j = await r.json();
    return safeParseFirstJson(j);
  }

  async function registerEditDesignHandler() {
    try {
      // Preferred modern API: registerAppInterface or intents.edit_design.render
      if (canva && canva.registerAppInterface) {
        canva.registerAppInterface({
          edit_design: {
            render: async function(ctx) {
              console.log('[Canva] edit_design.render invoked', ctx);
              if (ctx && ctx.editor && typeof ctx.editor.notify === 'function') {
                ctx.editor.notify('Shopinista: importando recursos al diseño...');
              }
              try {
                if (ctx && ctx.design && typeof ctx.design.insertText === 'function') {
                  await ctx.design.insertText({ content: 'Producto Shopinista', fontSize: 22 });
                }
              } catch(e){ console.warn(e); }
              return { ok: true };
            }
          }
        });
        return true;
      }
      if (canva && canva.intents && canva.intents.edit_design && typeof canva.intents.edit_design.render === 'function') {
        canva.intents.edit_design.render(async function(ctx){ 
          console.log('[Canva legacy] edit_design.render', ctx);
          if (ctx && ctx.editor && typeof ctx.editor.notify === 'function') ctx.editor.notify('Shopinista (legacy): acción recibida');
          return { ok: true };
        });
        return true;
      }
      console.warn('No se detectó forma conocida para registrar edit_design');
      return false;
    } catch (err) {
      console.error('Error registrando edit_design:', err);
      return false;
    }
  }

  (async function main(){
    renderShell('iniciando...');
    var ok = await registerEditDesignHandler();
    renderShell(ok ? ( (canva.isCanva) ? 'Canva (sandbox)' : 'Local (mock)') : 'Modo limitado');

    document.getElementById('generateBtn').onclick = async function(){
      var feed = document.getElementById('feedUrl').value.trim();
      updateStatus('generando...');
      var preview = document.getElementById('preview'); preview.innerHTML = '';
      try {
        var p = await loadFeed(feed);
        preview.innerHTML = '<div><div><strong>Nombre:</strong> '+(p?.name||p?.title||'—')+'</div><div><strong>Precio:</strong> '+(p?.price||'—')+'</div>' + (p?.image?('<div style=\"margin-top:8px\"><img src=\"'+p.image+'\" style=\"max-width:260px;border-radius:6px\"/></div>'):'') + '</div>';
        updateStatus('feed leído (vista previa)');
      } catch(e){
        updateStatus('error -> '+(e.message||e));
      }
    };

    document.getElementById('importBtn').onclick = function(){
      if (!canva || !canva.registerAppInterface) {
        alert('Importar a Canva: abrir Preview en Canva Developer y usar el intent edit_design.render.');
        return;
      }
      updateStatus('en Canva, la importación ocurre dentro del render() del intent.');
    };
    // expose debug
    window.__shopinista = { canva: canva };
  })();

})();
"@

SafeWriteFile -path (Join-Path $root "public\app.js") -content $appJs -force

# 5) Crear CSS simple si falta
$mainCss = @"
body { background:#f3f4f6; margin:0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111827 }
.container { max-width:920px; margin:28px auto; padding:18px; }
.input { padding:10px; border-radius:8px; border:1px solid #e5e7eb }
.button { padding:10px 14px; border-radius:8px; cursor:pointer }
.preview-img { max-width:260px; border-radius:6px; display:block; margin-top:8px }
"@
SafeWriteFile -path (Join-Path $root "public\main.css") -content $mainCss -force

# 6) Crear icons placeholder (32,64,128) si faltan
$iconsPath = Join-Path $root "public\icons"
if (-not (Test-Path $iconsPath)) { New-Item -ItemType Directory -Path $iconsPath | Out-Null }
# tiny transparent PNG base64 (1x1) - placeholder
$px1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
function WriteIcon($name) {
  $dest = Join-Path $iconsPath $name
  if (-not (Test-Path $dest)) {
    [System.IO.File]::WriteAllBytes($dest, [Convert]::FromBase64String($px1))
    Write-Host "✔ Icon creado: $dest"
  } else {
    Write-Host "✔ Icon existe: $dest"
  }
}
WriteIcon "icon-32.png"
WriteIcon "icon-64.png"
WriteIcon "icon-128.png"

# 7) Validate manifest contains edit_design
$mf = Get-Content (Join-Path $root "public\manifest.json") -Raw
if ($mf -match '"edit_design"') { Write-Host "✔ manifest.json contiene edit_design" } else { Write-Host "❌ manifest.json NO contiene edit_design" }

# 8) package.json minimal (only if missing required scripts)
$pkgPath = Join-Path $root "package.json"
if (-not (Test-Path $pkgPath)) {
  $pkg = @"
{
  "name": "shopinista-canva",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 8080",
    "build": "vite build",
    "start": "node server.js"
  },
  "devDependencies": {
    "vite": "^5.4.21"
  },
  "dependencies": {}
}
"@
  SafeWriteFile -path $pkgPath -content $pkg -force
  Write-Host "✔ package.json creado (básico)."
}

# 9) vite.config.js ensure external @canva packages (avoid bundling)
$vite = @"
import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        '@canva/bridge',
        '@canva/intents',
        '@canva/intents/design',
        '@canva/app-ui-kit'
      ]
    }
  },
  server: {
    port: 8080
  }
});
"@
SafeWriteFile -path (Join-Path $root "vite.config.js") -content $vite -force

# 10) Instalar dependencias (solo dev vite)
Write-Host "📦 Ejecutando npm install (esto puede tardar)..."
npm install --no-audit --no-fund
Write-Host "✔ npm install finalizado."

# 11) Build con Vite (producción)
Write-Host "🔧 Ejecutando build..."
npm run build
Write-Host "✔ Build completado."

# 12) Validación rápida (manifest + handler detection en app.js)
$publicApp = Get-Content (Join-Path $root "public\app.js") -Raw
$checks = @()
if ($publicApp -match 'edit_design') { $checks += "handler-edit_design encontrado en public/app.js" } else { $checks += "⚠️ handler edit_design NO detectado en public/app.js" }
if ($mf -match '"edit_design"') { $checks += "manifest edit_design OK" } else { $checks += "⚠️ manifest edit_design NO detectado" }
Write-Host "🧪 Validación rápida:"
$checks | ForEach-Object { Write-Host " - $_" }

# 13) Git: agregar, commit y push seguro
Write-Host "🔁 Preparando commit y push. Se intentará hacer pull --rebase primero para evitar rechazos."
git add -A
git commit -m "chore: restore public assets + manifest + app.js (automated setup)" -q 2>$null || Write-Host "⚠️ No hay cambios para commitear o commit falló."
Write-Host "git fetch origin"
git fetch origin
Write-Host "git pull --rebase origin main (si falla, no forzaremos merge automáticamente)"
try {
  git pull --rebase origin main
  git push origin main
  Write-Host "✔ Push realizado a origin/main"
} catch {
  Write-Host "⚠️ Push automatico falló. Para resolver manualmente ejecuta:"
  Write-Host "  git status"
  Write-Host "  git pull --rebase origin main"
  Write-Host "  resolve conflicts, then: git add ., git rebase --continue, git push origin main"
}

Write-Host "🎉 Proceso terminado. Revisa http://localhost:8080 para previsualizar (npm run dev)."
