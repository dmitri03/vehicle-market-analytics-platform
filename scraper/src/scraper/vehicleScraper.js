import { autoScroll } from "./pageScroller.js";
import { parseVehicle } from "../parsers/vehicleParser.js";
import { extractSemanticFields } from "../parsers/semanticExtractor.js";
import { writeNDJSON } from "../pipeline/ndjsonWriter.js";
import { Deduplicator } from "../pipeline/deduplicator.js";
import { scraperConfig } from "../config/scraper.config.js";
import { getSearchToken, matchesAnyAlias } from "../utilities/modelAliases.js";

const dedup = new Deduplicator();

export async function scrapeVehicles({ page, make, model, location }) {
  // Use primary alias for the search query.
  const searchModel = getSearchToken(model);
  const url = `https://www.facebook.com/marketplace/${location}/search?query=${encodeURIComponent(make + " " + searchModel)}`;

  await page.goto(url, { waitUntil: "networkidle2" });
  await autoScroll(page, scraperConfig.scrollDelay, scraperConfig.maxScrolls);

  const listings = await page.$$('a[href*="/marketplace/item"]');

  for (const listing of listings) {
    const listingUrl = await page.evaluate(el => el.href, listing);

    const spans = await listing.$$("span");
    const spanTexts = await Promise.all(
      spans.map(s => page.evaluate(e => e.innerText.trim(), s))
    );

    // Validate model match against parsed fields.
    const fields = extractSemanticFields(spanTexts);
    const titleForMatch = fields.model_config || fields.raw_title || "";

    if (!matchesAnyAlias(titleForMatch, model)) continue;

    const vehicle = parseVehicle({ url: listingUrl, make, model, spanTexts });

    if (!dedup.isDuplicate(vehicle.listing_hash)) {
      writeNDJSON("./output/vehicles.ndjson", vehicle);
    }
  }
}
