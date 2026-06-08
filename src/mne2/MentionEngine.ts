/**
 * Mention Engine
 * chatdev-design Mention Engine - Add + Mention + Remove + Stats
 */

export type MentionContext = 'comment' | 'post' | 'reply' | 'thread' | 'bio';

export interface MentionEntry {
  id: string;
  user: string;
  context: MentionContext;
  count: number;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface MneStats {
  mentions: number;
  totalAdded: number;
  totalMentionedTotal: number;
  comment: number;
  post: number;
  reply: number;
  thread: number;
  bio: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueUsers: number;
  totalMentionedSum: number;
  maxMentioned: number;
  avgMentioned: number;
}

export class MentionEngine {
  private mentions: Map<string, MentionEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalMentioned = 0;

  add(user: string, context: MentionContext = 'comment'): string {
    const id = `mne-${++this.counter}`;
    this.mentions.set(id, {
      id,
      user,
      context,
      count: 0,
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    return id;
  }

  mention(id: string): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    if (!m.active) return false;
    m.count++;
    m.updated = Date.now();
    m.hits++;
    this.totalMentioned++;
    return true;
  }

  remove(id: string): boolean {
    return this.mentions.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setUser(id: string, user: string): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    m.user = user;
    m.updated = Date.now();
    return true;
  }

  setContext(id: string, context: MentionContext): boolean {
    const m = this.mentions.get(id);
    if (!m) return false;
    m.context = context;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.mentions.values()) {
      m.count = 0;
      m.active = true;
      m.hits = 0;
    }
    this.totalAdded = 0;
    this.totalMentioned = 0;
  }

  getStats(): MneStats {
    const all = Array.from(this.mentions.values());
    const cArr = all.map(m => m.count);
    return {
      mentions: all.length,
      totalAdded: this.totalAdded,
      totalMentioned: this.totalMentioned,
      comment: all.filter(m => m.context === 'comment').length,
      post: all.filter(m => m.context === 'post').length,
      reply: all.filter(m => m.context === 'reply').length,
      thread: all.filter(m => m.context === 'thread').length,
      bio: all.filter(m => m.context === 'bio').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueUsers: new Set(all.map(m => m.user)).size,
      totalMentionedSum: all.reduce((s, m) => s + m.count, 0),
      maxMentioned: cArr.length > 0 ? Math.max(...cArr) : 0,
      avgMentioned: all.length > 0 ? Math.round((cArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getMention(id: string): MentionEntry | undefined {
    return this.mentions.get(id);
  }

  getAllMentions(): MentionEntry[] {
    return Array.from(this.mentions.values());
  }

  hasMention(id: string): boolean {
    return this.mentions.has(id);
  }

  getCount(): number {
    return this.mentions.size;
  }

  getUser(id: string): string | undefined {
    return this.mentions.get(id)?.user;
  }

  getContext(id: string): MentionContext | undefined {
    return this.mentions.get(id)?.context;
  }

  getMentionedCount(id: string): number {
    return this.mentions.get(id)?.count ?? 0;
  }

  getHits(id: string): number {
    return this.mentions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.mentions.get(id)?.active ?? false;
  }

  isComment(id: string): boolean {
    return this.mentions.get(id)?.context === 'comment';
  }

  isPost(id: string): boolean {
    return this.mentions.get(id)?.context === 'post';
  }

  isReply(id: string): boolean {
    return this.mentions.get(id)?.context === 'reply';
  }

  isThread(id: string): boolean {
    return this.mentions.get(id)?.context === 'thread';
  }

  isBio(id: string): boolean {
    return this.mentions.get(id)?.context === 'bio';
  }

  getByContext(context: MentionContext): MentionEntry[] {
    return Array.from(this.mentions.values()).filter(m => m.context === context);
  }

  getActiveMentions(): MentionEntry[] {
    return Array.from(this.mentions.values()).filter(m => m.active);
  }

  getInactiveMentions(): MentionEntry[] {
    return Array.from(this.mentions.values()).filter(m => !m.active);
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.mentions.values()).map(m => m.user))];
  }

  getNewest(): MentionEntry | null {
    const all = Array.from(this.mentions.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): MentionEntry | null {
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalMentioned(): number {
    return this.totalMentioned;
  }

  clearAll(): void {
    this.mentions.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalMentioned = 0;
  }
}

export default MentionEngine;