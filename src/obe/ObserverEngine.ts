/**
 * Observer Engine
 * generic-agent-design Observer Engine - Watch + Notify + Unsubscribe + Stats
 */

export type ObserverEvent = 'create' | 'update' | 'delete' | 'read';

export interface Observation {
  id: string;
  target: string;
  event: ObserverEvent;
  data: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface ObeStats {
  observations: number;
  totalWatched: number;
  totalNotified: number;
  totalUnsubscribed: number;
  create: number;
  update: number;
  delete: number;
  read: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTargets: number;
  totalDataLen: number;
  avgDataLen: number;
  maxDataLen: number;
  minDataLen: number;
}

export class ObserverEngine {
  private observations: Map<string, Observation> = new Map();
  private counter = 0;
  private totalWatched = 0;
  private totalNotified = 0;
  private totalUnsubscribed = 0;
  private totalDataLen = 0;

  watch(target: string, event: ObserverEvent, data: string): string {
    const id = `obe-${++this.counter}`;
    this.observations.set(id, {
      id,
      target,
      event,
      data,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalWatched++;
    this.totalDataLen += data.length;
    return id;
  }

  notify(id: string): boolean {
    const o = this.observations.get(id);
    if (!o) return false;
    if (!o.active) return false;
    o.updated = Date.now();
    o.hits++;
    this.totalNotified++;
    return true;
  }

  unsubscribe(id: string): boolean {
    const o = this.observations.get(id);
    if (!o) return false;
    o.active = false;
    o.updated = Date.now();
    this.totalUnsubscribed++;
    return true;
  }

  remove(id: string): boolean {
    return this.observations.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const o = this.observations.get(id);
    if (!o) return false;
    o.active = active;
    o.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const o = this.observations.get(id);
    if (!o) return false;
    o.target = target;
    o.updated = Date.now();
    return true;
  }

  setData(id: string, data: string): boolean {
    const o = this.observations.get(id);
    if (!o) return false;
    o.data = data;
    o.updated = Date.now();
    return true;
  }

  setEvent(id: string, event: ObserverEvent): boolean {
    const o = this.observations.get(id);
    if (!o) return false;
    o.event = event;
    o.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const o of this.observations.values()) {
      o.active = true;
      o.hits = 0;
    }
    this.totalWatched = 0;
    this.totalNotified = 0;
    this.totalUnsubscribed = 0;
    this.totalDataLen = 0;
  }

  getStats(): ObeStats {
    const all = Array.from(this.observations.values());
    const dataLens = all.map(o => o.data.length);
    return {
      observations: all.length,
      totalWatched: this.totalWatched,
      totalNotified: this.totalNotified,
      totalUnsubscribed: this.totalUnsubscribed,
      create: all.filter(o => o.event === 'create').length,
      update: all.filter(o => o.event === 'update').length,
      delete: all.filter(o => o.event === 'delete').length,
      read: all.filter(o => o.event === 'read').length,
      active: all.filter(o => o.active).length,
      inactive: all.filter(o => !o.active).length,
      totalHits: all.reduce((s, o) => s + o.hits, 0),
      uniqueTargets: new Set(all.map(o => o.target)).size,
      totalDataLen: this.totalDataLen,
      avgDataLen: all.length > 0 ? Math.round((dataLens.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDataLen: dataLens.length > 0 ? Math.max(...dataLens) : 0,
      minDataLen: dataLens.length > 0 ? Math.min(...dataLens) : 0,
    };
  }

  getObservation(id: string): Observation | undefined {
    return this.observations.get(id);
  }

  getAllObservations(): Observation[] {
    return Array.from(this.observations.values());
  }

  hasObservation(id: string): boolean {
    return this.observations.has(id);
  }

  getCount(): number {
    return this.observations.size;
  }

  getTarget(id: string): string | undefined {
    return this.observations.get(id)?.target;
  }

  getEvent(id: string): ObserverEvent | undefined {
    return this.observations.get(id)?.event;
  }

  getData(id: string): string | undefined {
    return this.observations.get(id)?.data;
  }

  getHits(id: string): number {
    return this.observations.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.observations.get(id)?.active ?? false;
  }

  isCreate(id: string): boolean {
    return this.observations.get(id)?.event === 'create';
  }

  isUpdate(id: string): boolean {
    return this.observations.get(id)?.event === 'update';
  }

  isDelete(id: string): boolean {
    return this.observations.get(id)?.event === 'delete';
  }

  isRead(id: string): boolean {
    return this.observations.get(id)?.event === 'read';
  }

  getByEvent(event: ObserverEvent): Observation[] {
    return Array.from(this.observations.values()).filter(o => o.event === event);
  }

  getByTarget(target: string): Observation[] {
    return Array.from(this.observations.values()).filter(o => o.target === target);
  }

  getActiveObservations(): Observation[] {
    return Array.from(this.observations.values()).filter(o => o.active);
  }

  getInactiveObservations(): Observation[] {
    return Array.from(this.observations.values()).filter(o => !o.active);
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.observations.values()).map(o => o.target))];
  }

  getNewest(): Observation | null {
    const all = Array.from(this.observations.values());
    if (all.length === 0) return null;
    return all.reduce((max, o) => o.created > max.created ? o : max);
  }

  getOldest(): Observation | null {
    const all = Array.from(this.observations.values());
    if (all.length === 0) return null;
    return all.reduce((min, o) => o.created < min.created ? o : min);
  }

  getCreatedAt(id: string): number {
    return this.observations.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.observations.get(id)?.updated ?? 0;
  }

  getTotalWatched(): number {
    return this.totalWatched;
  }

  getTotalNotified(): number {
    return this.totalNotified;
  }

  getTotalUnsubscribed(): number {
    return this.totalUnsubscribed;
  }

  clearAll(): void {
    this.observations.clear();
    this.counter = 0;
    this.totalWatched = 0;
    this.totalNotified = 0;
    this.totalUnsubscribed = 0;
    this.totalDataLen = 0;
  }
}

export default ObserverEngine;