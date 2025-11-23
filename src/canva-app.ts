import { registerApp } from "@canva/app-sdk";

registerApp({
  render: ({ container }) => {
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
        <span>${producto.precio}</span><br/>
        <button style="margin-top: 8px; padding: 6px 12px; background-color: #111; color: white; border: none; border-radius: 4px;" data-src="${producto.imagen}">
          Insertar en diseño
        </button>
      `;
      gallery.appendChild(item);
    }

    container.innerHTML = "";
    container.appendChild(gallery);

    // Activar botones de inserción
    const botones = gallery.querySelectorAll("button[data-src]");
    botones.forEach((btn) => {
      btn.addEventListener("click", () => {
        const src = btn.getAttribute("data-src");
        if (src && window.Canva?.design?.insert) {
          window.Canva.design.insert({
            type: "IMAGE",
            src
          });
        } else {
          alert("Insertar solo funciona dentro de Canva.");
        }
      });
    });

    // También responder al intent (por compatibilidad)
    window.canva.on("edit_design:render", async () => {
      return { ok: true };
    });
  }
});
