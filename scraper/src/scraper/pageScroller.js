
export async function autoScroll(page, delay, maxScrolls) {
  for (let i=0; i<maxScrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight*2));
    await page.waitForTimeout(delay);
  }
}
