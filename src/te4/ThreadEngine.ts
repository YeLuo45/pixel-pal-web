/**
 * Thread Engine
 * chatdev-design Thread Engine - Create + Post + Lock + Unlock + Stats
 */

export interface Thread {
  id: string;
  title: string;
  participants: string[];
  messages: number;
  locked: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface TE4Stats {
  threads: number;
  totalMessages: number;
  locked: number;
  unlocked: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  avgMessages: number;
  maxMessages: number;
  minMessages: number;
  avgParticipants: number;
  totalParticipants: number;
}

export class ThreadEngine {
  private threads: Map<string, Thread> = new Map();
  private counter = 0;
  private totalMessages = 0;

  create(title: string, participants: string[]): string {
    const id = `te4-${++this.counter}`;
    this.threads.set(id, {
      id,
      title,
      participants: [...participants],
      messages: 0,
      locked: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  post(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    if (!t.active) return false;
    if (t.locked) return false;
    t.messages++;
    t.history.push(Date.now());
    t.updated = Date.now();
    t.hits++;
    this.totalMessages++;
    return true;
  }

  lock(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    if (t.locked) return false;
    t.locked = true;
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  unlock(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    if (!t.locked) return false;
    t.locked = false;
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  reset(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.messages = 0;
    t.history = [];
    t.updated = Date.now();
    return true;
  }

  getStats(): TE4Stats {
    const all = Array.from(this.threads.values());
    const msgValues = all.map(t => t.messages);
    const partCounts = all.map(t => t.participants.length);
    return {
      threads: all.length,
      totalMessages: this.totalMessages,
      locked: all.filter(t => t.locked).length,
      unlocked: all.filter(t => !t.locked).length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueTitles: new Set(all.map(t => t.title)).size,
      avgMessages: all.length > 0 ? Math.round((msgValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMessages: msgValues.length > 0 ? Math.max(...msgValues) : 0,
      minMessages: msgValues.length > 0 ? Math.min(...msgValues) : 0,
      avgParticipants: all.length > 0 ? Math.round((partCounts.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      totalParticipants: partCounts.reduce((s, v) => s + v, 0),
    };
  }

  getThread(id: string): Thread | undefined {
    return this.threads.get(id);
  }

  getAllThreads(): Thread[] {
    return Array.from(this.threads.values());
  }

  removeThread(id: string): boolean {
    return this.threads.delete(id);
  }

  hasThread(id: string): boolean {
    return this.threads.has(id);
  }

  getCount(): number {
    return this.threads.size;
  }

  getTitle(id: string): string | undefined {
    return this.threads.get(id)?.title;
  }

  getParticipants(id: string): string[] {
    return [...(this.threads.get(id)?.participants ?? [])];
  }

  getParticipantCount(id: string): number {
    return this.threads.get(id)?.participants.length ?? 0;
  }

  getMessages(id: string): number {
    return this.threads.get(id)?.messages ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.threads.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.threads.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.threads.get(id)?.active ?? false;
  }

  isLocked(id: string): boolean {
    return this.threads.get(id)?.locked ?? false;
  }

  isUnlocked(id: string): boolean {
    const t = this.threads.get(id);
    return t ? !t.locked : false;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.title = title;
    t.updated = Date.now();
    return true;
  }

  setParticipants(id: string, participants: string[]): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.participants = [...participants];
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.threads.values()) {
      t.messages = 0;
      t.hits = 0;
      t.history = [];
      t.active = true;
      t.locked = false;
    }
    this.totalMessages = 0;
  }

  getByTitle(title: string): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.title === title);
  }

  getLockedThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.locked);
  }

  getUnlockedThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => !t.locked);
  }

  getActiveThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.active);
  }

  getInactiveThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => !t.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.threads.values()).map(t => t.title))];
  }

  getTitleCount(): number {
    return this.getAllTitles().length;
  }

  getByMinMessages(min: number): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.messages >= min);
  }

  getMostMessages(): Thread | null {
    const all = Array.from(this.threads.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.messages > max.messages ? t : max);
  }

  getNewest(): Thread | null {
    const all = Array.from(this.threads.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Thread | null {
    const all = Array.from(this.threads.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.threads.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.threads.get(id)?.updated ?? 0;
  }

  getTotalMessages(): number {
    return this.totalMessages;
  }

  clearAll(): void {
    this.threads.clear();
    this.counter = 0;
    this.totalMessages = 0;
  }
}

export default ThreadEngine;