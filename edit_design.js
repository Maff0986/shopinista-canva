console.log("🧠 Registrando intent edit_design...");

// Canva Sandbox inyecta globalThis.canva
if (globalThis.canva && globalThis.canva.intents) {
  globalThis.canva.intents.edit_design.render(async (ctx) => {
    console.log("✅ edit_design:render activado", ctx);
    await ctx.editor.notify("Shopinista Canva listo para renderizar 🎨");
  });
} else {
  console.error("❌ Canva SDK no disponible. Ejecuta dentro del Sandbox.");
}
