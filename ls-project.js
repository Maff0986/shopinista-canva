import fs from "fs";
import path from "path";

function listFiles(dir, prefix = "") {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      console.log(prefix + "📁 " + file + "/");
      listFiles(fullPath, prefix + "   ");
    } else {
      console.log(prefix + "📄 " + file);
    }
  }
}

console.log("====== EXPLORANDO PROYECTO ======\n");

["public", "src", "dist"].forEach((folder) => {
  if (fs.existsSync(folder)) {
    console.log("\n--------------------------------");
    console.log("Contenido de /" + folder);
    console.log("--------------------------------");
    listFiles(folder);
  } else {
    console.log("\n(No existe carpeta " + folder + ")");
  }
});
