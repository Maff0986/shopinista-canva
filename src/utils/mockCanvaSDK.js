// 🧠 Mock SDK de Canva para entorno local o Vercel
console.log("🧩 Mock Canva SDK cargado (modo local)");

export const mockCanva = {
  intents: {
    edit_design: {
      render(callback) {
        console.log("🧠 Simulando intent edit_design:render...");
        setTimeout(() => {
          const ctx = {
            editor: {
              notify: (msg) => alert(`🪄 Canva Mock: ${msg}`),
              addImage: (url) => console.log("🖼️ Imagen agregada:", url),
              setText: (id, text) => console.log(`📝 Texto cambiado (${id}): ${text}`)
            },
          };
          callback(ctx);
        }, 1500);
      },
    },
  },
};
