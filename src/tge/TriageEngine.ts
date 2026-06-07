/**
 * Triage Engine
 * nanobot-design Triage Engine - Add + Triage + Stats
 */

export type TriageLevel = 'critical' | 'high' | 'medium' | 'low' | 'deferred';

export interface TriageItem {
  id: string;
  subject: string;
  level: TriageLevel;
  assignedTo: string;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface TgeStats {
  items: number;
  totalAdded: number;
  totalTriaged: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  deferred: number;
  assigned: number;
  unassigned: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSubjects: number;
  uniqueAssignees: number;
  totalSubjectLen: number;
  avgSubjectLen: number;
}

export class TriageEngine {
  private items: Map<string, TriageItem> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalTriaged = 0;
  private totalSubjectLen = 0;

  add(subject: string, level: TriageLevel = 'medium'): string {
    const id = `tge-${++this.counter}`;
    this.items.set(id, {
      id,
      subject,
      level,
      assignedTo: '',
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalSubjectLen += subject.length;
    return id;
  }

  triage(id: string, level: TriageLevel, assignee: string): boolean {
    const t = this.items.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.level = level;
    t.assignedTo = assignee;
    t.updated = Date.now();
    t.hits++;
    this.totalTriaged++;
    return true;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.items.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setSubject(id: string, subject: string): boolean {
    const t = this.items.get(id);
    if (!t) return false;
    t.subject = subject;
    t.updated = Date.now();
    return true;
  }

  setLevel(id: string, level: TriageLevel): boolean {
    const t = this.items.get(id);
    if (!t) return false;
    t.level = level;
    t.updated = Date.now();
    return true;
  }

  setAssignee(id: string, assignee: string): boolean {
    const t = this.items.get(id);
    if (!t) return false;
    t.assignedTo = assignee;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.items.values()) {
      t.level = 'medium';
      t.assignedTo = '';
      t.active = true;
      t.hits = 0;
    }
    this.totalAdded = 0;
    this.totalTriaged = 0;
    this.totalSubjectLen = 0;
  }

  getStats(): TgeStats {
    const all = Array.from(this.items.values());
    return {
      items: all.length,
      totalAdded: this.totalAdded,
      totalTriaged: this.totalTriaged,
      critical: all.filter(t => t.level === 'critical').length,
      high: all.filter(t => t.level === 'high').length,
      medium: all.filter(t => t.level === 'medium').length,
      low: all.filter(t => t.level === 'low').length,
      deferred: all.filter(t => t.level === 'deferred').length,
      assigned: all.filter(t => t.assignedTo !== '').length,
      unassigned: all.filter(t => t.assignedTo === '').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueSubjects: new Set(all.map(t => t.subject)).size,
      uniqueAssignees: new Set(all.map(t => t.assignedTo).filter(a => a !== '')).size,
      totalSubjectLen: this.totalSubjectLen,
      avgSubjectLen: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.subject.length, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getItem(id: string): TriageItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): TriageItem[] {
    return Array.from(this.items.values());
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }

  getCount(): number {
    return this.items.size;
  }

  getSubject(id: string): string | undefined {
    return this.items.get(id)?.subject;
  }

  getLevel(id: string): TriageLevel | undefined {
    return this.items.get(id)?.level;
  }

  getAssignee(id: string): string {
    return this.items.get(id)?.assignedTo ?? '';
  }

  getHits(id: string): number {
    return this.items.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.items.get(id)?.active ?? false;
  }

  isCritical(id: string): boolean {
    return this.items.get(id)?.level === 'critical';
  }

  isHigh(id: string): boolean {
    return this.items.get(id)?.level === 'high';
  }

  isMedium(id: string): boolean {
    return this.items.get(id)?.level === 'medium';
  }

  isLow(id: string): boolean {
    return this.items.get(id)?.level === 'low';
  }

  isDeferred(id: string): boolean {
    return this.items.get(id)?.level === 'deferred';
  }

  isAssigned(id: string): boolean {
    return (this.items.get(id)?.assignedTo ?? '') !== '';
  }

  getByLevel(level: TriageLevel): TriageItem[] {
    return Array.from(this.items.values()).filter(t => t.level === level);
  }

  getAssignedItems(): TriageItem[] {
    return Array.from(this.items.values()).filter(t => t.assignedTo !== '');
  }

  getUnassignedItems(): TriageItem[] {
    return Array.from(this.items.values()).filter(t => t.assignedTo === '');
  }

  getActiveItems(): TriageItem[] {
    return Array.from(this.items.values()).filter(t => t.active);
  }

  getInactiveItems(): TriageItem[] {
    return Array.from(this.items.values()).filter(t => !t.active);
  }

  getAllSubjects(): string[] {
    return [...new Set(Array.from(this.items.values()).map(t => t.subject))];
  }

  getAllAssignees(): string[] {
    return [...new Set(Array.from(this.items.values()).map(t => t.assignedTo).filter(a => a !== ''))];
  }

  getNewest(): TriageItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): TriageItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.items.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.items.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalTriaged(): number {
    return this.totalTriaged;
  }

  clearAll(): void {
    this.items.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalTriaged = 0;
    this.totalSubjectLen = 0;
  }
}

export default TriageEngine;