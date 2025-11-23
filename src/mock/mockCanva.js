export default {
  designId: "web-preview",
  design: {
    insertText: async (p) => console.log("[WEB] insertText", p),
    insertImage: async (p) => console.log("[WEB] insertImage", p),
  },
  editor: { notify: async (m) => console.log("[WEB] notify", m) },
};
