/**
 * Memory Hierarchy
 * generic-agent-design Memory Hierarchy - Store + Recall + Promote + Stats
 */

export type Tier = 'long' | 'short' | 'working';

export interface MemoryItem {
  key: string;
  value: unknown;
  tier: Tier;
  importance: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: Tier[];
}

export interface MHStats {
  long: number;
  short: number;
  working: number;
  total: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgImportance: number;
  promotions: number;
  demotions: number;
}

export class MemoryHierarchy {
  private memories: Map<string, MemoryItem> = new Map();
  private promotions = 0;
  private demotions = 0;

  store(tier: Tier, key: string, value: unknown, importance: number = 1): boolean {
    const existing = this.memories.get(key);
    if (existing) {
      const oldTier = existing.tier;
      existing.tier = tier;
      existing.value = value;
      existing.importance = importance;
      existing.history.push(tier);
      existing.updated = Date.now();
      this.updatePromotionCount(oldTier, tier);
      return true;
    }
    this.memories.set(key, {
      key,
      value,
      tier,
      importance,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [tier],
    });
    return true;
  }

  recall(key: string): MemoryItem | null {
    const m = this.memories.get(key);
    if (!m) return null;
    if (!m.active) return null;
    m.hits++;
    m.updated = Date.now();
    return m;
  }

  promote(key: string, toTier: Tier): boolean {
    const m = this.memories.get(key);
    if (!m) return false;
    const oldTier = m.tier;
    if (oldTier === toTier) return false;
    m.tier = toTier;
    m.history.push(toTier);
    m.updated = Date.now();
    this.updatePromotionCount(oldTier, toTier);
    return true;
  }

  private updatePromotionCount(from: Tier, to: Tier): void {
    const order: Record<Tier, number> = { working: 0, short: 1, long: 2 };
    if (order[to] > order[from]) this.promotions++;
    else if (order[to] < order[from]) this.demotions++;
  }

  getStats(): MHStats {
    const all = Array.from(this.memories.values());
    return {
      long: all.filter(m => m.tier === 'long').length,
      short: all.filter(m => m.tier === 'short').length,
      working: all.filter(m => m.tier === 'working').length,
      total: all.length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      avgImportance: all.length > 0 ? Math.round((all.reduce((s, m) => s + m.importance, 0) / all.length) * 100) / 100 : 0,
      promotions: this.promotions,
      demotions: this.demotions,
    };
  }

  getItem(key: string): MemoryItem | undefined {
    return this.memories.get(key);
  }

  getAllItems(): MemoryItem[] {
    return Array.from(this.memories.values());
  }

  getByTier(tier: Tier): MemoryItem[] {
    return Array.from(this.memories.values()).filter(m => m.tier === tier);
  }

  removeItem(key: string): boolean {
    return this.memories.delete(key);
  }

  hasItem(key: string): boolean {
    return this.memories.has(key);
  }

  getCount(): number {
    return this.memories.size;
  }

  getValue(key: string): unknown {
    return this.memories.get(key)?.value;
  }

  getTier(key: string): Tier | undefined {
    return this.memories.get(key)?.tier;
  }

  getImportance(key: string): number {
    return this.memories.get(key)?.importance ?? 0;
  }

  getHits(key: string): number {
    return this.memories.get(key)?.hits ?? 0;
  }

  getHistory(key: string): Tier[] {
    return [...(this.memories.get(key)?.history ?? [])];
  }

  isActive(key: string): boolean {
    return this.memories.get(key)?.active ?? false;
  }

  setActive(key: string, active: boolean): boolean {
    const m = this.memories.get(key);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setValue(key: string, value: unknown): boolean {
    const m = this.memories.get(key);
    if (!m) return false;
    m.value = value;
    m.updated = Date.now();
    return true;
  }

  setImportance(key: string, importance: number): boolean {
    const m = this.memories.get(key);
    if (!m) return false;
    m.importance = importance;
    m.updated = Date.now();
    return true;
  }

  touch(key: string): boolean {
    const m = this.memories.get(key);
    if (!m) return false;
    m.hits++;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.memories.values()) {
      m.hits = 0;
      m.active = true;
    }
    this.promotions = 0;
    this.demotions = 0;
  }

  getActiveItems(): MemoryItem[] {
    return Array.from(this.memories.values()).filter(m => m.active);
  }

  getInactiveItems(): MemoryItem[] {
    return Array.from(this.memories.values()).filter(m => !m.active);
  }

  getLongTerm(): MemoryItem[] {
    return this.getByTier('long');
  }

  getShortTerm(): MemoryItem[] {
    return this.getByTier('short');
  }

  getWorkingMemory(): MemoryItem[] {
    return this.getByTier('working');
  }

  getLongTermCount(): number {
    return this.getLongTerm().length;
  }

  getShortTermCount(): number {
    return this.getShortTerm().length;
  }

  getWorkingMemoryCount(): number {
    return this.getWorkingMemory().length;
  }

  getByMinImportance(min: number): MemoryItem[] {
    return Array.from(this.memories.values()).filter(m => m.importance >= min);
  }

  getMostImportant(): MemoryItem | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.importance > max.importance ? m : max);
  }

  getMostHits(): MemoryItem | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.hits > max.hits ? m : max);
  }

  getNewest(): MemoryItem | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): MemoryItem | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(key: string): number {
    return this.memories.get(key)?.created ?? 0;
  }

  getUpdatedAt(key: string): number {
    return this.memories.get(key)?.updated ?? 0;
  }

  getPromotions(): number {
    return this.promotions;
  }

  getDemotions(): number {
    return this.demotions;
  }

  getAllKeys(): string[] {
    return [...this.memories.keys()];
  }

  getKeyCount(): number {
    return this.memories.size;
  }

  clearAll(): void {
    this.memories.clear();
    this.promotions = 0;
    this.demotions = 0;
  }
}

export default MemoryHierarchy;