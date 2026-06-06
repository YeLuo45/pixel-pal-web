/**
 * Diff Engine
 * claude-code-design Diff Engine - Compute + Apply + Stats
 */

export type DiffOp = 'add' | 'remove' | 'same';

export interface DiffResult {
  id: string;
  type: DiffOp;
  oldText: string;
  newText: string;
  length: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface DfeStats {
  diffs: number;
  totalAdds: number;
  totalRemoves: number;
  totalSames: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalLength: number;
  avgLength: number;
  maxLength: number;
  minLength: number;
}

export class DiffEngine {
  private diffs: Map<string, DiffResult> = new Map();
  private counter = 0;
  private totalAdds = 0;
  private totalRemoves = 0;
  private totalSames = 0;

  compute(oldText: string, newText: string): string[] {
    const ids: string[] = [];
    // Always do char-by-char diff
    if (oldText.length === 0 && newText.length === 0) {
      return ids;
    }
    if (oldText.length === 0) {
      for (const ch of newText) {
        ids.push(this.add('add', '', ch));
      }
      return ids;
    }
    if (newText.length === 0) {
      for (const ch of oldText) {
        ids.push(this.add('remove', ch, ''));
      }
      return ids;
    }
    const oldChars = oldText.split('');
    const newChars = newText.split('');
    const minLen = Math.min(oldChars.length, newChars.length);
    for (let i = 0; i < minLen; i++) {
      if (oldChars[i] === newChars[i]) {
        ids.push(this.add('same', oldChars[i], newChars[i]));
      } else {
        ids.push(this.add('remove', oldChars[i], ''));
        ids.push(this.add('add', '', newChars[i]));
      }
    }
    for (let i = minLen; i < oldChars.length; i++) {
      ids.push(this.add('remove', oldChars[i], ''));
    }
    for (let i = minLen; i < newChars.length; i++) {
      ids.push(this.add('add', '', newChars[i]));
    }
    return ids;
  }

  private add(type: DiffOp, oldText: string, newText: string): string {
    const id = `dfe-${++this.counter}`;
    this.diffs.set(id, {
      id,
      type,
      oldText,
      newText,
      length: type === 'remove' ? oldText.length : newText.length,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    if (type === 'add') this.totalAdds++;
    else if (type === 'remove') this.totalRemoves++;
    else this.totalSames++;
    return id;
  }

  apply(id: string): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    d.hits++;
    d.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    if (d.type === 'add') this.totalAdds = Math.max(0, this.totalAdds - 1);
    else if (d.type === 'remove') this.totalRemoves = Math.max(0, this.totalRemoves - 1);
    else this.totalSames = Math.max(0, this.totalSames - 1);
    return this.diffs.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.diffs.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    this.diffs.clear();
    this.counter = 0;
    this.totalAdds = 0;
    this.totalRemoves = 0;
    this.totalSames = 0;
  }

  getStats(): DfeStats {
    const all = Array.from(this.diffs.values());
    const lengths = all.map(d => d.length);
    return {
      diffs: all.length,
      totalAdds: this.totalAdds,
      totalRemoves: this.totalRemoves,
      totalSames: this.totalSames,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      totalLength: all.reduce((s, d) => s + d.length, 0),
      avgLength: all.length > 0 ? Math.round((lengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLength: lengths.length > 0 ? Math.max(...lengths) : 0,
      minLength: lengths.length > 0 ? Math.min(...lengths) : 0,
    };
  }

  getDiff(id: string): DiffResult | undefined {
    return this.diffs.get(id);
  }

  getAllDiffs(): DiffResult[] {
    return Array.from(this.diffs.values());
  }

  hasDiff(id: string): boolean {
    return this.diffs.has(id);
  }

  getCount(): number {
    return this.diffs.size;
  }

  getType(id: string): DiffOp | undefined {
    return this.diffs.get(id)?.type;
  }

  getOldText(id: string): string | undefined {
    return this.diffs.get(id)?.oldText;
  }

  getNewText(id: string): string | undefined {
    return this.diffs.get(id)?.newText;
  }

  getLength(id: string): number {
    return this.diffs.get(id)?.length ?? 0;
  }

  getHits(id: string): number {
    return this.diffs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.diffs.get(id)?.active ?? false;
  }

  getByType(type: DiffOp): DiffResult[] {
    return Array.from(this.diffs.values()).filter(d => d.type === type);
  }

  getAdds(): DiffResult[] {
    return this.getByType('add');
  }

  getRemoves(): DiffResult[] {
    return this.getByType('remove');
  }

  getSames(): DiffResult[] {
    return this.getByType('same');
  }

  getActiveDiffs(): DiffResult[] {
    return Array.from(this.diffs.values()).filter(d => d.active);
  }

  getInactiveDiffs(): DiffResult[] {
    return Array.from(this.diffs.values()).filter(d => !d.active);
  }

  getNewest(): DiffResult | null {
    const all = Array.from(this.diffs.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): DiffResult | null {
    const all = Array.from(this.diffs.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.diffs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.diffs.get(id)?.updated ?? 0;
  }

  getTotalAdds(): number {
    return this.totalAdds;
  }

  getTotalRemoves(): number {
    return this.totalRemoves;
  }

  getTotalSames(): number {
    return this.totalSames;
  }

  clearAll(): void {
    this.diffs.clear();
    this.counter = 0;
    this.totalAdds = 0;
    this.totalRemoves = 0;
    this.totalSames = 0;
  }
}

export default DiffEngine;