/**
 * Reaction Engine
 * chatdev-design Reaction Engine - Add + Remove + GetByMessage + Stats
 */

export interface Reaction {
  id: string;
  messageId: string;
  emoji: string;
  user: string;
  count: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface RxeStats {
  reactions: number;
  totalCount: number;
  uniqueEmojis: number;
  uniqueUsers: number;
  uniqueMessages: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgCount: number;
  maxCount: number;
  minCount: number;
  avgEmojiLength: number;
}

export class ReactionEngine {
  private reactions: Map<string, Reaction> = new Map();
  private counter = 0;
  private totalCount = 0;

  add(messageId: string, user: string, emoji: string = '👍'): string {
    const id = `rxe-${++this.counter}`;
    this.reactions.set(id, {
      id,
      messageId,
      emoji,
      user,
      count: 1,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [1],
    });
    this.totalCount++;
    return id;
  }

  remove(id: string): boolean {
    return this.reactions.delete(id);
  }

  increment(id: string): boolean {
    const r = this.reactions.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.count++;
    r.history.push(r.count);
    r.updated = Date.now();
    r.hits++;
    this.totalCount++;
    return true;
  }

  decrement(id: string): boolean {
    const r = this.reactions.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (r.count <= 0) return false;
    r.count--;
    r.updated = Date.now();
    r.hits++;
    this.totalCount--;
    return true;
  }

  reset(id: string): boolean {
    const r = this.reactions.get(id);
    if (!r) return false;
    r.count = 0;
    r.history = [];
    r.updated = Date.now();
    return true;
  }

  getStats(): RxeStats {
    const all = Array.from(this.reactions.values());
    const countValues = all.map(r => r.count);
    const emojiLengths = all.map(r => r.emoji.length);
    return {
      reactions: all.length,
      totalCount: this.totalCount,
      uniqueEmojis: new Set(all.map(r => r.emoji)).size,
      uniqueUsers: new Set(all.map(r => r.user)).size,
      uniqueMessages: new Set(all.map(r => r.messageId)).size,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      avgCount: all.length > 0 ? Math.round((countValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxCount: countValues.length > 0 ? Math.max(...countValues) : 0,
      minCount: countValues.length > 0 ? Math.min(...countValues) : 0,
      avgEmojiLength: all.length > 0 ? Math.round((emojiLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getReaction(id: string): Reaction | undefined {
    return this.reactions.get(id);
  }

  getAllReactions(): Reaction[] {
    return Array.from(this.reactions.values());
  }

  removeReaction(id: string): boolean {
    return this.reactions.delete(id);
  }

  hasReaction(id: string): boolean {
    return this.reactions.has(id);
  }

  getCount(): number {
    return this.reactions.size;
  }

  getMessageId(id: string): string | undefined {
    return this.reactions.get(id)?.messageId;
  }

  getUser(id: string): string | undefined {
    return this.reactions.get(id)?.user;
  }

  getEmoji(id: string): string | undefined {
    return this.reactions.get(id)?.emoji;
  }

  getEmojiLength(id: string): number {
    return this.reactions.get(id)?.emoji.length ?? 0;
  }

  getReactionCount(id: string): number {
    return this.reactions.get(id)?.count ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.reactions.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.reactions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.reactions.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.reactions.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setEmoji(id: string, emoji: string): boolean {
    const r = this.reactions.get(id);
    if (!r) return false;
    r.emoji = emoji;
    r.updated = Date.now();
    return true;
  }

  setUser(id: string, user: string): boolean {
    const r = this.reactions.get(id);
    if (!r) return false;
    r.user = user;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.reactions.values()) {
      r.count = 0;
      r.hits = 0;
      r.history = [];
      r.active = true;
    }
    this.totalCount = 0;
  }

  getByMessage(messageId: string): Reaction[] {
    return Array.from(this.reactions.values()).filter(r => r.messageId === messageId);
  }

  getByUser(user: string): Reaction[] {
    return Array.from(this.reactions.values()).filter(r => r.user === user);
  }

  getByEmoji(emoji: string): Reaction[] {
    return Array.from(this.reactions.values()).filter(r => r.emoji === emoji);
  }

  getActiveReactions(): Reaction[] {
    return Array.from(this.reactions.values()).filter(r => r.active);
  }

  getInactiveReactions(): Reaction[] {
    return Array.from(this.reactions.values()).filter(r => !r.active);
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.reactions.values()).map(r => r.user))];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  getAllEmojis(): string[] {
    return [...new Set(Array.from(this.reactions.values()).map(r => r.emoji))];
  }

  getEmojiCount(): number {
    return this.getAllEmojis().length;
  }

  getAllMessages(): string[] {
    return [...new Set(Array.from(this.reactions.values()).map(r => r.messageId))];
  }

  getMessageCount(): number {
    return this.getAllMessages().length;
  }

  getByMinCount(min: number): Reaction[] {
    return Array.from(this.reactions.values()).filter(r => r.count >= min);
  }

  getMostCount(): Reaction | null {
    const all = Array.from(this.reactions.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.count > max.count ? r : max);
  }

  getNewest(): Reaction | null {
    const all = Array.from(this.reactions.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Reaction | null {
    const all = Array.from(this.reactions.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.reactions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.reactions.get(id)?.updated ?? 0;
  }

  getTotalCount(): number {
    return this.totalCount;
  }

  clearAll(): void {
    this.reactions.clear();
    this.counter = 0;
    this.totalCount = 0;
  }
}

export default ReactionEngine;