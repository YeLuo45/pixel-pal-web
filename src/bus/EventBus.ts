/**
 * Event Bus
 * thunderbolt-design Event Bus - Subscribe + Publish + Stats
 */

export type EventHandler = (data: unknown) => void;

export interface Subscription {
  id: string;
  topic: string;
  handler: EventHandler;
  hits: number;
  created: number;
  active: boolean;
}

export interface BusStats {
  subscriptions: number;
  topics: number;
  published: number;
  totalHits: number;
}

export class EventBus {
  private subscriptions: Map<string, Subscription> = new Map();
  private counter = 0;
  private published = 0;

  subscribe(topic: string, handler: EventHandler): string {
    const id = `sub-${++this.counter}`;
    this.subscriptions.set(id, {
      id,
      topic,
      handler,
      hits: 0,
      created: Date.now(),
      active: true,
    });
    return id;
  }

  publish(topic: string, data: unknown): number {
    this.published++;
    let count = 0;
    for (const s of this.subscriptions.values()) {
      if (s.topic === topic && s.active) {
        s.handler(data);
        s.hits++;
        count++;
      }
    }
    return count;
  }

  getStats(): BusStats {
    const all = Array.from(this.subscriptions.values());
    return {
      subscriptions: all.length,
      topics: new Set(all.map(s => s.topic)).size,
      published: this.published,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
    };
  }

  getSubscription(id: string): Subscription | undefined {
    return this.subscriptions.get(id);
  }

  getAllSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  removeSubscription(id: string): boolean {
    return this.subscriptions.delete(id);
  }

  hasSubscription(id: string): boolean {
    return this.subscriptions.has(id);
  }

  getCount(): number {
    return this.subscriptions.size;
  }

  getTopic(id: string): string | undefined {
    return this.subscriptions.get(id)?.topic;
  }

  getHits(id: string): number {
    return this.subscriptions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.subscriptions.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.subscriptions.get(id);
    if (!s) return false;
    s.active = active;
    return true;
  }

  unsubscribe(id: string): boolean {
    return this.removeSubscription(id);
  }

  getByTopic(topic: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(s => s.topic === topic);
  }

  getActiveSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(s => s.active);
  }

  getInactiveSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(s => !s.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.subscriptions.values()).map(s => s.topic))];
  }

  getTopicCount(): number {
    return this.getAllTopics().length;
  }

  getSubscriptionsForTopic(topic: string): number {
    return this.getByTopic(topic).length;
  }

  getPublishedCount(): number {
    return this.published;
  }

  getCreatedAt(id: string): number {
    return this.subscriptions.get(id)?.created ?? 0;
  }

  resetHits(): void {
    for (const s of this.subscriptions.values()) s.hits = 0;
  }

  resetPublished(): void {
    this.published = 0;
  }

  resetAll(): void {
    for (const s of this.subscriptions.values()) s.hits = 0;
    this.published = 0;
  }

  getMostHit(): Subscription | null {
    const all = Array.from(this.subscriptions.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.hits > max.hits ? s : max);
  }

  getNewest(): Subscription | null {
    const all = Array.from(this.subscriptions.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Subscription | null {
    const all = Array.from(this.subscriptions.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  clearAll(): void {
    this.subscriptions.clear();
    this.counter = 0;
    this.published = 0;
  }
}

export default EventBus;