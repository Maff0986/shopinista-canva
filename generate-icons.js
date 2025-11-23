// generate-icons.js
import sharp from "sharp";

const sizes = [192, 512];
const input = "public/icons/icon-128.png";

for (const size of sizes) {
  const output = `public/icons/icon-${size}.png`;
  sharp(input)
    .resize(size, size)
    .toFile(output)
    .then(() => console.log(`✔️ Icono ${size} generado en ${output}`))
    .catch(err => console.error(`❌ Error generando ${size}:`, err));
}
