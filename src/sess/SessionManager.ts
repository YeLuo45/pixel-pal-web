/**
 * Session Manager
 * chatdev-design Session Manager - Create + Set + Get + Close
 */

export interface Session {
  id: string;
  userId: string;
  data: Record<string, unknown>;
  active: boolean;
  startedAt: number;
  endedAt: number;
  updated: number;
  hits: number;
}

export interface SessionStats {
  sessions: number;
  active: number;
  closed: number;
  users: number;
  totalHits: number;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private counter = 0;

  create(userId: string): string {
    const id = `sess-${++this.counter}`;
    this.sessions.set(id, {
      id,
      userId,
      data: {},
      active: true,
      startedAt: Date.now(),
      endedAt: 0,
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  set(id: string, key: string, value: unknown): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.data[key] = value;
    s.updated = Date.now();
    return true;
  }

  get(id: string, key: string): unknown {
    const s = this.sessions.get(id);
    if (!s) return undefined;
    if (!(key in s.data)) return undefined;
    s.hits++;
    s.updated = Date.now();
    return s.data[key];
  }

  close(id: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.active = false;
    s.endedAt = Date.now();
    return true;
  }

  getStats(): SessionStats {
    const all = Array.from(this.sessions.values());
    return {
      sessions: all.length,
      active: all.filter(s => s.active).length,
      closed: all.filter(s => !s.active).length,
      users: new Set(all.map(s => s.userId)).size,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
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

  getUserId(id: string): string | undefined {
    return this.sessions.get(id)?.userId;
  }

  getData(id: string): Record<string, unknown> | undefined {
    return this.sessions.get(id)?.data;
  }

  getKeys(id: string): string[] {
    return Object.keys(this.sessions.get(id)?.data ?? {});
  }

  getKeyCount(id: string): number {
    return this.getKeys(id).length;
  }

  hasKey(id: string, key: string): boolean {
    return key in (this.sessions.get(id)?.data ?? {});
  }

  deleteKey(id: string, key: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    if (!(key in s.data)) return false;
    delete s.data[key];
    s.updated = Date.now();
    return true;
  }

  clearData(id: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    s.data = {};
    s.updated = Date.now();
    return true;
  }

  isActive(id: string): boolean {
    return this.sessions.get(id)?.active ?? false;
  }

  isClosed(id: string): boolean {
    return !this.isActive(id);
  }

  reopen(id: string): boolean {
    const s = this.sessions.get(id);
    if (!s) return false;
    if (s.active) return false;
    s.active = true;
    s.endedAt = 0;
    return true;
  }

  getByUserId(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.active);
  }

  getClosedSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => !s.active);
  }

  getAllUserIds(): string[] {
    return [...new Set(Array.from(this.sessions.values()).map(s => s.userId))];
  }

  getUserCount(): number {
    return this.getAllUserIds().length;
  }

  getStartedAt(id: string): number {
    return this.sessions.get(id)?.startedAt ?? 0;
  }

  getEndedAt(id: string): number {
    return this.sessions.get(id)?.endedAt ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.sessions.get(id)?.updated ?? 0;
  }

  getDuration(id: string): number {
    const s = this.sessions.get(id);
    if (!s) return 0;
    const end = s.active ? Date.now() : s.endedAt;
    return end - s.startedAt;
  }

  getMostHit(): Session | null {
    const all = Array.from(this.sessions.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.hits > max.hits ? s : max);
  }

  getNewest(): Session | null {
    const all = Array.from(this.sessions.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.startedAt > max.startedAt ? s : max);
  }

  getOldest(): Session | null {
    const all = Array.from(this.sessions.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.startedAt < min.startedAt ? s : min);
  }

  getHits(id: string): number {
    return this.sessions.get(id)?.hits ?? 0;
  }

  clearAll(): void {
    this.sessions.clear();
    this.counter = 0;
  }
}

export default SessionManager;