import {
  prepareEditDesignIntent,
  registerEditDesignRender,
} from "@canva/edit_design";
import {
  registerCreateDesignButton,
  ui,
} from "@canva/app-ui";

// --------------------------------------------------------
// 1. PREPARAR INTENTS EN LOAD
// --------------------------------------------------------
prepareEditDesignIntent();

// --------------------------------------------------------
// 2. REGISTRAR ACCIÓN "render" DEL INTENTO
// --------------------------------------------------------
registerEditDesignRender(async () => {
  // Aquí generas tu recurso, imagen, plantilla, etc.
  const generatedAsset = await ui.createImage({
    width: 1080,
    height: 1080,
    content: "<svg>...</svg>",
  });

  return {
    type: "SUCCESS",
    assets: [generatedAsset],
  };
});

// --------------------------------------------------------
// 3. REGISTRAR UI PRINCIPAL (Panel o Modal)
// --------------------------------------------------------
registerCreateDesignButton(async () => {
  ui.openPanel({
    template: "editor",
    data: { message: "Configuración Canva lista" },
  });
});
