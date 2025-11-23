import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

let prepareEditDesign;
try {
  ({ prepareEditDesign } = await import("@canva/intents"));
} catch {
  // No estamos en Canva, seguimos en web preview
}

function mount({ payload, env }) {
  const el = document.getElementById("root");
  const root = createRoot(el);
  root.render(<App payload={payload} env={env} />);
}

if (prepareEditDesign) {
  // ✅ Entorno Canva
  prepareEditDesign({
    render: async (context) => {
      console.info("edit_design:render activado", context);
      mount({ payload: context, env: "canva" });
    },
  });
} else {
  // ✅ Entorno web preview
  const mock = await import("./mock/mockCanva.js");
  mount({ payload: mock.default, env: "web" });
}
