// Alias helpers for comma-separated model strings.
// Search uses the first alias; matching uses all aliases.

export function getAliases(modelString) {
  if (!modelString) return [];
  return modelString
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

export function getSearchToken(modelString) {
  const aliases = getAliases(modelString);
  return aliases.length ? aliases[0] : modelString;
}

export function matchesAnyAlias(text, modelString) {
  if (!text) return false;
  const hay = String(text).toLowerCase();
  const aliases = getAliases(modelString).map(a => a.toLowerCase());

  // Basic substring match.
  if (aliases.some(a => hay.includes(a))) return true;

  // Treat single-digit aliases as prefix matches for tokens.
  for (const a of aliases) {
    if (/^\d$/.test(a)) {
      const tokens = hay.split(/\s+/).filter(Boolean);
      if (tokens.some(t => t.startsWith(a))) return true;
    }
  }

  return false;
}
