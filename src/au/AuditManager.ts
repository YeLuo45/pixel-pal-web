/**
 * Audit Manager
 * thunderbolt-design Audit Manager - Record + Query + Stats
 */

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface AUMStats {
  entries: number;
  actors: number;
  actions: number;
  targets: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueActors: number;
  uniqueActions: number;
  uniqueTargets: number;
}

export class AuditManager {
  private entries: Map<string, AuditEntry> = new Map();
  private counter = 0;

  record(actor: string, action: string, target: string): string {
    const id = `au-${++this.counter}`;
    this.entries.set(id, {
      id,
      actor,
      action,
      target,
      timestamp: Date.now(),
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  query(actor?: string, action?: string): AuditEntry[] {
    let result = Array.from(this.entries.values());
    if (actor) result = result.filter(e => e.actor === actor);
    if (action) result = result.filter(e => e.action === action);
    return result;
  }

  queryByTarget(target: string): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.target === target);
  }

  queryByActor(actor: string): AuditEntry[] {
    return this.query(actor);
  }

  queryByAction(action: string): AuditEntry[] {
    return this.query(undefined, action);
  }

  getStats(): AUMStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      actors: new Set(all.map(e => e.actor)).size,
      actions: new Set(all.map(e => e.action)).size,
      targets: new Set(all.map(e => e.target)).size,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueActors: new Set(all.map(e => e.actor)).size,
      uniqueActions: new Set(all.map(e => e.action)).size,
      uniqueTargets: new Set(all.map(e => e.target)).size,
    };
  }

  getEntry(id: string): AuditEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): AuditEntry[] {
    return Array.from(this.entries.values());
  }

  removeEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getActor(id: string): string | undefined {
    return this.entries.get(id)?.actor;
  }

  getAction(id: string): string | undefined {
    return this.entries.get(id)?.action;
  }

  getTarget(id: string): string | undefined {
    return this.entries.get(id)?.target;
  }

  getTimestamp(id: string): number {
    return this.entries.get(id)?.timestamp ?? 0;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  touch(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.hits++;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.hits = 0;
      e.active = true;
    }
  }

  getByActor(actor: string): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.actor === actor);
  }

  getByAction(action: string): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.action === action);
  }

  getByTarget(target: string): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.target === target);
  }

  getActiveEntries(): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }

  getInactiveEntries(): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.active);
  }

  getAllActors(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.actor))];
  }

  getActorCount(): number {
    return this.getAllActors().length;
  }

  getAllActions(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.action))];
  }

  getActionCount(): number {
    return this.getAllActions().length;
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.target))];
  }

  getTargetCount(): number {
    return this.getAllTargets().length;
  }

  getNewest(): AuditEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): AuditEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.entries.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.entries.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
  }
}

export default AuditManager;