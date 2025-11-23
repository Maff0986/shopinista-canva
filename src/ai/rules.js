function formatPrice(p) {
  if (!p) return '';
  const n = Number(String(p).replace(/[^0-9.]/g, ''));
  return isFinite(n) ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) : p;
}

const headlineTemplates = [
  ({ name, price }) => \Descubre \ por solo \\,
  ({ name }) => \\: diseño que eleva tu espacio\,
  ({ name, description }) => \\ — \\,
  ({ name, price }) => \Oferta: \ a \ hoy\,
  ({ name }) => \Convierte tu hogar con \\,
];

const hashtags = (category) => {
  const base = ['#Shopinista', '#Hogar', '#Diseño', '#Oferta'];
  const map = {
    sala: ['#Sala', '#Confort'],
    comedor: ['#Comedor', '#Madera'],
    iluminacion: ['#Iluminación', '#LED'],
  };
  return Array.from(new Set([...(map[category] || []), ...base]));
};

export function generateCopyVariants({ name, price, description, category }) {
  const base = { name: name || 'Producto', price: price || '', description: description || '', category: category || '' };
  const unique = new Set();
  for (const t of headlineTemplates) unique.add(t(base));
  unique.add(\\ | Envío rápido\);
  unique.add(\\ | Garantía de satisfacción\);
  unique.add(\\ | Stock limitado\);
  const tags = hashtags(base.category).join(' ');
  unique.add(\Compra hoy: \ \\);
  return Array.from(unique);
}
