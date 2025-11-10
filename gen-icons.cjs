// gen-icons.cjs
const sharp = require('sharp');
const fetch = require('node-fetch');
const fs = require('fs').promises;

(async () => {
  const url = process.argv[2];
  if (!url) { console.error('Usage: node gen-icons.cjs "<IMAGE_URL>"'); process.exit(1); }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir('public/icons', { recursive: true });
  const sizes = [32,64,128];
  for (const s of sizes) {
    const out = `public/icons/icon-${s}.png`;
    await sharp(buf).resize(s,s).png().toFile(out);
    console.log('wrote', out);
  }
})();
