export const mockCanva = {
  bridge: {
    register: () => console.log("Mock Canva Bridge registered"),
  },
  design: {
    getDesign: async () => ({
      id: "mock-design",
      title: "Mock Design",
    }),
  },
  asset: {
    upload: async () => ({
      id: "mock-upload",
      url: "https://example.com/mock.png",
    }),
  },
};
