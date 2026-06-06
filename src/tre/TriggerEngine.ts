/**
 * Trigger Engine
 * generic-agent-design Trigger Engine - Define + Fire + Enable + Disable + Stats
 */

export type TriggerType = 'event' | 'time' | 'condition' | 'manual';

export interface Trigger {
  id: string;
  name: string;
  type: TriggerType;
  enabled: boolean;
  fires: number;
  lastFire: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface TreStats {
  triggers: number;
  enabled: number;
  disabled: number;
  totalFires: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueTypes: number;
  event: number;
  time: number;
  condition: number;
  manual: number;
  avgFires: number;
  maxFires: number;
  minFires: number;
  enabledRate: number;
}

export class TriggerEngine {
  private triggers: Map<string, Trigger> = new Map();
  private counter = 0;
  private totalFires = 0;

  define(name: string, type: TriggerType = 'event'): string {
    const id = `tre-${++this.counter}`;
    this.triggers.set(id, {
      id,
      name,
      type,
      enabled: true,
      fires: 0,
      lastFire: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  fire(id: string): boolean {
    const t = this.triggers.get(id);
    if (!t) return false;
    if (!t.active) return false;
    if (!t.enabled) return false;
    t.fires++;
    t.lastFire = Date.now();
    t.history.push(t.lastFire);
    t.updated = Date.now();
    t.hits++;
    this.totalFires++;
    return true;
  }

  enable(id: string): boolean {
    const t = this.triggers.get(id);
    if (!t) return false;
    if (t.enabled) return false;
    t.enabled = true;
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  disable(id: string): boolean {
    const t = this.triggers.get(id);
    if (!t) return false;
    if (!t.enabled) return false;
    t.enabled = false;
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  reset(id: string): boolean {
    const t = this.triggers.get(id);
    if (!t) return false;
    t.fires = 0;
    t.lastFire = 0;
    t.history = [];
    t.updated = Date.now();
    return true;
  }

  getStats(): TreStats {
    const all = Array.from(this.triggers.values());
    const fireValues = all.map(t => t.fires);
    return {
      triggers: all.length,
      enabled: all.filter(t => t.enabled).length,
      disabled: all.filter(t => !t.enabled).length,
      totalFires: this.totalFires,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      uniqueTypes: new Set(all.map(t => t.type)).size,
      event: all.filter(t => t.type === 'event').length,
      time: all.filter(t => t.type === 'time').length,
      condition: all.filter(t => t.type === 'condition').length,
      manual: all.filter(t => t.type === 'manual').length,
      avgFires: all.length > 0 ? Math.round((fireValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxFires: fireValues.length > 0 ? Math.max(...fireValues) : 0,
      minFires: fireValues.length > 0 ? Math.min(...fireValues) : 0,
      enabledRate: all.length > 0 ? Math.round((all.filter(t => t.enabled).length / all.length) * 100) / 100 : 0,
    };
  }

  getTrigger(id: string): Trigger | undefined {
    return this.triggers.get(id);
  }

  getAllTriggers(): Trigger[] {
    return Array.from(this.triggers.values());
  }

  removeTrigger(id: string): boolean {
    return this.triggers.delete(id);
  }

  hasTrigger(id: string): boolean {
    return this.triggers.has(id);
  }

  getCount(): number {
    return this.triggers.size;
  }

  getName(id: string): string | undefined {
    return this.triggers.get(id)?.name;
  }

  getType(id: string): TriggerType | undefined {
    return this.triggers.get(id)?.type;
  }

  getFires(id: string): number {
    return this.triggers.get(id)?.fires ?? 0;
  }

  getLastFire(id: string): number {
    return this.triggers.get(id)?.lastFire ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.triggers.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.triggers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.triggers.get(id)?.active ?? false;
  }

  isEnabled(id: string): boolean {
    return this.triggers.get(id)?.enabled ?? false;
  }

  isDisabled(id: string): boolean {
    const t = this.triggers.get(id);
    return t ? !t.enabled : false;
  }

  isEvent(id: string): boolean {
    return this.triggers.get(id)?.type === 'event';
  }

  isTime(id: string): boolean {
    return this.triggers.get(id)?.type === 'time';
  }

  isCondition(id: string): boolean {
    return this.triggers.get(id)?.type === 'condition';
  }

  isManual(id: string): boolean {
    return this.triggers.get(id)?.type === 'manual';
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.triggers.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.triggers.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  setType(id: string, type: TriggerType): boolean {
    const t = this.triggers.get(id);
    if (!t) return false;
    t.type = type;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.triggers.values()) {
      t.fires = 0;
      t.lastFire = 0;
      t.hits = 0;
      t.history = [];
      t.active = true;
      t.enabled = true;
    }
    this.totalFires = 0;
  }

  getByName(name: string): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.name === name);
  }

  getByType(type: TriggerType): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.type === type);
  }

  getEventTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.type === 'event');
  }

  getTimeTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.type === 'time');
  }

  getConditionTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.type === 'condition');
  }

  getManualTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.type === 'manual');
  }

  getEnabledTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.enabled);
  }

  getDisabledTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => !t.enabled);
  }

  getActiveTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.active);
  }

  getInactiveTriggers(): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.triggers.values()).map(t => t.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinFires(min: number): Trigger[] {
    return Array.from(this.triggers.values()).filter(t => t.fires >= min);
  }

  getMostFires(): Trigger | null {
    const all = Array.from(this.triggers.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.fires > max.fires ? t : max);
  }

  getNewest(): Trigger | null {
    const all = Array.from(this.triggers.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Trigger | null {
    const all = Array.from(this.triggers.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.triggers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.triggers.get(id)?.updated ?? 0;
  }

  getTotalFires(): number {
    return this.totalFires;
  }

  clearAll(): void {
    this.triggers.clear();
    this.counter = 0;
    this.totalFires = 0;
  }
}

export default TriggerEngine;