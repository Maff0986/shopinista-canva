export async function generateText(prompt: string): Promise<string> {
  // Simulación de respuesta IA sin conexión externa
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`✨ ${prompt} ✨ — Generado por tu asistente local Shopinista AI.`);
    }, 800);
  });
}
