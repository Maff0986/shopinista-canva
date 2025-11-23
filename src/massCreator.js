import { insertImageFromUrl } from "./renderImage.js";

function pickHeadline(item, tone) {
  const base = item.title || "Producto";
  if (tone === "friendly") return `${base} que te abraza 😊`;
  if (tone === "premium") return `${base}: elegancia atemporal`;
  return `${base} al mejor precio`;
}

export async function massCreate({ payload, items, batchSize, tone, color }) {
  const total = Math.min(items.length, batchSize);
  for (let i = 0; i < total; i++) {
    const item = items[i];
    try {
      await insertImageFromUrl(payload, item.image);
      if (payload?.design?.insertText) {
        await payload.design.insertText({ content: pickHeadline(item, tone), fontSize: 26 });
      } else {
        console.log("[WEB PREVIEW] Texto:", pickHeadline(item, tone));
      }
      await payload?.editor?.notify?.(`Insertado ${i + 1}/${total}: ${item.title}`);
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error("Error procesando item", item.id, err);
    }
  }
}
