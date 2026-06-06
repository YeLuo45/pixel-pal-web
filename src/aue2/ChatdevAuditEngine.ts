/**
 * Chatdev Audit Engine
 * chatdev-design Audit Engine - Log + Inspect + Flag + Stats
 */

export type AuditCategory = 'auth' | 'data' | 'system' | 'user' | 'security';

export interface AuditEntry {
  id: string;
  category: AuditCategory;
  action: string;
  actor: string;
  flagged: boolean;
  inspected: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface AueStats {
  entries: number;
  totalFlagged: number;
  totalInspected: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueActions: number;
  uniqueActors: number;
  auth: number;
  data: number;
  system: number;
  user: number;
  security: number;
  flagged: number;
  inspected: number;
}

export class ChatdevAuditEngine {
  private entries: Map<string, AuditEntry> = new Map();
  private counter = 0;
  private totalFlagged = 0;
  private totalInspected = 0;

  log(category: AuditCategory, action: string, actor: string): string {
    const id = `aue-${++this.counter}`;
    this.entries.set(id, {
      id,
      category,
      action,
      actor,
      flagged: false,
      inspected: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  flag(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    if (e.flagged) return false;
    e.flagged = true;
    e.updated = Date.now();
    e.hits++;
    this.totalFlagged++;
    return true;
  }

  unflag(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.flagged = false;
    e.updated = Date.now();
    e.hits++;
    this.totalFlagged = Math.max(0, this.totalFlagged - 1);
    return true;
  }

  inspect(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    if (e.inspected) return false;
    e.inspected = true;
    e.updated = Date.now();
    e.hits++;
    this.totalInspected++;
    return true;
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.flagged = false;
      e.inspected = false;
      e.active = true;
      e.hits = 0;
    }
    this.totalFlagged = 0;
    this.totalInspected = 0;
  }

  getStats(): AueStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      totalFlagged: this.totalFlagged,
      totalInspected: this.totalInspected,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueActions: new Set(all.map(e => e.action)).size,
      uniqueActors: new Set(all.map(e => e.actor)).size,
      auth: all.filter(e => e.category === 'auth').length,
      data: all.filter(e => e.category === 'data').length,
      system: all.filter(e => e.category === 'system').length,
      user: all.filter(e => e.category === 'user').length,
      security: all.filter(e => e.category === 'security').length,
      flagged: all.filter(e => e.flagged).length,
      inspected: all.filter(e => e.inspected).length,
    };
  }

  getEntry(id: string): AuditEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): AuditEntry[] {
    return Array.from(this.entries.values());
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getCategory(id: string): AuditCategory | undefined {
    return this.entries.get(id)?.category;
  }

  getAction(id: string): string | undefined {
    return this.entries.get(id)?.action;
  }

  getActor(id: string): string | undefined {
    return this.entries.get(id)?.actor;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  isFlagged(id: string): boolean {
    return this.entries.get(id)?.flagged ?? false;
  }

  isInspected(id: string): boolean {
    return this.entries.get(id)?.inspected ?? false;
  }

  getByCategory(cat: AuditCategory): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.category === cat);
  }

  getByActor(actor: string): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.actor === actor);
  }

  getFlaggedEntries(): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.flagged);
  }

  getInspectedEntries(): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.inspected);
  }

  getUninspectedEntries(): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.inspected);
  }

  getActiveEntries(): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }

  getInactiveEntries(): AuditEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.active);
  }

  getAllActions(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.action))];
  }

  getAllActors(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.actor))];
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

  getTotalFlagged(): number {
    return this.totalFlagged;
  }

  getTotalInspected(): number {
    return this.totalInspected;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
    this.totalFlagged = 0;
    this.totalInspected = 0;
  }
}

export default ChatdevAuditEngine;