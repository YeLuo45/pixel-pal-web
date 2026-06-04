/**
 * Agent Communication Bus v2
 * chatdev Agent Communication Bus v2 - Message Queue + Event-Driven Pub/Sub
 */

export type MessagePriority = 'high' | 'normal' | 'low';
export type MessageStatus = 'pending' | 'delivered' | 'failed';

export interface AgentMessage {
  id: string;
  from: string;
  to: string | '*';
  topic: string;
  payload: unknown;
  priority: MessagePriority;
  timestamp: number;
  status: MessageStatus;
  retries: number;
}

export interface Subscriber {
  agentId: string;
  topics: string[];
  callback: (msg: AgentMessage) => void;
}

let messageCounter = 0;

function generateMessageId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

export class AgentCommBus {
  private messages: Map<string, AgentMessage> = new Map();
  private subscribers: Map<string, Subscriber[]> = new Map();
  private topicIndex: Map<string, Set<string>> = new Map(); // topic -> messageIds

  /**
   * Publish a message to the bus
   */
  publish(msg: Omit<AgentMessage, 'id' | 'timestamp' | 'status' | 'retries'>): string {
    const id = generateMessageId();
    const fullMsg: AgentMessage = {
      ...msg,
      id,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
    };

    this.messages.set(id, fullMsg);

    // Index by topic
    if (!this.topicIndex.has(msg.topic)) {
      this.topicIndex.set(msg.topic, new Set());
    }
    this.topicIndex.get(msg.topic)!.add(id);

    // Index by recipient for 'to' queries
    const recipient = msg.to === '*' ? 'broadcast' : msg.to;
    if (!this.subscribers.has(recipient)) {
      this.subscribers.set(recipient, []);
    }

    // Deliver to matching subscribers immediately
    this.deliverToSubscribers(fullMsg);

    return id;
  }

  /**
   * Subscribe to topics
   */
  subscribe(subscriber: Subscriber): void {
    const { agentId, topics, callback } = subscriber;

    for (const topic of topics) {
      if (!this.subscribers.has(topic)) {
        this.subscribers.set(topic, []);
      }

      const existing = this.subscribers.get(topic)!.find(s => s.agentId === agentId);
      if (!existing) {
        this.subscribers.get(topic)!.push({ agentId, topics, callback });
      }
    }
  }

  /**
   * Unsubscribe an agent
   */
  unsubscribe(agentId: string): void {
    for (const [topic, subs] of this.subscribers) {
      const idx = subs.findIndex(s => s.agentId === agentId);
      if (idx !== -1) {
        subs.splice(idx, 1);
      }
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(topic?: string): number {
    if (topic) {
      return this.topicIndex.get(topic)?.size ?? 0;
    }
    return this.messages.size;
  }

  /**
   * Get messages for an agent
   */
  getMessages(agentId: string): AgentMessage[] {
    const result: AgentMessage[] = [];
    for (const msg of this.messages.values()) {
      if (msg.to === '*' || msg.to === agentId) {
        result.push(msg);
      }
    }
    return result;
  }

  /**
   * Retry a failed message
   */
  retry(messageId: string): boolean {
    const msg = this.messages.get(messageId);
    if (!msg) return false;

    msg.retries++;
    msg.status = 'pending';

    this.deliverToSubscribers(msg);
    return true;
  }

  /**
   * Clear messages
   */
  clear(agentId?: string): void {
    if (!agentId) {
      this.messages.clear();
      this.topicIndex.clear();
      return;
    }

    // Clear only for specific agent
    for (const [id, msg] of this.messages) {
      if (msg.to === agentId || msg.from === agentId) {
        this.messages.delete(id);
        const topicSet = this.topicIndex.get(msg.topic);
        if (topicSet) {
          topicSet.delete(id);
        }
      }
    }
  }

  /**
   * Get message by ID
   */
  getMessage(messageId: string): AgentMessage | null {
    return this.messages.get(messageId) ?? null;
  }

  /**
   * Update message status
   */
  updateStatus(messageId: string, status: MessageStatus): boolean {
    const msg = this.messages.get(messageId);
    if (!msg) return false;
    msg.status = status;
    return true;
  }

  /**
   * Deliver message to all matching subscribers
   */
  private deliverToSubscribers(msg: AgentMessage): void {
    const topicSubs = this.subscribers.get(msg.topic) ?? [];
    const agentSubs = this.subscribers.get(msg.to) ?? [];
    const broadcastSubs = this.subscribers.get('broadcast') ?? [];

    const allSubs = [...topicSubs, ...agentSubs, ...broadcastSubs];
    const dedup = new Map<string, Subscriber>();
    for (const sub of allSubs) {
      dedup.set(sub.agentId, sub);
    }

    for (const sub of dedup.values()) {
      try {
        sub.callback(msg);
        const m = this.messages.get(msg.id);
        if (m) m.status = 'delivered';
      } catch {
        const m = this.messages.get(msg.id);
        if (m) m.status = 'failed';
      }
    }
  }

  /**
   * Get all messages for a topic
   */
  getMessagesByTopic(topic: string): AgentMessage[] {
    const ids = this.topicIndex.get(topic);
    if (!ids) return [];
    const result: AgentMessage[] = [];
    for (const id of ids) {
      const msg = this.messages.get(id);
      if (msg) result.push(msg);
    }
    return result;
  }

  /**
   * Get all topics
   */
  getTopics(): string[] {
    return Array.from(this.topicIndex.keys());
  }

  /**
   * Get subscriber count for a topic
   */
  getSubscriberCount(topic: string): number {
    return this.subscribers.get(topic)?.length ?? 0;
  }

  /**
   * Clear all (for testing)
   */
  clearAll(): void {
    this.messages.clear();
    this.subscribers.clear();
    this.topicIndex.clear();
  }
}

export default AgentCommBus;