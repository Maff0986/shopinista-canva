import { register } from "@canva/app-ui-kit";
import { prepareEditDesignAppIntent } from "@canva/intents";
import { mockCanva } from "../src/utils/mockCanvaSDK.js";

prepareEditDesignAppIntent({
  render: (root) => {
    root.innerHTML = `
      <div style="font-family: Arial, text-align: center; padding: 40px;">
        <h1 style="font-size: 1.8rem;">🛋️ Shopinista Canva Integration</h1>
        <p style="font-size: 1.1rem;">Tu app está conectada correctamente al entorno de Canva.</p>
        <p style="margin-top: 10px;">Puedes generar y sincronizar recursos desde CSV, URLs o tus feeds.</p>
      </div>
    `;
  }
});

register();
(async () => {
  console.log("🚀 Iniciando Shopinista Canva App...");

  // Detecta si está en Canva Sandbox o en modo local
  const isCanva = typeof globalThis.canva !== "undefined";
  const canva = isCanva ? globalThis.canva : mockCanva;

  try {
    // Registrar intent edit_design:render
    console.log("🧠 Registrando intent edit_design:render...");
    canva.intents.edit_design.render(async (ctx) => {
      console.log("✅ Handler ejecutado correctamente");
      await ctx.editor.notify("Shopinista Canva conectado 🧩");

      // Aquí puedes simular interacción real con tu UI
      const appDiv = document.getElementById("app");
      if (appDiv) {
        appDiv.innerHTML = `
          <div style="padding: 24px; font-family: sans-serif;">
            <h2>🪄 Shopinista Canva Mock Activo</h2>
            <p>Simulando integración <b>edit_design:render</b> correctamente.</p>
            <button id="simulate" style="margin-top: 16px; padding: 8px 12px; background: #111; color: #fff; border: none; border-radius: 6px;">
              Simular acción Canva
            </button>
          </div>
        `;
        document.getElementById("simulate").onclick = () => {
          ctx.editor.notify("✅ Acción simulada correctamente.");
        };
      }
    });
  } catch (e) {
    console.error("❌ Error al registrar handler Canva:", e);
  }
})();
