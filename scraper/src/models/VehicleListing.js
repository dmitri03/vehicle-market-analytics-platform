import { hashUrl } from "../utilities/hash.js";

export class VehicleListing {
  constructor(raw) {
    this.listing_hash = hashUrl(raw.url);

    this.url = raw.url;
    this.make = raw.make || null;
    this.model = raw.model || null;
    this.model_config = raw.model_config || null;
    this.year = raw.year || null;

    this.price = raw.price || null;
    this.mileage = raw.mileage || null;

    this.city = raw.city || null;
    this.state = raw.state || null;
    this.latitude = raw.latitude || null;
    this.longitude = raw.longitude || null;

    this.is_dealership = raw.is_dealership || false;

    this.scraped_at = new Date().toISOString();
  }
}
