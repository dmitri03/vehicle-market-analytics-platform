
export function parseYear(text) {
  const match = text.match(/(19|20)\d{2}/);
  return match ? parseInt(match[0]) : null;
}
