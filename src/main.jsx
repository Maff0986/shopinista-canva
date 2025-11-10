import { registerApp } from "@canva/app-sdk";

registerApp({
  render: () => {
    console.log("🛋️ Shopinista Canva App iniciada");

    // Esperar a que el SDK esté disponible
    if (typeof window === "undefined" || !window.canva) {
      console.log("⚠️ SDK de Canva no disponible");
      return;
    }

    // Registrar acción principal
    window.canva.on("edit_design:render", async (ctx) => {
      console.log("🧠 Actividad edit_design:render activada");

      const confirmImport = confirm("¿Deseas importar productos de Tiendanube a tu diseño?");
      if (!confirmImport) return { ok: false };

      const feedURL = "https://shopinistameta.com/feed.json";

      try {
        const res = await fetch(feedURL);
        if (!res.ok) throw new Error("No se pudo obtener el feed");

        const products = await res.json();
        console.log("🪄 Productos cargados:", products.length);

        const content = products.slice(0, 5).map(p => ({
          type: "IMAGE",
          src: p.image || "https://cdn.shopify.com/s/files/1/0883/3135/4415/files/default_product.png",
          alt: p.title,
          url: p.url
        }));

        console.log("📦 Contenido preparado:", content);
        return { ok: true, data: content };
      } catch (err) {
        console.error("❌ Error al importar productos:", err);
        return { ok: false };
      }
    });

    // Acción informativa opcional
    window.canva.on("app:ready", () => {
      console.log("✅ Shopinista Canva App lista para usar");
    });
  }
});
