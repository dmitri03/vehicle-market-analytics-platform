
import { extractSemanticFields } from "./semanticExtractor.js";
import { parsePrice } from "../utilities/priceParser.js";
import { hashUrl } from "../utilities/hash.js";
import { VehicleListing } from "../models/VehicleListing.js";

export function parseVehicle({ url, make, model, spanTexts }) {
  const fields = extractSemanticFields(spanTexts);
  return new VehicleListing({
    listing_hash: hashUrl(url),
    url,
    make,
    model,
    year: fields.year,
    model_config: fields.model_config,
    price: parsePrice(fields.price),
    mileage: fields.mileage,
    city: fields.city,
    state: fields.state,
    scraped_at: new Date().toISOString()
  });
}
