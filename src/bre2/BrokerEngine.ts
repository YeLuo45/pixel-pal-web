/**
 * Broker Engine
 * nanobot-design Broker Engine - Publish + Subscribe + Route + Stats
 */

export type BrokerMode = 'direct' | 'fanout' | 'topic';

export interface BrokerMessage {
  id: string;
  topic: string;
  sender: string;
  payload: string;
  mode: BrokerMode;
  delivered: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Bre2Stats {
  messages: number;
  totalPublished: number;
  totalSubscribed: number;
  totalRouted: number;
  direct: number;
  fanout: number;
  topic: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTopics: number;
  uniqueSenders: number;
  totalDelivered: number;
  totalPayloadLen: number;
  avgPayloadLen: number;
  maxPayloadLen: number;
  minPayloadLen: number;
}

export class BrokerEngine {
  private messages: Map<string, BrokerMessage> = new Map();
  private subscribers: Map<string, Set<string>> = new Map();
  private counter = 0;
  private totalPublished = 0;
  private totalSubscribed = 0;
  private totalRouted = 0;
  private totalDelivered = 0;
  private totalPayloadLen = 0;

  publish(topic: string, sender: string, payload: string, mode: BrokerMode = 'topic'): string {
    const id = `bre2-${++this.counter}`;
    this.messages.set(id, {
      id,
      topic,
      sender,
      payload,
      mode,
      delivered: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalPublished++;
    this.totalPayloadLen += payload.length;
    return id;
  }

  subscribe(topic: string, subscriber: string): boolean {
    let set = this.subscribers.get(topic);
    if (!set) {
      set = new Set();
      this.subscribers.set(topic, set);
    }
    if (set.has(subscriber)) return false;
    set.add(subscriber);
    this.totalSubscribed++;
    return true;
  }

  unsubscribe(topic: string, subscriber: string): boolean {
    const set = this.subscribers.get(topic);
    if (!set) return false;
    const removed = set.delete(subscriber);
    if (removed) this.totalSubscribed = Math.max(0, this.totalSubscribed - 1);
    return removed;
  }

  route(id: string): number {
    const m = this.messages.get(id);
    if (!m) return 0;
    if (!m.active) return 0;
    const set = this.subscribers.get(m.topic);
    if (!set) return 0;
    let count = 0;
    if (m.mode === 'fanout') {
      count = set.size;
    } else {
      count = 1;
    }
    m.delivered += count;
    m.updated = Date.now();
    m.hits++;
    this.totalRouted++;
    this.totalDelivered += count;
    return count;
  }

  remove(id: string): boolean {
    return this.messages.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setTopic(id: string, topic: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.topic = topic;
    m.updated = Date.now();
    return true;
  }

  setSender(id: string, sender: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.sender = sender;
    m.updated = Date.now();
    return true;
  }

  setPayload(id: string, payload: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.payload = payload;
    m.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: BrokerMode): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.mode = mode;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.messages.values()) {
      m.delivered = 0;
      m.active = true;
      m.hits = 0;
    }
    this.subscribers.clear();
    this.totalPublished = 0;
    this.totalSubscribed = 0;
    this.totalRouted = 0;
    this.totalDelivered = 0;
    this.totalPayloadLen = 0;
  }

  getStats(): Bre2Stats {
    const all = Array.from(this.messages.values());
    const lenArr = all.map(m => m.payload.length);
    return {
      messages: all.length,
      totalPublished: this.totalPublished,
      totalSubscribed: this.totalSubscribed,
      totalRouted: this.totalRouted,
      direct: all.filter(m => m.mode === 'direct').length,
      fanout: all.filter(m => m.mode === 'fanout').length,
      topic: all.filter(m => m.mode === 'topic').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueTopics: new Set(all.map(m => m.topic)).size,
      uniqueSenders: new Set(all.map(m => m.sender)).size,
      totalDelivered: this.totalDelivered,
      totalPayloadLen: this.totalPayloadLen,
      avgPayloadLen: all.length > 0 ? Math.round((lenArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPayloadLen: lenArr.length > 0 ? Math.max(...lenArr) : 0,
      minPayloadLen: lenArr.length > 0 ? Math.min(...lenArr) : 0,
    };
  }

  getMessage(id: string): BrokerMessage | undefined {
    return this.messages.get(id);
  }

  getAllMessages(): BrokerMessage[] {
    return Array.from(this.messages.values());
  }

  hasMessage(id: string): boolean {
    return this.messages.has(id);
  }

  getCount(): number {
    return this.messages.size;
  }

  getTopic(id: string): string | undefined {
    return this.messages.get(id)?.topic;
  }

  getSender(id: string): string | undefined {
    return this.messages.get(id)?.sender;
  }

  getPayload(id: string): string | undefined {
    return this.messages.get(id)?.payload;
  }

  getMode(id: string): BrokerMode | undefined {
    return this.messages.get(id)?.mode;
  }

  getDelivered(id: string): number {
    return this.messages.get(id)?.delivered ?? 0;
  }

  getHits(id: string): number {
    return this.messages.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.messages.get(id)?.active ?? false;
  }

  isDirect(id: string): boolean {
    return this.messages.get(id)?.mode === 'direct';
  }

  isFanout(id: string): boolean {
    return this.messages.get(id)?.mode === 'fanout';
  }

  isTopic(id: string): boolean {
    return this.messages.get(id)?.mode === 'topic';
  }

  getSubscribers(topic: string): string[] {
    return Array.from(this.subscribers.get(topic) ?? []);
  }

  hasSubscriber(topic: string, subscriber: string): boolean {
    return this.subscribers.get(topic)?.has(subscriber) ?? false;
  }

  getByMode(mode: BrokerMode): BrokerMessage[] {
    return Array.from(this.messages.values()).filter(m => m.mode === mode);
  }

  getActiveMessages(): BrokerMessage[] {
    return Array.from(this.messages.values()).filter(m => m.active);
  }

  getInactiveMessages(): BrokerMessage[] {
    return Array.from(this.messages.values()).filter(m => !m.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.messages.values()).map(m => m.topic))];
  }

  getAllSubscribedTopics(): string[] {
    return Array.from(this.subscribers.keys());
  }

  getNewest(): BrokerMessage | null {
    const all = Array.from(this.messages.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): BrokerMessage | null {
    const all = Array.from(this.messages.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.messages.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.messages.get(id)?.updated ?? 0;
  }

  getTotalPublished(): number {
    return this.totalPublished;
  }

  getTotalSubscribed(): number {
    return this.totalSubscribed;
  }

  getTotalRouted(): number {
    return this.totalRouted;
  }

  clearAll(): void {
    this.messages.clear();
    this.subscribers.clear();
    this.counter = 0;
    this.totalPublished = 0;
    this.totalSubscribed = 0;
    this.totalRouted = 0;
    this.totalDelivered = 0;
    this.totalPayloadLen = 0;
  }
}

export default BrokerEngine;