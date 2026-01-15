import puppeteer from "puppeteer";
import { makes } from "../config/makes.js";
import { locations } from "../config/locations.js";
import { scraperConfig } from "../config/scraper.config.js";
import { scrapeVehicles } from "../scraper/vehicleScraper.js";
import { scrapeParts } from "../scraper/partsScraper.js";
import { log } from "../utilities/logger.js";

function normalize(str) {
  return String(str || "").trim().toLowerCase();
}

function makeMatches(makeObj, targetMake) {
  if (!targetMake) return true;
  return normalize(makeObj.name) === normalize(targetMake);
}

// Model filter: full string, first alias, or substring match.
function modelMatches(modelString, targetModel) {
  if (!targetModel) return true;
  const ms = normalize(modelString);
  const tm = normalize(targetModel);

  if (ms === tm) return true;

  const firstAlias = normalize(modelString.split(",")[0] || modelString);
  if (firstAlias === tm) return true;

  return ms.includes(tm) || tm.includes(firstAlias);
}

function locationMatches(location, targetLocation) {
  if (!targetLocation) return true;
  return normalize(location) === normalize(targetLocation);
}

export async function runScraper(options = {}) {
  const {
    make: targetMake,
    model: targetModel,
    location: targetLocation,
    mode = "vehicles"
  } = options;

  const headless = scraperConfig.headless;

  log("Starting scraper with options:", {
    make: targetMake || "ALL",
    model: targetModel || "ALL",
    location: targetLocation || "ALL",
    mode,
    headless,
    maxScrolls: scraperConfig.maxScrolls,
    scrollDelay: scraperConfig.scrollDelay
  });

  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  let jobCount = 0;

  for (const make of makes) {
    if (!makeMatches(make, targetMake)) continue;

    for (const model of make.models) {
      if (!modelMatches(model, targetModel)) continue;

      for (const loc of locations) {
        if (!locationMatches(loc, targetLocation)) continue;

        jobCount++;
        log(`Job #${jobCount}: make=${make.name} model=${model} location=${loc}`);

        if (mode === "vehicles" || mode === "both") {
          await scrapeVehicles({ page, make: make.name, model, location: loc });
        }

        if (mode === "parts" || mode === "both") {
          await scrapeParts({ page, make: make.name, model, location: loc });
        }
      }
    }
  }

  await browser.close();
  log(`Finished. Jobs executed: ${jobCount}`);
}
