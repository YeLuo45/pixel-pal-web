/**
 * Mention Engine
 * chatdev-design Mention Engine - Mention + Read + Unread + GetByUser + Stats
 */

export interface Mention {
  id: string;
  from: string;
  to: string;
  message: string;
  read: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface MneStats {
  mentions: number;
  read: number;
  unread: number;
  totalMessages: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueFrom: number;
  uniqueTo: number;
  uniqueUsers: number;
  avgMessageLength: number;
  maxMessageLength: number;
  minMessageLength: number;
  readRate: number;
}

export class MentionEngine {
  private mentions: Map<string, Mention> = new Map();
  private counter = 0;
  private totalMessages = 0;

  mention(from: string, to: string, message: string): string {
    const id = `mne-${++this.counter}`;
    this.mentions.set(id, {
      id,
      from,
      to,
      message,
      read: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    this.totalMessages++;
    return id;
  }

  read(id: string): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    if (m.read) return false;
    m.read = true;
    m.updated = Date.now();
    m.hits++;
    return true;
  }

  unread(id: string): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    if (!m.read) return false;
    m.read = false;
    m.updated = Date.now();
    m.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.mentions.delete(id);
  }

  resetAll(): void {
    for (const m of this.mentions.values()) {
      m.read = false;
      m.hits = 0;
      m.history = [];
      m.active = true;
    }
    this.totalMessages = 0;
  }

  getStats(): MneStats {
    const all = Array.from(this.mentions.values());
    const msgLengths = all.map(m => m.message.length);
    return {
      mentions: all.length,
      read: all.filter(m => m.read).length,
      unread: all.filter(m => !m.read).length,
      totalMessages: this.totalMessages,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueFrom: new Set(all.map(m => m.from)).size,
      uniqueTo: new Set(all.map(m => m.to)).size,
      uniqueUsers: new Set([...all.map(m => m.from), ...all.map(m => m.to)]).size,
      avgMessageLength: all.length > 0 ? Math.round((msgLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMessageLength: msgLengths.length > 0 ? Math.max(...msgLengths) : 0,
      minMessageLength: msgLengths.length > 0 ? Math.min(...msgLengths) : 0,
      readRate: all.length > 0 ? Math.round((all.filter(m => m.read).length / all.length) * 100) / 100 : 0,
    };
  }

  getMention(id: string): Mention | undefined {
    return this.mentions.get(id);
  }

  getAllMentions(): Mention[] {
    return Array.from(this.mentions.values());
  }

  hasMention(id: string): boolean {
    return this.mentions.has(id);
  }

  getCount(): number {
    return this.mentions.size;
  }

  getFrom(id: string): string | undefined {
    return this.mentions.get(id)?.from;
  }

  getTo(id: string): string | undefined {
    return this.mentions.get(id)?.to;
  }

  getMessage(id: string): string | undefined {
    return this.mentions.get(id)?.message;
  }

  getMessageLength(id: string): number {
    return this.mentions.get(id)?.message.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.mentions.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.mentions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.mentions.get(id)?.active ?? false;
  }

  isRead(id: string): boolean {
    return this.mentions.get(id)?.read ?? false;
  }

  isUnread(id: string): boolean {
    const m = this.mentions.get(id);
    return m ? !m.read : false;
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setMessage(id: string, message: string): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    m.message = message;
    m.updated = Date.now();
    return true;
  }

  getByUser(user: string): Mention[] {
    return Array.from(this.mentions.values()).filter(m => m.to === user || m.from === user);
  }

  getByFrom(from: string): Mention[] {
    return Array.from(this.mentions.values()).filter(m => m.from === from);
  }

  getByTo(to: string): Mention[] {
    return Array.from(this.mentions.values()).filter(m => m.to === to);
  }

  getReadMentions(): Mention[] {
    return Array.from(this.mentions.values()).filter(m => m.read);
  }

  getUnreadMentions(): Mention[] {
    return Array.from(this.mentions.values()).filter(m => !m.read);
  }

  getActiveMentions(): Mention[] {
    return Array.from(this.mentions.values()).filter(m => m.active);
  }

  getInactiveMentions(): Mention[] {
    return Array.from(this.mentions.values()).filter(m => !m.active);
  }

  getAllUsers(): string[] {
    const users = new Set<string>();
    for (const m of this.mentions.values()) {
      users.add(m.from);
      users.add(m.to);
    }
    return [...users];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  getNewest(): Mention | null {
    const all = Array.from(this.mentions.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): Mention | null {
    const all = Array.from(this.mentions.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.mentions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.mentions.get(id)?.updated ?? 0;
  }

  getTotalMessages(): number {
    return this.totalMessages;
  }

  clearAll(): void {
    this.mentions.clear();
    this.counter = 0;
    this.totalMessages = 0;
  }
}

export default MentionEngine;