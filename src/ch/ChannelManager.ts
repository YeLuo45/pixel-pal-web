/**
 * Channel Manager
 * chatdev-design Channel Manager - Create + Join + Broadcast + Stats
 */

export interface Channel {
  id: string;
  name: string;
  members: string[];
  messages: number;
  created: number;
  updated: number;
  history: string[];
  active: boolean;
  hits: number;
}

export interface ChStats {
  channels: number;
  totalMembers: number;
  totalMessages: number;
  avgMembers: number;
  avgMessages: number;
  active: number;
  inactive: number;
}

export class ChannelManager {
  private channels: Map<string, Channel> = new Map();
  private counter = 0;

  create(name: string): string {
    const id = `ch-${++this.counter}`;
    this.channels.set(id, {
      id,
      name,
      members: [],
      messages: 0,
      created: Date.now(),
      updated: Date.now(),
      history: [],
      active: true,
      hits: 0,
    });
    return id;
  }

  join(channelId: string, userId: string): boolean {
    const c = this.channels.get(channelId);
    if (!c) return false;
    if (!c.active) return false;
    if (c.members.includes(userId)) return false;
    c.members.push(userId);
    c.updated = Date.now();
    return true;
  }

  broadcast(channelId: string, message: string): boolean {
    const c = this.channels.get(channelId);
    if (!c) return false;
    if (!c.active) return false;
    c.messages++;
    c.history.push(message);
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  getStats(): ChStats {
    const all = Array.from(this.channels.values());
    return {
      channels: all.length,
      totalMembers: all.reduce((s, c) => s + c.members.length, 0),
      totalMessages: all.reduce((s, c) => s + c.messages, 0),
      avgMembers: all.length > 0 ? Math.round((all.reduce((s, c) => s + c.members.length, 0) / all.length) * 100) / 100 : 0,
      avgMessages: all.length > 0 ? Math.round((all.reduce((s, c) => s + c.messages, 0) / all.length) * 100) / 100 : 0,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
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

  getMembers(id: string): string[] {
    return [...(this.channels.get(id)?.members ?? [])];
  }

  getMemberCount(id: string): number {
    return this.getMembers(id).length;
  }

  getMessages(id: string): number {
    return this.channels.get(id)?.messages ?? 0;
  }

  getHistory(id: string): string[] {
    return [...(this.channels.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.channels.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.channels.get(id)?.active ?? false;
  }

  isMember(id: string, userId: string): boolean {
    return this.channels.get(id)?.members.includes(userId) ?? false;
  }

  leave(id: string, userId: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    if (!c.members.includes(userId)) return false;
    c.members = c.members.filter(m => m !== userId);
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

  setActive(id: string, active: boolean): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  clearHistory(id: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    c.history = [];
    c.updated = Date.now();
    return true;
  }

  resetMessages(id: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    c.messages = 0;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.channels.values()) {
      c.members = [];
      c.messages = 0;
      c.history = [];
      c.hits = 0;
      c.active = true;
    }
  }

  getByName(name: string): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.name === name);
  }

  getByMember(userId: string): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.members.includes(userId));
  }

  getActiveChannels(): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.active);
  }

  getInactiveChannels(): Channel[] {
    return Array.from(this.channels.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.channels.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinMembers(min: number): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.members.length >= min);
  }

  getMostMembers(): Channel | null {
    const all = Array.from(this.channels.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.members.length > max.members.length ? c : max);
  }

  getMostMessages(): Channel | null {
    const all = Array.from(this.channels.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.messages > max.messages ? c : max);
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

export default ChannelManager;