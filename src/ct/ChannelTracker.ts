/**
 * Channel Tracker
 * chatdev-design Channel Tracker - Record + SetStatus + Stats
 */

export type ChannelStatus = 'open' | 'closed' | 'busy';

export interface Channel {
  id: string;
  name: string;
  status: ChannelStatus;
  events: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: ChannelStatus[];
}

export interface CTStats {
  channels: number;
  open: number;
  closed: number;
  busy: number;
  active: number;
  inactive: number;
  totalEvents: number;
  totalHits: number;
  avgEvents: number;
}

export class ChannelTracker {
  private channels: Map<string, Channel> = new Map();
  private counter = 0;

  record(name: string, status: ChannelStatus = 'open'): string {
    const id = `ct-${++this.counter}`;
    this.channels.set(id, {
      id,
      name,
      status,
      events: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [status],
    });
    return id;
  }

  setStatus(id: string, status: ChannelStatus): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.status = status;
    c.events++;
    c.history.push(status);
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  addEvent(id: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.events++;
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  getStats(): CTStats {
    const all = Array.from(this.channels.values());
    return {
      channels: all.length,
      open: all.filter(c => c.status === 'open').length,
      closed: all.filter(c => c.status === 'closed').length,
      busy: all.filter(c => c.status === 'busy').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalEvents: all.reduce((s, c) => s + c.events, 0),
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      avgEvents: all.length > 0 ? Math.round((all.reduce((s, c) => s + c.events, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getChannel(id: string): Channel | undefined {
    return this.channels.get(id);
  }

  getAllChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  removeChannel(id: string): boolean {
    return this.channels.delete(id);
  }

  hasChannel(id: string): boolean {
    return this.channels.has(id);
  }

  getCount(): number {
    return this.channels.size;
  }

  getName(id: string): string | undefined {
    return this.channels.get(id)?.name;
  }

  getStatus(id: string): ChannelStatus | undefined {
    return this.channels.get(id)?.status;
  }

  getEvents(id: string): number {
    return this.channels.get(id)?.events ?? 0;
  }

  getHits(id: string): number {
    return this.channels.get(id)?.hits ?? 0;
  }

  getHistory(id: string): ChannelStatus[] {
    return [...(this.channels.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.channels.get(id)?.active ?? false;
  }

  isOpen(id: string): boolean {
    return this.channels.get(id)?.status === 'open';
  }

  isClosed(id: string): boolean {
    return this.channels.get(id)?.status === 'closed';
  }

  isBusy(id: string): boolean {
    return this.channels.get(id)?.status === 'busy';
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.channels.values()) {
      c.events = 0;
      c.hits = 0;
      c.history = [c.status];
      c.active = true;
    }
  }

  getByName(name: string): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.name === name);
  }

  getByStatus(status: ChannelStatus): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.status === status);
  }

  getActiveChannels(): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.active);
  }

  getInactiveChannels(): Channel[] {
    return Array.from(this.channels.values()).filter(c => !c.active);
  }

  getOpenChannels(): Channel[] {
    return this.getByStatus('open');
  }

  getClosedChannels(): Channel[] {
    return this.getByStatus('closed');
  }

  getBusyChannels(): Channel[] {
    return this.getByStatus('busy');
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.channels.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinEvents(min: number): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.events >= min);
  }

  getMostEvents(): Channel | null {
    const all = Array.from(this.channels.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.events > max.events ? c : max);
  }

  getNewest(): Channel | null {
    const all = Array.from(this.channels.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Channel | null {
    const all = Array.from(this.channels.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.channels.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.channels.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.channels.clear();
    this.counter = 0;
  }
}

export default ChannelTracker;