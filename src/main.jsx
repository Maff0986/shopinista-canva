// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Attempt to import Canva intents only when available
let prepareEditDesign = null;
try {
  // In production inside Canva, @canva/intents will be available
  // In plain web preview, this import may fail; we fall back gracefully
  ({ prepareEditDesign } = await import("@canva/intents"));
} catch {
  // No-op: running in web preview
}

// Helper: mount React with normalized props
function mount({ payload, env }) {
  const rootEl = document.getElementById("root");
  const root = createRoot(rootEl);
  root.render(<App payload={payload} env={env} />);
}

// Canva runtime: register edit_design intent with render
if (prepareEditDesign) {
  prepareEditDesign({
    // Render is mandatory; Canva checks this lifecycle action
    render: (context) => {
      // context includes design operations (insertText, insertImage, etc.)
      // Pass the full context as payload for App to call context.design.*
      mount({ payload: context, env: "canva" });
    },
  });
} else {
  // Web preview runtime: simulate minimal payload and design API
  const mockPayload = {
    designId: "web-preview",
    design: {
      insertText: async ({ content, fontSize }) => {
        console.log("[WEB PREVIEW] insertText", { content, fontSize });
      },
      insertImage: async ({ src }) => {
        console.log("[WEB PREVIEW] insertImage", { src });
      },
    },
  };
  mount({ payload: mockPayload, env: "web" });
}
