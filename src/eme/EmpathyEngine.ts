/**
 * Empathy Engine
 * generic-agent-design Empathy Engine - Add + Respond + Stats
 */

export type EmpathyTone = 'warm' | 'caring' | 'supportive' | 'compassionate' | 'neutral';

export interface EmpathyEntry {
  id: string;
  trigger: string;
  tone: EmpathyTone;
  response: string;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface EmeStats {
  entries: number;
  totalAdded: number;
  totalResponded: number;
  warm: number;
  caring: number;
  supportive: number;
  compassionate: number;
  neutral: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTriggers: number;
  totalResponseLen: number;
  totalTriggerLen: number;
  avgResponseLen: number;
  avgTriggerLen: number;
}

export class EmpathyEngine {
  private entries: Map<string, EmpathyEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalResponded = 0;
  private totalResponseLen = 0;
  private totalTriggerLen = 0;

  add(trigger: string, tone: EmpathyTone, response: string): string {
    const id = `eme-${++this.counter}`;
    this.entries.set(id, {
      id,
      trigger,
      tone,
      response,
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalResponseLen += response.length;
    this.totalTriggerLen += trigger.length;
    return id;
  }

  respond(id: string): string | null {
    const e = this.entries.get(id);
    if (!e) return null;
    if (!e.active) return null;
    e.hits++;
    e.updated = Date.now();
    this.totalResponded++;
    return e.response;
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

  setTrigger(id: string, trigger: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.trigger = trigger;
    e.updated = Date.now();
    return true;
  }

  setTone(id: string, tone: EmpathyTone): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.tone = tone;
    e.updated = Date.now();
    return true;
  }

  setResponse(id: string, response: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.response = response;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.hits = 0;
      e.active = true;
    }
    this.totalAdded = 0;
    this.totalResponded = 0;
    this.totalResponseLen = 0;
    this.totalTriggerLen = 0;
  }

  getStats(): EmeStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      totalAdded: this.totalAdded,
      totalResponded: this.totalResponded,
      warm: all.filter(e => e.tone === 'warm').length,
      caring: all.filter(e => e.tone === 'caring').length,
      supportive: all.filter(e => e.tone === 'supportive').length,
      compassionate: all.filter(e => e.tone === 'compassionate').length,
      neutral: all.filter(e => e.tone === 'neutral').length,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueTriggers: new Set(all.map(e => e.trigger)).size,
      totalResponseLen: this.totalResponseLen,
      totalTriggerLen: this.totalTriggerLen,
      avgResponseLen: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.response.length, 0) / all.length) * 100) / 100 : 0,
      avgTriggerLen: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.trigger.length, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getEntry(id: string): EmpathyEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): EmpathyEntry[] {
    return Array.from(this.entries.values());
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getTrigger(id: string): string | undefined {
    return this.entries.get(id)?.trigger;
  }

  getTone(id: string): EmpathyTone | undefined {
    return this.entries.get(id)?.tone;
  }

  getResponse(id: string): string | undefined {
    return this.entries.get(id)?.response;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  isWarm(id: string): boolean {
    return this.entries.get(id)?.tone === 'warm';
  }

  isCaring(id: string): boolean {
    return this.entries.get(id)?.tone === 'caring';
  }

  isSupportive(id: string): boolean {
    return this.entries.get(id)?.tone === 'supportive';
  }

  isCompassionate(id: string): boolean {
    return this.entries.get(id)?.tone === 'compassionate';
  }

  isNeutral(id: string): boolean {
    return this.entries.get(id)?.tone === 'neutral';
  }

  getByTone(tone: EmpathyTone): EmpathyEntry[] {
    return Array.from(this.entries.values()).filter(e => e.tone === tone);
  }

  getActiveEntries(): EmpathyEntry[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }

  getInactiveEntries(): EmpathyEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.active);
  }

  getAllTriggers(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.trigger))];
  }

  getNewest(): EmpathyEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): EmpathyEntry | null {
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalResponded(): number {
    return this.totalResponded;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalResponded = 0;
    this.totalResponseLen = 0;
    this.totalTriggerLen = 0;
  }
}

export default EmpathyEngine;