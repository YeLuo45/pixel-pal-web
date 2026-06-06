/**
 * Channel Engine
 * chatdev-design Channel Engine - Create + Join + Leave + Send + Stats
 */

export type ChannelType = 'public' | 'private' | 'direct';

export interface ChannelMessage {
  id: string;
  sender: string;
  text: string;
  created: number;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  members: string[];
  messages: ChannelMessage[];
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CnlStats {
  channels: number;
  totalSent: number;
  totalJoins: number;
  totalLeaves: number;
  public: number;
  private: number;
  direct: number;
  active: number;
  inactive: number;
  totalMembers: number;
  totalMessages: number;
  uniqueNames: number;
}

export class ChannelEngine {
  private channels: Map<string, Channel> = new Map();
  private counter = 0;
  private totalSent = 0;
  private totalJoins = 0;
  private totalLeaves = 0;

  create(name: string, type: ChannelType = 'public'): string {
    const id = `cnl-${++this.counter}`;
    this.channels.set(id, {
      id,
      name,
      type,
      members: [],
      messages: [],
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  join(id: string, user: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    if (!c.active) return false;
    if (!c.members.includes(user)) {
      c.members.push(user);
      c.updated = Date.now();
    }
    c.hits++;
    this.totalJoins++;
    return true;
  }

  leave(id: string, user: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    const idx = c.members.indexOf(user);
    if (idx < 0) return false;
    c.members.splice(idx, 1);
    c.updated = Date.now();
    c.hits++;
    this.totalLeaves++;
    return true;
  }

  send(id: string, sender: string, text: string): string | null {
    const c = this.channels.get(id);
    if (!c) return null;
    if (!c.active) return null;
    const msgId = `${id}-msg-${c.messages.length + 1}`;
    c.messages.push({
      id: msgId,
      sender,
      text,
      created: Date.now(),
    });
    c.updated = Date.now();
    this.totalSent++;
    return msgId;
  }

  remove(id: string): boolean {
    return this.channels.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.channels.values()) {
      c.members = [];
      c.messages = [];
      c.hits = 0;
      c.active = true;
    }
    this.totalSent = 0;
    this.totalJoins = 0;
    this.totalLeaves = 0;
  }

  getStats(): CnlStats {
    const all = Array.from(this.channels.values());
    return {
      channels: all.length,
      totalSent: this.totalSent,
      totalJoins: this.totalJoins,
      totalLeaves: this.totalLeaves,
      public: all.filter(c => c.type === 'public').length,
      private: all.filter(c => c.type === 'private').length,
      direct: all.filter(c => c.type === 'direct').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalMembers: all.reduce((s, c) => s + c.members.length, 0),
      totalMessages: all.reduce((s, c) => s + c.messages.length, 0),
      uniqueNames: new Set(all.map(c => c.name)).size,
    };
  }

  getChannel(id: string): Channel | undefined {
    return this.channels.get(id);
  }

  getAllChannels(): Channel[] {
    return Array.from(this.channels.values());
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

  getType(id: string): ChannelType | undefined {
    return this.channels.get(id)?.type;
  }

  getMembers(id: string): string[] {
    return [...(this.channels.get(id)?.members ?? [])];
  }

  getMemberCount(id: string): number {
    return this.channels.get(id)?.members.length ?? 0;
  }

  getMessages(id: string): ChannelMessage[] {
    return [...(this.channels.get(id)?.messages ?? [])];
  }

  getMessageCount(id: string): number {
    return this.channels.get(id)?.messages.length ?? 0;
  }

  getHits(id: string): number {
    return this.channels.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.channels.get(id)?.active ?? false;
  }

  setName(id: string, name: string): boolean {
    const c = this.channels.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  getByName(name: string): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.name === name);
  }

  getByType(type: ChannelType): Channel[] {
    return Array.from(this.channels.values()).filter(c => c.type === type);
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

  getTotalSent(): number {
    return this.totalSent;
  }

  getTotalJoins(): number {
    return this.totalJoins;
  }

  getTotalLeaves(): number {
    return this.totalLeaves;
  }

  clearAll(): void {
    this.channels.clear();
    this.counter = 0;
    this.totalSent = 0;
    this.totalJoins = 0;
    this.totalLeaves = 0;
  }
}

export default ChannelEngine;