import { registerApp } from "@canva/app-sdk";

registerApp({
  render: () => {
    window.canva.on("edit_design:render", async (ctx) => {
      console.log("🧠 Actividad edit_design:render activada");
      return { ok: true };
    });
  }
});
