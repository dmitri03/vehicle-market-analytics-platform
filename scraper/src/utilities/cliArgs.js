// Supported args: --make, --model, --location, --mode, --headless, --maxScrolls, --scrollDelay.

export function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const eq = raw.indexOf("=");
    if (eq === -1) {
      out[raw.slice(2)] = true;
      continue;
    }
    const key = raw.slice(2, eq).trim();
    let value = raw.slice(eq + 1).trim();

    // Trim optional quotes.
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Coerce booleans/ints.
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^-?\d+$/.test(value)) value = parseInt(value, 10);

    out[key] = value;
  }
  return out;
}
