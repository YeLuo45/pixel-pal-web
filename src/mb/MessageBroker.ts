/**
 * Message Broker
 * chatdev-design Message Broker - Subscribe + Publish + Unsubscribe + Stats
 */

export interface Subscriber {
  id: string;
  topic: string;
  handler: string;
  created: number;
  active: boolean;
  hits: number;
}

export interface BrokerMessage {
  id: string;
  topic: string;
  payload: unknown;
  delivered: number;
  created: number;
}

export interface MBStats {
  subscribers: number;
  messages: number;
  totalDelivered: number;
  totalHits: number;
  active: number;
  inactive: number;
  topics: number;
  avgDelivered: number;
}

export class MessageBroker {
  private subscribers: Map<string, Subscriber> = new Map();
  private messages: Map<string, BrokerMessage> = new Map();
  private subCounter = 0;
  private msgCounter = 0;
  private totalDelivered = 0;

  subscribe(topic: string, handler: string): string {
    const id = `mb-s-${++this.subCounter}`;
    this.subscribers.set(id, {
      id,
      topic,
      handler,
      created: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  publish(topic: string, payload: unknown): string {
    const id = `mb-m-${++this.msgCounter}`;
    let delivered = 0;
    for (const s of this.subscribers.values()) {
      if (s.active && s.topic === topic) {
        s.hits++;
        delivered++;
        this.totalDelivered++;
      }
    }
    this.messages.set(id, {
      id,
      topic,
      payload,
      delivered,
      created: Date.now(),
    });
    return id;
  }

  unsubscribe(id: string): boolean {
    const s = this.subscribers.get(id);
    if (!s) return false;
    s.active = false;
    return true;
  }

  resubscribe(id: string): boolean {
    const s = this.subscribers.get(id);
    if (!s) return false;
    s.active = true;
    return true;
  }

  getStats(): MBStats {
    const allSubs = Array.from(this.subscribers.values());
    const allMsgs = Array.from(this.messages.values());
    return {
      subscribers: allSubs.length,
      messages: allMsgs.length,
      totalDelivered: this.totalDelivered,
      totalHits: allSubs.reduce((s, x) => s + x.hits, 0),
      active: allSubs.filter(s => s.active).length,
      inactive: allSubs.filter(s => !s.active).length,
      topics: new Set(allSubs.map(s => s.topic)).size,
      avgDelivered: allMsgs.length > 0 ? Math.round((allMsgs.reduce((s, m) => s + m.delivered, 0) / allMsgs.length) * 100) / 100 : 0,
    };
  }

  getSubscriber(id: string): Subscriber | undefined {
    return this.subscribers.get(id);
  }

  getMessage(id: string): BrokerMessage | undefined {
    return this.messages.get(id);
  }

  getAllSubscribers(): Subscriber[] {
    return Array.from(this.subscribers.values());
  }

  getAllMessages(): BrokerMessage[] {
    return Array.from(this.messages.values());
  }

  removeSubscriber(id: string): boolean {
    return this.subscribers.delete(id);
  }

  removeMessage(id: string): boolean {
    return this.messages.delete(id);
  }

  hasSubscriber(id: string): boolean {
    return this.subscribers.has(id);
  }

  hasMessage(id: string): boolean {
    return this.messages.has(id);
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  getMessageCount(): number {
    return this.messages.size;
  }

  getTopic(id: string): string | undefined {
    return this.subscribers.get(id)?.topic ?? this.messages.get(id)?.topic;
  }

  getHandler(id: string): string | undefined {
    return this.subscribers.get(id)?.handler;
  }

  getPayload(id: string): unknown {
    return this.messages.get(id)?.payload;
  }

  getDelivered(id: string): number {
    return this.messages.get(id)?.delivered ?? 0;
  }

  getHits(id: string): number {
    return this.subscribers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.subscribers.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.subscribers.get(id);
    if (!s) return false;
    s.active = active;
    return true;
  }

  setTopic(id: string, topic: string): boolean {
    const s = this.subscribers.get(id);
    if (!s) return false;
    s.topic = topic;
    return true;
  }

  setHandler(id: string, handler: string): boolean {
    const s = this.subscribers.get(id);
    if (!s) return false;
    s.handler = handler;
    return true;
  }

  resetAll(): void {
    for (const s of this.subscribers.values()) {
      s.hits = 0;
      s.active = true;
    }
    this.messages.clear();
    this.msgCounter = 0;
    this.totalDelivered = 0;
  }

  getByTopic(topic: string): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => s.topic === topic);
  }

  getMessagesByTopic(topic: string): BrokerMessage[] {
    return Array.from(this.messages.values()).filter(m => m.topic === topic);
  }

  getActiveSubscribers(): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => s.active);
  }

  getInactiveSubscribers(): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => !s.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.subscribers.values()).map(s => s.topic))];
  }

  getTopicCount(): number {
    return this.getAllTopics().length;
  }

  getAllHandlers(): string[] {
    return [...new Set(Array.from(this.subscribers.values()).map(s => s.handler))];
  }

  getHandlerCount(): number {
    return this.getAllHandlers().length;
  }

  getByMinHits(min: number): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => s.hits >= min);
  }

  getMostHits(): Subscriber | null {
    const all = Array.from(this.subscribers.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.hits > max.hits ? s : max);
  }

  getNewest(): Subscriber | null {
    const all = Array.from(this.subscribers.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Subscriber | null {
    const all = Array.from(this.subscribers.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.subscribers.get(id)?.created ?? this.messages.get(id)?.created ?? 0;
  }

  getTotalDelivered(): number {
    return this.totalDelivered;
  }

  clearAll(): void {
    this.subscribers.clear();
    this.messages.clear();
    this.subCounter = 0;
    this.msgCounter = 0;
    this.totalDelivered = 0;
  }
}

export default MessageBroker;