/**
 * Message Broker
 * chatdev-design Message Broker - Publish + Subscribe + Route + Track
 */

export interface Message {
  id: string;
  topic: string;
  payload: unknown;
  timestamp: number;
}

export interface Subscription {
  id: string;
  topic: string;
  callback: (msg: Message) => void;
}

export interface BrokerStats {
  messages: number;
  subscriptions: number;
  topics: number;
}

export class MessageBroker {
  private messages: Map<string, Message> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private topicIndex: Map<string, Set<string>> = new Map();
  private messageCounter = 0;
  private subscriptionCounter = 0;

  publish(topic: string, payload: unknown): string {
    const id = `msg-${++this.messageCounter}`;
    const message: Message = { id, topic, payload, timestamp: Date.now() };
    this.messages.set(id, message);
    // Notify subscribers
    const subs = this.topicIndex.get(topic);
    if (subs) {
      for (const subId of subs) {
        const sub = this.subscriptions.get(subId);
        if (sub) {
          try { sub.callback(message); } catch { /* ignore */ }
        }
      }
    }
    return id;
  }

  subscribe(topic: string, callback: (msg: Message) => void): string {
    const id = `sub-${++this.subscriptionCounter}`;
    this.subscriptions.set(id, { id, topic, callback });
    if (!this.topicIndex.has(topic)) this.topicIndex.set(topic, new Set());
    this.topicIndex.get(topic)!.add(id);
    return id;
  }

  unsubscribe(subscriptionId: string): boolean {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) return false;
    this.topicIndex.get(sub.topic)?.delete(subscriptionId);
    return this.subscriptions.delete(subscriptionId);
  }

  getStats(): BrokerStats {
    return {
      messages: this.messages.size,
      subscriptions: this.subscriptions.size,
      topics: this.topicIndex.size,
    };
  }

  getMessage(id: string): Message | undefined {
    return this.messages.get(id);
  }

  getAllMessages(): Message[] {
    return Array.from(this.messages.values());
  }

  getMessagesByTopic(topic: string): Message[] {
    return Array.from(this.messages.values()).filter(m => m.topic === topic);
  }

  removeMessage(id: string): boolean {
    return this.messages.delete(id);
  }

  getSubscription(id: string): Subscription | undefined {
    return this.subscriptions.get(id);
  }

  getAllSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  getSubscriptionsByTopic(topic: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(s => s.topic === topic);
  }

  getTopics(): string[] {
    return [...this.topicIndex.keys()];
  }

  hasTopic(topic: string): boolean {
    return this.topicIndex.has(topic);
  }

  getMessageCount(): number {
    return this.messages.size;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getTopicCount(): number {
    return this.topicIndex.size;
  }

  hasSubscription(id: string): boolean {
    return this.subscriptions.has(id);
  }

  hasMessage(id: string): boolean {
    return this.messages.has(id);
  }

  clearAllMessages(): void {
    this.messages.clear();
  }

  clearAllSubscriptions(): void {
    this.subscriptions.clear();
    this.topicIndex.clear();
  }

  clearAll(): void {
    this.messages.clear();
    this.subscriptions.clear();
    this.topicIndex.clear();
    this.messageCounter = 0;
    this.subscriptionCounter = 0;
  }
}

export default MessageBroker;