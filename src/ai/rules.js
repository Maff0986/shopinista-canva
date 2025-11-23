function formatPrice(p) {
  if (!p) return '';
  const n = Number(String(p).replace(/[^0-9.]/g, ''));
  return isFinite(n)
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
    : p;
}

const headlineTemplates = [
  ({ name, price }) => `Descubre ${name} por solo ${formatPrice(price)}`,
  ({ name }) => `${name}: diseño que eleva tu espacio`,
  ({ name, description }) => `${name} — ${description}`,
  ({ name, price }) => `Oferta: ${name} a ${formatPrice(price)} hoy`,
  ({ name }) => `Convierte tu hogar con ${name}`,
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
  const base = {
    name: name || 'Producto',
    price: price || '',
    description: description || '',
    category: category || ''
  };
  const unique = new Set();
  for (const t of headlineTemplates) unique.add(t(base));
  unique.add(`${base.name} | Envío rápido`);
  unique.add(`${base.name} | Garantía de satisfacción`);
  unique.add(`${base.name} | Stock limitado`);
  const tags = hashtags(base.category).join(' ');
  unique.add(`Compra hoy: ${base.name} ${tags}`);
  return Array.from(unique);
}
