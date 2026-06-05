/**
 * Event Bus v2
 * thunderbolt-design Event Bus v2 - Route + Retry + DeadLetter + Track
 */

export type EventStatus = 'pending' | 'processed' | 'failed' | 'dead';

export interface BusEvent {
  id: string;
  topic: string;
  payload: unknown;
  retries: number;
  maxRetries: number;
  status: EventStatus;
  created: number;
}

export type EventHandler = (e: BusEvent) => Promise<void>;

export class EventBusV2 {
  private events: Map<string, BusEvent> = new Map();
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private deadLetter: BusEvent[] = [];
  private counter = 0;

  publish(event: Omit<BusEvent, 'id'>): string {
    const id = `event-${++this.counter}`;
    this.events.set(id, { ...event, id });
    return id;
  }

  subscribe(topic: string, handler: EventHandler): void {
    if (!this.handlers.has(topic)) this.handlers.set(topic, new Set());
    this.handlers.get(topic)!.add(handler);
  }

  async retry(eventId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;
    if (event.retries >= event.maxRetries) {
      this.deadLetter.push(event);
      event.status = 'dead';
      return false;
    }
    event.retries++;
    event.status = 'pending';
    return this.dispatch(event);
  }

  getDeadLetter(): BusEvent[] {
    return [...this.deadLetter];
  }

  getStatus(eventId: string): EventStatus | null {
    return this.events.get(eventId)?.status ?? null;
  }

  getEvent(eventId: string): BusEvent | undefined {
    return this.events.get(eventId);
  }

  getAllEvents(): BusEvent[] {
    return Array.from(this.events.values());
  }

  removeEvent(eventId: string): boolean {
    return this.events.delete(eventId);
  }

  hasEvent(eventId: string): boolean {
    return this.events.has(eventId);
  }

  getEventCount(): number {
    return this.events.size;
  }

  getDeadLetterCount(): number {
    return this.deadLetter.length;
  }

  async processEvent(eventId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;
    return this.dispatch(event);
  }

  private async dispatch(event: BusEvent): Promise<boolean> {
    const handlers = this.handlers.get(event.topic) ?? new Set();
    if (handlers.size === 0) {
      event.status = 'failed';
      return false;
    }
    let allSucceeded = true;
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch {
        allSucceeded = false;
      }
    }
    event.status = allSucceeded ? 'processed' : 'failed';
    if (!allSucceeded && event.retries >= event.maxRetries) {
      event.status = 'dead';
      this.deadLetter.push(event);
    }
    return allSucceeded;
  }

  async publishAndProcess(event: Omit<BusEvent, 'id'>): Promise<boolean> {
    const id = this.publish(event);
    const e = this.events.get(id)!;
    return this.dispatch(e);
  }

  unsubscribe(topic: string, handler: EventHandler): boolean {
    return this.handlers.get(topic)?.delete(handler) ?? false;
  }

  removeAllHandlers(topic: string): void {
    this.handlers.delete(topic);
  }

  getTopics(): string[] {
    return [...this.handlers.keys()];
  }

  getHandlerCount(topic: string): number {
    return this.handlers.get(topic)?.size ?? 0;
  }

  getEventsByStatus(status: EventStatus): BusEvent[] {
    return Array.from(this.events.values()).filter(e => e.status === status);
  }

  getEventsByTopic(topic: string): BusEvent[] {
    return Array.from(this.events.values()).filter(e => e.topic === topic);
  }

  clearDeadLetter(): void {
    this.deadLetter = [];
  }

  clearAll(): void {
    this.events.clear();
    this.handlers.clear();
    this.deadLetter = [];
    this.counter = 0;
  }
}

export default EventBusV2;