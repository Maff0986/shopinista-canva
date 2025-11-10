import { registerApp } from "@canva/app-sdk";

registerApp({
  render: () => {
    console.log("🛋️ Shopinista Canva App iniciada");

    if (typeof window === "undefined" || !window.canva) {
      console.log("⚠️ SDK de Canva no disponible");
      return;
    }

    window.canva.on("edit_design:render", async (ctx) => {
      console.log("🧠 Actividad edit_design:render activada");
      return { ok: true };
    });

    window.canva.on("app:ready", () => {
      console.log("✅ App lista en Canva");
    });
  }
});
