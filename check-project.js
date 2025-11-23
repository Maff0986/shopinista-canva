import fs from "fs";
import path from "path";

const root = process.cwd();

const requiredPublic = [
  "public/index.html",
  "public/manifest.json",
  "public/manifest.webmanifest",
  "public/app.js",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png"
];

const requiredSrc = [
  "src/main.jsx",
  "src/main.tsx",
  "src/app.js",
  "src/App.jsx",
  "src/App.tsx"
];

const requiredConfig = [
  "package.json",
  "vite.config.js"
];

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

async function scanImports(dir) {
  const files = fs.readdirSync(dir);
  let broken = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const r = await scanImports(full);
      broken = broken.concat(r);
    } else if (f.endsWith(".js") || f.endsWith(".jsx") || f.endsWith(".ts") || f.endsWith(".tsx")) {
      const content = fs.readFileSync(full, "utf8");
      const regex = /from ["'](.+?)["']/g;
      let m;
      while ((m = regex.exec(content)) !== null) {
        let imp = m[1];
        if (imp.startsWith(".") && !imp.endsWith(".css")) {
          const resolved = path.resolve(path.dirname(full), imp);
          const existsPath =
            fs.existsSync(resolved) ||
            fs.existsSync(resolved + ".js") ||
            fs.existsSync(resolved + ".jsx") ||
            fs.existsSync(resolved + ".ts") ||
            fs.existsSync(resolved + ".tsx");
          if (!existsPath) broken.push({ file: full, import: imp });
        }
      }
    }
  }
  return broken;
}

async function run() {
  console.log("🔍 Validación completa del proyecto\n");

  console.log("📂 Carpetas principales:");
  ["src", "public", "node_modules"].forEach((f) =>
    console.log(exists(f) ? `✔ ${f}` : `❌ ${f}`)
  );
  console.log("");

  console.log("📄 Archivos obligatorios en /public:");
  requiredPublic.forEach((f) =>
    console.log(exists(f) ? `✔ ${f}` : `❌ ${f}`)
  );
  console.log("");

  console.log("📄 Archivos obligatorios en /src:");
  requiredSrc.forEach((f) =>
    console.log(exists(f) ? `✔ ${f}` : `❌ ${f}`)
  );
  console.log("");

  console.log("⚙ Archivos de configuración:");
  requiredConfig.forEach((f) =>
    console.log(exists(f) ? `✔ ${f}` : `❌ ${f}`)
  );
  console.log("");

  console.log("🔍 Buscando imports rotos...");
  const broken = await scanImports(path.join(root, "src"));
  if (broken.length === 0) {
    console.log("✔ No se encontraron imports rotos\n");
  } else {
    broken.forEach((b) =>
      console.log(`❌ Import roto en ${b.file} ⇒ ${b.import}`)
    );
    console.log("");
  }

  console.log("📦 Validando package.json...");
  try {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    console.log(pkg.dependencies ? "✔ dependencies" : "❌ dependencies");
    console.log(pkg.devDependencies ? "✔ devDependencies" : "❌ devDependencies");
  } catch {
    console.log("❌ Error al leer package.json");
  }
  console.log("");

  console.log("🖼 Verificando icons declarados en manifest...");
  try {
    const mdata = JSON.parse(fs.readFileSync("public/manifest.json", "utf8"));
    if (mdata.icons && Array.isArray(mdata.icons)) {
      for (const icon of mdata.icons) {
        const file = "public/" + icon.src;
        console.log(exists(file) ? `✔ ${file}` : `❌ ${file}`);
      }
    } else {
      console.log("❌ icons no declarados");
    }
  } catch {
    console.log("❌ manifest.json no accesible");
  }

  console.log("\n✔ Revisión completada");
}

run();
