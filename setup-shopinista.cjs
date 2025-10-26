// setup-shopinista.cjs
// Ejecutar: node setup-shopinista.cjs

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const logPath = path.join(root, "setup-log.txt");
fs.writeFileSync(logPath, "=== Setup log - " + new Date().toISOString() + " ===\n");

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logPath, msg + "\n");
}

try {
  log("1) Creando estructura de carpetas...");
  const dirs = [
    "src",
    "src/components",
    "src/hooks",
    "src/services",
    "src/styles",
    "src/utils",
    "public",
    "public/icons",
  ];
  dirs.forEach((d) => {
    const p = path.join(root, d);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
      log("  ✔ Creada: " + d);
    } else {
      log("  ◼ Ya existe: " + d);
    }
  });

  log("\n2) Instalando dependencias (puede tardar varios minutos)...");
  // Dependencias runtime y dev esenciales
  const deps = [
    "react",
    "react-dom",
    "clsx",
    "lucide-react",
    "papaparse",
    "axios"
  ];
  const devDeps = [
    "typescript",
    "@types/react",
    "@types/react-dom",
    "vite",
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "eslint",
    "prettier"
  ];

  log("  -> npm install " + deps.join(" "));
  execSync("npm install " + deps.join(" "), { stdio: "inherit" });

  log("  -> npm install -D " + devDeps.join(" "));
  execSync("npm install -D " + devDeps.join(" "), { stdio: "inherit" });

  log("\n3) Inicializando Tailwind (si no existe tailwind.config.js) ...");
  if (!fs.existsSync(path.join(root, "tailwind.config.js"))) {
    try {
      execSync("npx tailwindcss init -p", { stdio: "inherit" });
      log("  ✔ Tailwind inicializado.");
    } catch (e) {
      log("  ⚠ Error inicializando Tailwind: " + e.message);
    }
  } else {
    log("  ◼ tailwind.config.js ya existe.");
  }

  log("\n4) Instalar shadcn CLI (opcional) y añadir componentes básicos");
  try {
    execSync("npx shadcn@latest init -y", { stdio: "inherit" });
    execSync("npx shadcn@latest add card button input textarea dialog", { stdio: "inherit" });
    log("  ✔ shadcn init y componentes añadidos (si la CLI estaba disponible).");
  } catch (e) {
    log("  ⚠ shadcn no se pudo inicializar automáticamente. Ejecuta manualmente:\n     npx shadcn@latest init\n     npx shadcn@latest add card button input textarea dialog");
  }

  log("\n5) Creando archivos base si faltan...");
  const files = {
    "src/styles/globals.css": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
    "public/index.html":
      "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>ShopinistaMeta Canva App</title></head><body><div id='root'></div></body></html>\n",
    "README.md": "# ShopinistaMeta Canva App\n\nProyecto inicial.\n",
  };

  Object.entries(files).forEach(([fp, content]) => {
    const p = path.join(root, fp);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, content, { encoding: "utf8" });
      log("  ✔ Archivo creado: " + fp);
    } else {
      log("  ◼ Ya existe: " + fp);
    }
  });

  log("\n6) Verificando git: crear commit inicial si no existe...");
  try {
    const hasGit = fs.existsSync(path.join(root, ".git"));
    if (!hasGit) {
      execSync("git init -b main", { stdio: "inherit" });
      log("  ✔ git init -b main");
    } else {
      log("  ◼ repo git ya inicializado.");
    }
    // check if there are commits
    let commits = 0;
    try {
      commits = parseInt(execSync("git rev-list --count HEAD").toString().trim(), 10) || 0;
    } catch (e) {
      commits = 0;
    }
    if (commits === 0) {
      execSync("git add .", { stdio: "inherit" });
      execSync("git commit -m \"chore: initial project setup by setup-shopinista\"", { stdio: "inherit" });
      log("  ✔ Commit inicial creado.");
    } else {
      log("  ◼ Ya existen commits (" + commits + ").");
    }
  } catch (e) {
    log("  ⚠ Error git: " + e.message);
  }

  log("\n7) Instalación final completada — revisa setup-log.txt para detalles.");
} catch (err) {
  log("\nERROR CRÍTICO: " + err.message);
  console.error(err);
  process.exit(1);
}
