/**
 * Signal Manager
 * thunderbolt-design Signal Manager - Send + Deliver + Stats
 */

export interface Signal {
  id: string;
  name: string;
  sender: string;
  receiver: string;
  delivered: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface SM3Stats {
  signals: number;
  delivered: number;
  pending: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueSenders: number;
  uniqueReceivers: number;
  deliverRate: number;
}

export class SignalManager {
  private signals: Map<string, Signal> = new Map();
  private counter = 0;

  send(name: string, sender: string, receiver: string): string {
    const id = `sm2-${++this.counter}`;
    this.signals.set(id, {
      id,
      name,
      sender,
      receiver,
      delivered: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  deliver(id: string): boolean {
    const s = this.signals.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.delivered = true;
    s.history.push(true);
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  undeliver(id: string): boolean {
    const s = this.signals.get(id);
    if (!s) return false;
    if (!s.delivered) return false;
    s.delivered = false;
    s.history.push(false);
    s.updated = Date.now();
    return true;
  }

  getStats(): SM3Stats {
    const all = Array.from(this.signals.values());
    return {
      signals: all.length,
      delivered: all.filter(s => s.delivered).length,
      pending: all.filter(s => !s.delivered).length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueSenders: new Set(all.map(s => s.sender)).size,
      uniqueReceivers: new Set(all.map(s => s.receiver)).size,
      deliverRate: all.length > 0 ? Math.round((all.filter(s => s.delivered).length / all.length) * 100) / 100 : 0,
    };
  }

  getSignal(id: string): Signal | undefined {
    return this.signals.get(id);
  }

  getAllSignals(): Signal[] {
    return Array.from(this.signals.values());
  }

  removeSignal(id: string): boolean {
    return this.signals.delete(id);
  }

  hasSignal(id: string): boolean {
    return this.signals.has(id);
  }

  getCount(): number {
    return this.signals.size;
  }

  getName(id: string): string | undefined {
    return this.signals.get(id)?.name;
  }

  getSender(id: string): string | undefined {
    return this.signals.get(id)?.sender;
  }

  getReceiver(id: string): string | undefined {
    return this.signals.get(id)?.receiver;
  }

  getHistory(id: string): boolean[] {
    return [...(this.signals.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.signals.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.signals.get(id)?.active ?? false;
  }

  isDelivered(id: string): boolean {
    return this.signals.get(id)?.delivered ?? false;
  }

  isPending(id: string): boolean {
    return !this.isDelivered(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.signals.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.signals.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setSender(id: string, sender: string): boolean {
    const s = this.signals.get(id);
    if (!s) return false;
    s.sender = sender;
    s.updated = Date.now();
    return true;
  }

  setReceiver(id: string, receiver: string): boolean {
    const s = this.signals.get(id);
    if (!s) return false;
    s.receiver = receiver;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.signals.values()) {
      s.delivered = false;
      s.hits = 0;
      s.history = [];
      s.active = true;
    }
  }

  getByName(name: string): Signal[] {
    return Array.from(this.signals.values()).filter(s => s.name === name);
  }

  getBySender(sender: string): Signal[] {
    return Array.from(this.signals.values()).filter(s => s.sender === sender);
  }

  getByReceiver(receiver: string): Signal[] {
    return Array.from(this.signals.values()).filter(s => s.receiver === receiver);
  }

  getDeliveredSignals(): Signal[] {
    return Array.from(this.signals.values()).filter(s => s.delivered);
  }

  getPendingSignals(): Signal[] {
    return Array.from(this.signals.values()).filter(s => !s.delivered);
  }

  getActiveSignals(): Signal[] {
    return Array.from(this.signals.values()).filter(s => s.active);
  }

  getInactiveSignals(): Signal[] {
    return Array.from(this.signals.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.signals.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllSenders(): string[] {
    return [...new Set(Array.from(this.signals.values()).map(s => s.sender))];
  }

  getSenderCount(): number {
    return this.getAllSenders().length;
  }

  getAllReceivers(): string[] {
    return [...new Set(Array.from(this.signals.values()).map(s => s.receiver))];
  }

  getReceiverCount(): number {
    return this.getAllReceivers().length;
  }

  getNewest(): Signal | null {
    const all = Array.from(this.signals.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Signal | null {
    const all = Array.from(this.signals.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.signals.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.signals.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.signals.clear();
    this.counter = 0;
  }
}

export default SignalManager;