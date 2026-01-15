
export function parsePrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned) : null;
}
