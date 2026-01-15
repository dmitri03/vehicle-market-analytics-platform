
export class Deduplicator {
  constructor() { this.seen = new Set(); }
  isDuplicate(hash) {
    if (this.seen.has(hash)) return true;
    this.seen.add(hash);
    return false;
  }
}
