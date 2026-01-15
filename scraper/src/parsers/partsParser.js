
import { extractSemanticFields } from "./semanticExtractor.js";
import { parsePrice } from "../utilities/priceParser.js";
import { hashUrl } from "../utilities/hash.js";
import { PartListing } from "../models/PartListing.js";

export function parsePart({ url, make, model, spanTexts }) {
  const fields = extractSemanticFields(spanTexts);
  return new PartListing({
    listing_hash: hashUrl(url),
    url,
    make,
    model,
    title: fields.model_config,
    price: parsePrice(fields.price),
    city: fields.city,
    state: fields.state,
    scraped_at: new Date().toISOString()
  });
}
