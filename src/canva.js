import { registerAppInterface } from "@canva/bridge";
import { createDesignInteraction } from "@canva/design";
import { saveAsset } from "@canva/asset";

registerAppInterface({
  appInit() {
    console.log("Canva App inicializada correctamente");
  },

  // Intent obligatorio "edit_design"
  edit_design: {
    async render() {
      console.log("Intent edit_design ejecutado");
      return {
        type: "success",
      };
    },
  },
});
