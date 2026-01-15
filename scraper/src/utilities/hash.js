
import crypto from "crypto";
export function hashUrl(url) {
  return crypto.createHash("sha256").update(url).digest("hex");
}
