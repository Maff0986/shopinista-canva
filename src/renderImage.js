function isValidUrl(u) {
  try { new URL(u); return true; } catch { return false; }
}

export async function insertImageFromUrl(payload, imageUrl) {
  if (!isValidUrl(imageUrl)) throw new Error("URL de imagen inválida");
  try {
    const ping = await fetch(imageUrl, { method: "HEAD" });
    if (!ping.ok) throw new Error("HEAD no ok");
  } catch {
    const ping2 = await fetch(imageUrl, { method: "GET" });
    if (!ping2.ok) throw new Error("No se pudo descargar imagen");
  }
  if (payload?.design?.insertImage) {
    await payload.design.insertImage({ src: imageUrl });
  } else {
    console.log("[WEB PREVIEW] Simulación insertImage", imageUrl);
  }
}
