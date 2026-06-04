/**
 * Role Communication Bus
 * chatdev Multi-Agent Communication Pattern
 */

import type { AgentMessage, Subscription } from './types';

let instance: RoleCommBus | null = null;

export class RoleCommBus {
  private messages: AgentMessage[] = [];
  private subscriptions: Map<string, Subscription[]> = new Map();
  private maxHistory: number;

  constructor(maxHistory = 1000) {
    this.maxHistory = maxHistory;
  }

  static getInstance(): RoleCommBus {
    if (!instance) {
      instance = new RoleCommBus();
    }
    return instance;
  }

  /**
   * Publish a message to the bus (no specific recipient)
   */
  publish(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };

    this.addToHistory(fullMessage);
    this.deliverToSubscribers(fullMessage);
  }

  /**
   * Send a direct message to a specific agent
   */
  send(
    from: string,
    to: string,
    type: AgentMessage['type'],
    payload: unknown,
    priority?: AgentMessage['priority']
  ): void {
    this.publish({
      from,
      to,
      type,
      payload,
      priority: priority ?? 'normal',
    });
  }

  /**
   * Subscribe to messages
   * @returns Unsubscribe function
   */
  subscribe(sub: Subscription): () => void {
    const agentSubs = this.subscriptions.get(sub.agentId) ?? [];
    agentSubs.push(sub);
    this.subscriptions.set(sub.agentId, agentSubs);

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(sub.agentId);
      if (subs) {
        const idx = subs.indexOf(sub);
        if (idx >= 0) {
          subs.splice(idx, 1);
        }
      }
    };
  }

  /**
   * Get message history with optional filters
   */
  getHistory(
    from?: string,
    to?: string,
    limit = 100
  ): AgentMessage[] {
    let filtered = this.messages;

    if (from) {
      filtered = filtered.filter((m) => m.from === from);
    }
    if (to) {
      filtered = filtered.filter((m) => m.to === to);
    }

    return filtered.slice(-limit);
  }

  /**
   * Clear history (for testing)
   */
  clearHistory(): void {
    this.messages = [];
  }

  /**
   * Reset instance (for testing)
   */
  reset(): void {
    this.messages = [];
    this.subscriptions.clear();
    instance = null;
  }

  private addToHistory(message: AgentMessage): void {
    this.messages.push(message);
    if (this.messages.length > this.maxHistory) {
      this.messages = this.messages.slice(-this.maxHistory);
    }
  }

  private deliverToSubscribers(message: AgentMessage): void {
    for (const [, subs] of this.subscriptions) {
      for (const sub of subs) {
        if (sub.messageTypes.includes(message.type)) {
          try {
            sub.callback(message);
          } catch {
            // Subscriber callback error - ignore
          }
        }
      }
    }
  }
}

export default RoleCommBus;