/**
 * Conversation Buffer
 * chatdev-design Conversation Buffer - Push + Flush + Retrieve + Stats
 */

export interface BufferMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export interface BufferStats {
  total: number;
  size: number;
  capacity: number;
  flushes: number;
}

export class ConversationBuffer {
  private buffer: BufferMessage[] = [];
  private total = 0;
  private flushCount = 0;
  private capacity: number;
  private counter = 0;

  constructor(capacity: number = 1000) {
    this.capacity = capacity;
  }

  push(sender: string, content: string): string | null {
    if (this.buffer.length >= this.capacity) return null;
    const id = `msg-${++this.counter}`;
    this.buffer.push({ id, sender, content, timestamp: Date.now() });
    this.total++;
    return id;
  }

  flush(): BufferMessage[] {
    const flushed = [...this.buffer];
    this.buffer = [];
    this.flushCount++;
    return flushed;
  }

  retrieve(since: number): BufferMessage[] {
    return this.buffer.filter(m => m.timestamp >= since);
  }

  getStats(): BufferStats {
    return {
      total: this.total,
      size: this.buffer.length,
      capacity: this.capacity,
      flushes: this.flushCount,
    };
  }

  getAll(): BufferMessage[] {
    return [...this.buffer];
  }

  getSize(): number {
    return this.buffer.length;
  }

  getCapacity(): number {
    return this.capacity;
  }

  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  isFull(): boolean {
    return this.buffer.length >= this.capacity;
  }

  getMessage(id: string): BufferMessage | undefined {
    return this.buffer.find(m => m.id === id);
  }

  removeMessage(id: string): boolean {
    const idx = this.buffer.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.buffer.splice(idx, 1);
    return true;
  }

  clearAll(): void {
    this.buffer = [];
  }

  getBySender(sender: string): BufferMessage[] {
    return this.buffer.filter(m => m.sender === sender);
  }

  getSenders(): string[] {
    return [...new Set(this.buffer.map(m => m.sender))];
  }

  getSenderCount(): number {
    return this.getSenders().length;
  }

  getFirst(): BufferMessage | undefined {
    return this.buffer[0];
  }

  getLast(): BufferMessage | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  getOldest(): BufferMessage | undefined {
    return this.getFirst();
  }

  getNewest(): BufferMessage | undefined {
    return this.getLast();
  }

  getFlushCount(): number {
    return this.flushCount;
  }

  getTotalPushed(): number {
    return this.total;
  }

  getRemainingCapacity(): number {
    return Math.max(0, this.capacity - this.buffer.length);
  }

  setCapacity(capacity: number): void {
    this.capacity = capacity;
  }

  getContent(id: string): string | undefined {
    return this.buffer.find(m => m.id === id)?.content;
  }

  getTimestamp(id: string): number | undefined {
    return this.buffer.find(m => m.id === id)?.timestamp;
  }

  getRange(start: number, end: number): BufferMessage[] {
    return this.buffer.filter(m => m.timestamp >= start && m.timestamp <= end);
  }

  containsContent(content: string): boolean {
    return this.buffer.some(m => m.content.includes(content));
  }

  searchByContent(query: string): BufferMessage[] {
    return this.buffer.filter(m => m.content.includes(query));
  }

  countBySender(sender: string): number {
    return this.buffer.filter(m => m.sender === sender).length;
  }

  getStatsForSender(sender: string): { count: number; first: number; last: number } {
    const msgs = this.getBySender(sender);
    return {
      count: msgs.length,
      first: msgs[0]?.timestamp ?? 0,
      last: msgs[msgs.length - 1]?.timestamp ?? 0,
    };
  }

  resetStats(): void {
    this.total = 0;
    this.flushCount = 0;
  }
}

export default ConversationBuffer;