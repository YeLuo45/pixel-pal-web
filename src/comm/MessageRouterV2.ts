/**
 * Message Router v2
 * chatdev-design Message Router v2 - Route + Transform + Queue + Track
 */

export type MessageStatus = 'pending' | 'delivered' | 'failed';

export interface Message {
  id: string;
  from: string;
  to: string;
  payload: unknown;
  timestamp: number;
  status: MessageStatus;
}

export type Transformer = (m: Message) => Message;

export class MessageRouterV2 {
  private queue_: Message[] = [];
  private tracked: Message[] = [];
  private routes: Map<string, Set<string>> = new Map(); // to -> allowed from
  private counter = 0;

  route(message: Message): boolean {
    const messageWithId = message.id ? message : { ...message, id: `msg-${++this.counter}` };

    // Check route validity
    const allowed = this.routes.get(messageWithId.to);
    if (allowed && !allowed.has(messageWithId.from)) {
      this.tracked.push({ ...messageWithId, status: 'failed' });
      return false;
    }

    this.tracked.push({ ...messageWithId, status: 'delivered' });
    return true;
  }

  transform(message: Message, transformer: Transformer): Message {
    return transformer({ ...message });
  }

  queue(message: Message): void {
    this.queue_.push(message);
  }

  flush(): Message[] {
    const items = [...this.queue_];
    this.queue_ = [];
    return items;
  }

  getTrackedMessages(): Message[] {
    return [...this.tracked];
  }

  addRoute(to: string, allowedFrom: string[]): void {
    this.routes.set(to, new Set(allowedFrom));
  }

  removeRoute(to: string): boolean {
    return this.routes.delete(to);
  }

  isAllowed(from: string, to: string): boolean {
    const allowed = this.routes.get(to);
    if (!allowed) return true; // No restrictions
    return allowed.has(from);
  }

  getQueueSize(): number {
    return this.queue_.length;
  }

  getTrackedCount(): number {
    return this.tracked.length;
  }

  getDeliveredCount(): number {
    return this.tracked.filter(m => m.status === 'delivered').length;
  }

  getFailedCount(): number {
    return this.tracked.filter(m => m.status === 'failed').length;
  }

  getPendingCount(): number {
    return this.queue_.filter(m => m.status === 'pending').length;
  }

  getMessagesByFrom(from: string): Message[] {
    return this.tracked.filter(m => m.from === from);
  }

  getMessagesByTo(to: string): Message[] {
    return this.tracked.filter(m => m.to === to);
  }

  getMessagesByStatus(status: MessageStatus): Message[] {
    return this.tracked.filter(m => m.status === status);
  }

  getMessageById(id: string): Message | undefined {
    return this.tracked.find(m => m.id === id);
  }

  clearTracked(): void {
    this.tracked = [];
  }

  clearQueue(): void {
    this.queue_ = [];
  }

  clearAll(): void {
    this.queue_ = [];
    this.tracked = [];
    this.routes.clear();
  }

  hasRoute(to: string): boolean {
    return this.routes.has(to);
  }

  getRouteCount(): number {
    return this.routes.size;
  }

  getAllowedSenders(to: string): string[] {
    return [...(this.routes.get(to) ?? [])];
  }

  addAllowedSender(to: string, from: string): void {
    if (!this.routes.has(to)) {
      this.routes.set(to, new Set());
    }
    this.routes.get(to)!.add(from);
  }

  removeAllowedSender(to: string, from: string): boolean {
    const allowed = this.routes.get(to);
    if (!allowed) return false;
    return allowed.delete(from);
  }

  getSuccessRate(): number {
    if (this.tracked.length === 0) return 0;
    return Math.round((this.getDeliveredCount() / this.tracked.length) * 100) / 100;
  }

  peekQueue(): Message[] {
    return [...this.queue_];
  }
}

export default MessageRouterV2;