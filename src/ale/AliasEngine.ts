/**
 * Alias Engine
 * claude-code-design Alias Engine - Define + Resolve + Remove + Stats
 */

export type AliasType = 'shortcut' | 'macro' | 'redirect' | 'symlink';

export interface Alias {
  id: string;
  name: string;
  target: string;
  type: AliasType;
  resolved: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface AleStats {
  aliases: number;
  totalAdded: number;
  totalResolved: number;
  totalRemoved: number;
  shortcut: number;
  macro: number;
  redirect: number;
  symlink: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueTargets: number;
  totalResolvedSum: number;
  maxResolved: number;
  avgResolved: number;
}



export class AliasEngine {
  private aliases: Map<string, Alias> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalResolved = 0;
  private totalRemoved = 0;

  define(name: string, target: string, type: AliasType): string {
    const id = `ale-${++this.counter}`;
    this.aliases.set(id, {
      id,
      name,
      target,
      type,
      resolved: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  resolve(id: string): string | null {
    const a = this.aliases.get(id);
    if (!a) return null;
    if (!a.active) return null;
    a.resolved++;
    a.updated = Date.now();
    a.hits++;
    this.totalResolved++;
    return a.target;
  }

  remove(id: string): boolean {
    const a = this.aliases.get(id);
    if (!a) return false;
    this.totalRemoved++;
    return this.aliases.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const a = this.aliases.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const a = this.aliases.get(id);
    if (!a) return false;
    a.name = name;
    a.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const a = this.aliases.get(id);
    if (!a) return false;
    a.target = target;
    a.updated = Date.now();
    return true;
  }

  setType(id: string, type: AliasType): boolean {
    const a = this.aliases.get(id);
    if (!a) return false;
    a.type = type;
    a.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const a of this.aliases.values()) {
      a.resolved = 0;
      a.active = true;
      a.hits = 0;
    }
    this.totalAdded = 0;
    this.totalResolved = 0;
    this.totalRemoved = 0;
  }

  getStats(): AleStats {
    const all = Array.from(this.aliases.values());
    const rArr = all.map(a => a.resolved);
    return {
      aliases: all.length,
      totalAdded: this.totalAdded,
      totalResolved: this.totalResolved,
      totalRemoved: this.totalRemoved,
      shortcut: all.filter(a => a.type === 'shortcut').length,
      macro: all.filter(a => a.type === 'macro').length,
      redirect: all.filter(a => a.type === 'redirect').length,
      symlink: all.filter(a => a.type === 'symlink').length,
      active: all.filter(a => a.active).length,
      inactive: all.filter(a => !a.active).length,
      totalHits: all.reduce((s, a) => s + a.hits, 0),
      uniqueNames: new Set(all.map(a => a.name)).size,
      uniqueTargets: new Set(all.map(a => a.target)).size,
      totalResolvedSum: all.reduce((s, a) => s + a.resolved, 0),
      maxResolved: rArr.length > 0 ? Math.max(...rArr) : 0,
      avgResolved: all.length > 0 ? Math.round((rArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getAlias(id: string): Alias | undefined {
    return this.aliases.get(id);
  }

  getAllAliases(): Alias[] {
    return Array.from(this.aliases.values());
  }

  hasAlias(id: string): boolean {
    return this.aliases.has(id);
  }

  getCount(): number {
    return this.aliases.size;
  }

  getName(id: string): string | undefined {
    return this.aliases.get(id)?.name;
  }

  getTarget(id: string): string | undefined {
    return this.aliases.get(id)?.target;
  }

  getType(id: string): AliasType | undefined {
    return this.aliases.get(id)?.type;
  }

  getResolved(id: string): number {
    return this.aliases.get(id)?.resolved ?? 0;
  }

  getHits(id: string): number {
    return this.aliases.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.aliases.get(id)?.active ?? false;
  }

  isShortcut(id: string): boolean {
    return this.aliases.get(id)?.type === 'shortcut';
  }

  isMacro(id: string): boolean {
    return this.aliases.get(id)?.type === 'macro';
  }

  isRedirect(id: string): boolean {
    return this.aliases.get(id)?.type === 'redirect';
  }

  isSymlink(id: string): boolean {
    return this.aliases.get(id)?.type === 'symlink';
  }

  getByType(type: AliasType): Alias[] {
    return Array.from(this.aliases.values()).filter(a => a.type === type);
  }

  getActiveAliases(): Alias[] {
    return Array.from(this.aliases.values()).filter(a => a.active);
  }

  getInactiveAliases(): Alias[] {
    return Array.from(this.aliases.values()).filter(a => !a.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.aliases.values()).map(a => a.name))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.aliases.values()).map(a => a.target))];
  }

  getNewest(): Alias | null {
    const all = Array.from(this.aliases.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): Alias | null {
    const all = Array.from(this.aliases.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.aliases.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.aliases.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalResolved(): number {
    return this.totalResolved;
  }

  getTotalRemoved(): number {
    return this.totalRemoved;
  }

  clearAll(): void {
    this.aliases.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalResolved = 0;
    this.totalRemoved = 0;
  }
}

export default AliasEngine;