import { registerApp } from "@canva/app-sdk";

registerApp({
  render: () => {
    window.canva.on("edit_design:render", async () => {
      const gallery = document.createElement("div");
      gallery.style.padding = "24px";
      gallery.style.fontFamily = "sans-serif";
      gallery.innerHTML = `<h2 style="font-size: 20px; margin-bottom: 12px;">🛍️ Productos Shopinista</h2>`;

      const productos = [
        {
          nombre: "Bolso de cuero",
          imagen: "https://shopinista.com/images/bolso.jpg",
          precio: "$799"
        },
        {
          nombre: "Tenis blancos",
          imagen: "https://shopinista.com/images/tenis.jpg",
          precio: "$1,299"
        },
        {
          nombre: "Lentes de sol",
          imagen: "https://shopinista.com/images/lentes.jpg",
          precio: "$499"
        }
      ];

      for (const producto of productos) {
        const item = document.createElement("div");
        item.style.marginBottom = "16px";
        item.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; border-radius: 8px; margin-bottom: 8px;" />
          <strong>${producto.nombre}</strong><br/>
          <span>${producto.precio}</span>
        `;
        gallery.appendChild(item);
      }

      document.body.innerHTML = "";
      document.body.appendChild(gallery);

      return { ok: true };
    });
  }
});
