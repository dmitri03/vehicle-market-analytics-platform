import fs from "fs";
import readline from "readline";

// Yield non-empty NDJSON lines; JSON validation happens in MySQL.
export async function* readNdjsonLines(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    yield trimmed;
  }
}
