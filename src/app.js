import { prepareDataConnector } from "@canva/intents/data";
import { makeMockCanva } from "./canva-mock.js";
import { fetchJson } from "./src/utils.js";
import { registerAppInterface } from "@canva/bridge";

prepareDataConnector({
  getDataTable: async (request) => {
    // Implementation for data fetching
  },

  renderSelectionUi: (request) => {
    // Implementation for data selection UI
  },
});

const ROOT_ID = "root";

function renderShell(status = "Local") {
  const root = document.getElementById(ROOT_ID);
  root.innerHTML = `
    <div class="container">
      <div class="header">
        <div>
          <h3 class="h1">Shopinista Canva Integration</h3>
          <div class="small">Modo: <strong>${status}</strong></div>
        </div>
        <div>
          <button id="openPreview" class="button">Abrir Preview (Canva)</button>
        </div>
      </div>

      <hr style="margin:16px 0" />

      <div style="display:grid;gap:12px">
        <input id="feedUrl" class="input" placeholder="URL CSV/JSON feed" />
        <div class="row">
          <input id="imageUrl" class="input" placeholder="URL imagen" />
          <input id="templateId" class="input" placeholder="ID plantilla Canva" />
        </div>
        <div class="row">
          <button id="generateBtn" class="button">Generar y añadir</button>
          <button id="importBtn" class="button" style="background:#111827">Importar imagen</button>
        </div>
        <div id="status" class="small">Estado: idle</div>
        <div id="preview" style="margin-top:12px"></div>
      </div>
    </div>
  `;
}

async function init() {
  renderShell("Iniciando…");

  const isCanva = typeof window.canva !== "undefined";
  const canvaObj = isCanva ? window.canva : makeMockCanva();

  // 👉 Registro del intent edit_design usando el SDK real de Canva
  registerAppInterface({
    edit_design: {
      render: async (ctx) => {
        document.getElementById("status").innerText = "Estado: render activo en Canva";

        try {
          await ctx.design.insertText({
            content: "Producto Shopinista",
            fontSize: 24
          });
        } catch (err) {
          console.warn("Inserción falló:", err);
        }

        return { ok: true };
      }
    }
  });

  renderShell(isCanva ? "Canva" : "Local (mock)");

  const statusEl = document.getElementById("status");
  const previewEl = document.getElementById("preview");

  document.getElementById("openPreview").onclick = () =>
    alert("En Canva usa Preview para activar edit_design.");

  document.getElementById("generateBtn").onclick = async () => {
    const feedUrl = document.getElementById("feedUrl").value.trim();
    statusEl.innerText = "Estado: generando…";
    previewEl.innerHTML = "";

    try {
      let data;
      if (feedUrl.endsWith(".csv")) {
        const res = await fetch(feedUrl);
        const txt = await res.text();
        const lines = txt.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(",");
        const first = lines[1].split(",");
        data = {};
        headers.forEach((h, i) => (data[h.trim()] = first[i]?.trim()));
      } else {
        data = await fetchJson(feedUrl);
        if (Array.isArray(data)) data = data[0];
      }

      previewEl.innerHTML = `
        <div>
          <div><strong>Nombre:</strong> ${data.name || data.title || "—"}</div>
          <div><strong>Precio:</strong> ${data.price || "—"}</div>
          ${
            data.image
              ? `<img class="preview-img" src="${data.image}" />`
              : ""
          }
        </div>
      `;
      statusEl.innerText = "Estado: feed leído";
    } catch (e) {
      statusEl.innerText = `Error: ${e.message}`;
    }
  };

  document.getElementById("importBtn").onclick = async () => {
    if (!isCanva) {
      alert("Sólo funciona desde Canva Preview.");
      return;
    }

    statusEl.innerText = "Estado: listo para importar desde render()";
  };
}

init();
