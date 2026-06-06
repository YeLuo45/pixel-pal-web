/**
 * Session Engine
 * chatdev-design Session Engine - Create + Send + End + Stats
 */

export interface Session {
  id: string;
  user: string;
  messages: number;
  active: boolean;
  created: number;
  updated: number;
  ended: boolean;
  hits: number;
  history: number[];
}

export interface SE5Stats {
  sessions: number;
  totalMessages: number;
  active: number;
  inactive: number;
  ended: number;
  totalHits: number;
  uniqueUsers: number;
  avgMessages: number;
  maxMessages: number;
  minMessages: number;
}

export class SessionEngine {
  private sessions: Map<string, Session> = new Map();
  private counter = 0;
  private totalMessages = 0;

  create(user: string): string {
    const id = `se4-${++this.counter}`;
    this.sessions.set(id, {
      id,
      user,
      messages: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      ended: false,
      hits: 0,
      history: [],
    });
    return id;
  }

  send(id: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.ended) return false;
    s.messages++;
    s.history.push(Date.now());
    s.updated = Date.now();
    s.hits++;
    this.totalMessages++;
    return true;
  }

  end(id: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    if (s.ended) return false;
    s.ended = true;
    s.active = false;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  reopen(id: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    if (!s.ended) return false;
    s.ended = false;
    s.active = true;
    s.updated = Date.now();
    return true;
  }

  getStats(): SE5Stats {
    const all = Array.from(this.sessions.values());
    const msgValues = all.map(s => s.messages);
    return {
      sessions: all.length,
      totalMessages: this.totalMessages,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      ended: all.filter(s => s.ended).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueUsers: new Set(all.map(s => s.user)).size,
      avgMessages: all.length > 0 ? Math.round((msgValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMessages: msgValues.length > 0 ? Math.max(...msgValues) : 0,
      minMessages: msgValues.length > 0 ? Math.min(...msgValues) : 0,
    };
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  hasSession(id: string): boolean {
    return this.sessions.has(id);
  }

  getCount(): number {
    return this.sessions.size;
  }

  getUser(id: string): string | undefined {
    return this.sessions.get(id)?.user;
  }

  getMessages(id: string): number {
    return this.sessions.get(id)?.messages ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.sessions.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.sessions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.sessions.get(id)?.active ?? false;
  }

  isEnded(id: string): boolean {
    return this.sessions.get(id)?.ended ?? false;
  }

  setUser(id: string, user: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    s.user = user;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.sessions.values()) {
      s.messages = 0;
      s.hits = 0;
      s.history = [];
      s.active = true;
      s.ended = false;
    }
    this.totalMessages = 0;
  }

  getByUser(user: string): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.user === user);
  }

  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.active);
  }

  getInactiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => !s.active);
  }

  getEndedSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.ended);
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.sessions.values()).map(s => s.user))];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  getByMinMessages(min: number): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.messages >= min);
  }

  getMostMessages(): Session | null {
    const all = Array.from(this.sessions.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.messages > max.messages ? s : max);
  }

  getNewest(): Session | null {
    const all = Array.from(this.sessions.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Session | null {
    const all = Array.from(this.sessions.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.sessions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.sessions.get(id)?.updated ?? 0;
  }

  getTotalMessages(): number {
    return this.totalMessages;
  }

  clearAll(): void {
    this.sessions.clear();
    this.counter = 0;
    this.totalMessages = 0;
  }
}

export default SessionEngine;