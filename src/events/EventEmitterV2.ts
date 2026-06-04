/**
 * Event Emitter v2
 * thunderbolt-design Event Emitter v2 - Subscribe + Emit + Filter + History
 */

export interface Event {
  type: string;
  data: unknown;
  timestamp: number;
}

export type Handler = (event: Event) => void;

export class EventEmitterV2 {
  private handlers: Map<string, Set<Handler>> = new Map();
  private history: Event[] = [];
  private maxHistory = 1000;
  private wildcardHandlers: Set<Handler> = new Set();

  on(type: string, handler: Handler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  onAny(handler: Handler): void {
    this.wildcardHandlers.add(handler);
  }

  off(type: string, handler: Handler): void {
    this.handlers.get(type)?.delete(handler);
  }

  offAny(handler: Handler): void {
    this.wildcardHandlers.delete(handler);
  }

  emit(type: string, data: unknown): void {
    const event: Event = { type, data, timestamp: Date.now() };
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    // Type-specific handlers
    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          handler(event);
        } catch {
          // Silently ignore handler errors
        }
      }
    }

    // Wildcard handlers
    for (const handler of this.wildcardHandlers) {
      try {
        handler(event);
      } catch {
        // Silently ignore
      }
    }
  }

  getHistory(type?: string): Event[] {
    if (type) {
      return this.history.filter(e => e.type === type);
    }
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  listenerCount(type: string): number {
    return this.handlers.get(type)?.size ?? 0;
  }

  getEventTypes(): string[] {
    return [...this.handlers.keys()];
  }

  removeAllListeners(type?: string): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }

  getMaxHistory(): number {
    return this.maxHistory;
  }

  setMaxHistory(max: number): void {
    this.maxHistory = Math.max(0, max);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  getHistoryCount(): number {
    return this.history.length;
  }

  getEventByType(type: string): number {
    return this.history.filter(e => e.type === type).length;
  }

  getFirstEvent(type?: string): Event | undefined {
    const events = type ? this.getHistory(type) : this.history;
    return events[0];
  }

  getLastEvent(type?: string): Event | undefined {
    const events = type ? this.getHistory(type) : this.history;
    return events[events.length - 1];
  }

  hasListeners(type: string): boolean {
    return this.listenerCount(type) > 0;
  }

  getWildcardCount(): number {
    return this.wildcardHandlers.size;
  }

  clearAll(): void {
    this.handlers.clear();
    this.history = [];
    this.wildcardHandlers.clear();
  }
}

export default EventEmitterV2;