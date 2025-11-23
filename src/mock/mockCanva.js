export function prepareDesignEditor(impl) {
  prepareDesignEditor._impl = impl;
  prepareDesignEditor._triggerLocalRender = async (rootElement, payload) => {
    const mockPayload = {
      ...payload,
      design: {
        insertText: async ({ content }) => console.log('[MOCK] insertText:', content),
        insertImage: async ({ src }) => console.log('[MOCK] insertImage:', src)
      }
    };
    await impl.render(rootElement, mockPayload);
  };
}
