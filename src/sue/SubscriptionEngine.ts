/**
 * Subscription Engine
 * nanobot-design Subscription Engine - Subscribe + Notify + Unsubscribe + Stats
 */

export interface Subscription {
  id: string;
  topic: string;
  subscriber: string;
  delivered: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SueStats {
  subscriptions: number;
  totalDelivered: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTopics: number;
  uniqueSubscribers: number;
  totalDelivered2: number;
  avgDelivered: number;
  maxDelivered: number;
  minDelivered: number;
}

export class SubscriptionEngine {
  private subs: Map<string, Subscription> = new Map();
  private counter = 0;
  private totalDelivered = 0;

  subscribe(topic: string, subscriber: string): string {
    const id = `sue-${++this.counter}`;
    this.subs.set(id, {
      id,
      topic,
      subscriber,
      delivered: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  notify(topic: string): number {
    let count = 0;
    for (const s of this.subs.values()) {
      if (s.topic === topic && s.active) {
        s.delivered++;
        s.updated = Date.now();
        s.hits++;
        count++;
        this.totalDelivered++;
      }
    }
    return count;
  }

  unsubscribe(id: string): boolean {
    const s = this.subs.get(id);
    if (!s) return false;
    s.active = false;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.subs.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.subs.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setTopic(id: string, topic: string): boolean {
    const s = this.subs.get(id);
    if (!s) return false;
    s.topic = topic;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.subs.values()) {
      s.delivered = 0;
      s.active = true;
      s.hits = 0;
    }
    this.totalDelivered = 0;
  }

  getStats(): SueStats {
    const all = Array.from(this.subs.values());
    const deliveredArr = all.map(s => s.delivered);
    return {
      subscriptions: all.length,
      totalDelivered: this.totalDelivered,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueTopics: new Set(all.map(s => s.topic)).size,
      uniqueSubscribers: new Set(all.map(s => s.subscriber)).size,
      totalDelivered2: all.reduce((s2, x) => s2 + x.delivered, 0),
      avgDelivered: all.length > 0 ? Math.round((deliveredArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxDelivered: deliveredArr.length > 0 ? Math.max(...deliveredArr) : 0,
      minDelivered: deliveredArr.length > 0 ? Math.min(...deliveredArr) : 0,
    };
  }

  getSub(id: string): Subscription | undefined {
    return this.subs.get(id);
  }

  getAllSubs(): Subscription[] {
    return Array.from(this.subs.values());
  }

  hasSub(id: string): boolean {
    return this.subs.has(id);
  }

  getCount(): number {
    return this.subs.size;
  }

  getTopic(id: string): string | undefined {
    return this.subs.get(id)?.topic;
  }

  getSubscriber(id: string): string | undefined {
    return this.subs.get(id)?.subscriber;
  }

  getDelivered(id: string): number {
    return this.subs.get(id)?.delivered ?? 0;
  }

  getHits(id: string): number {
    return this.subs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.subs.get(id)?.active ?? false;
  }

  getByTopic(topic: string): Subscription[] {
    return Array.from(this.subs.values()).filter(s => s.topic === topic);
  }

  getBySubscriber(subscriber: string): Subscription[] {
    return Array.from(this.subs.values()).filter(s => s.subscriber === subscriber);
  }

  getActiveSubs(): Subscription[] {
    return Array.from(this.subs.values()).filter(s => s.active);
  }

  getInactiveSubs(): Subscription[] {
    return Array.from(this.subs.values()).filter(s => !s.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.subs.values()).map(s => s.topic))];
  }

  getAllSubscribers(): string[] {
    return [...new Set(Array.from(this.subs.values()).map(s => s.subscriber))];
  }

  getNewest(): Subscription | null {
    const all = Array.from(this.subs.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Subscription | null {
    const all = Array.from(this.subs.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.subs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.subs.get(id)?.updated ?? 0;
  }

  getTotalDelivered(): number {
    return this.totalDelivered;
  }

  clearAll(): void {
    this.subs.clear();
    this.counter = 0;
    this.totalDelivered = 0;
  }
}

export default SubscriptionEngine;