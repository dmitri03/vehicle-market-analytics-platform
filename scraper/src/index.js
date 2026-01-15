import dotenv from "dotenv";
dotenv.config();

import { parseArgs } from "./utilities/cliArgs.js";
import { applyConfigOverrides } from "./config/scraper.config.js";
import { runScraper } from "./pipeline/ingestionController.js";

const args = parseArgs();

applyConfigOverrides({
  headless: typeof args.headless === "boolean" ? args.headless : undefined,
  maxScrolls: typeof args.maxScrolls === "number" ? args.maxScrolls : undefined,
  scrollDelay: typeof args.scrollDelay === "number" ? args.scrollDelay : undefined
});

runScraper({
  make: args.make,
  model: args.model,
  location: args.location,
  mode: args.mode || "vehicles"
}).catch(err => {
  console.error("Scraper failed:", err);
  process.exitCode = 1;
});
