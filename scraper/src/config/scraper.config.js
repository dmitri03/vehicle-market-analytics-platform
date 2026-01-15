export const scraperConfig = {
  scrollDelay: 2000,
  maxScrolls: 8,
  headless: true
};

export function applyConfigOverrides(overrides = {}) {
  if (typeof overrides.scrollDelay === "number") scraperConfig.scrollDelay = overrides.scrollDelay;
  if (typeof overrides.maxScrolls === "number") scraperConfig.maxScrolls = overrides.maxScrolls;
  if (typeof overrides.headless === "boolean") scraperConfig.headless = overrides.headless;
  return scraperConfig;
}
