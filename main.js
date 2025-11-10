(() => {
  // Esperar a que Canva SDK esté disponible
  const initializeCanvaApp = async () => {
    if (typeof window === "undefined") {
      console.log("Shopinista: entorno no navegador, ignorando.");
      return;
    }

    // Esperar a que el SDK de Canva se cargue
    if (!window.canva) {
      console.log("Shopinista: SDK de Canva no detectado aún, reintentando...");
      setTimeout(initializeCanvaApp, 1000);
      return;
    }

    try {
      console.log("🛋️ Shopinista Canva SDK detectado. Registrando acciones...");

      // Registrar acción de edición de diseño
      await window.canva.on("edit_design:render", async (event) => {
        console.log("🧠 edit_design:render activado", event);

        // Aquí puedes importar productos, imágenes o plantillas desde Tiendanube
        const accepted = confirm("Shopinista: ¿Desea importar recursos al diseño?");
        if (accepted) {
          console.log("🪄 Importando activos desde Tiendanube...");
          // Ejemplo de retorno correcto para Canva
          return { ok: true, accepted: true, data: { imported: true } };
        } else {
          return { ok: true, accepted: false };
        }
      });

      // Acción opcional de carga inicial (solo informativa)
      await window.canva.on("app:ready", () => {
        console.log("✅ Shopinista Canva App lista para usar dentro del editor.");
      });

      console.log("✅ Todas las acciones de Canva fueron registradas correctamente.");

    } catch (err) {
      console.error("❌ Error al registrar acciones de Canva:", err);
    }
  };

  // Iniciar
  initializeCanvaApp();
})();
