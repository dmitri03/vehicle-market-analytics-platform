
import fs from "fs";
export function writeNDJSON(path, obj) {
  fs.appendFileSync(path, JSON.stringify(obj) + "\n");
}
