/**
 * Channel Engine
 * nanobot-design Channel Engine - Create + Publish + Subscribe + Stats
 */

export type ChannelType = 'broadcast' | 'unicast' | 'multicast';

export interface ChannelMessage {
  id: string;
  channel: string;
  sender: string;
  content: string;
  type: ChannelType;
  delivered: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Cne2Stats {
  messages: number;
  totalCreated: number;
  totalPublished: number;
  totalSubscribed: number;
  broadcast: number;
  unicast: number;
  multicast: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueChannels: number;
  uniqueSenders: number;
  totalDelivered: number;
  avgDelivered: number;
  maxDelivered: number;
  minDelivered: number;
  totalContentLen: number;
  avgContentLen: number;
}

export class ChannelEngine {
  private messages: Map<string, ChannelMessage> = new Map();
  private counter = 0;
  private totalCreated = 0;
  private totalPublished = 0;
  private totalSubscribed = 0;
  private totalDelivered = 0;
  private totalContentLen = 0;

  create(channel: string, sender: string, content: string, type: ChannelType = 'broadcast'): string {
    const id = `cne2-${++this.counter}`;
    this.messages.set(id, {
      id,
      channel,
      sender,
      content,
      type,
      delivered: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalCreated++;
    this.totalContentLen += content.length;
    return id;
  }

  publish(id: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    if (!m.active) return false;
    m.delivered++;
    m.updated = Date.now();
    m.hits++;
    this.totalPublished++;
    this.totalDelivered++;
    return true;
  }

  subscribe(channel: string): ChannelMessage[] {
    const results: ChannelMessage[] = [];
    for (const m of this.messages.values()) {
      if (m.channel === channel && m.active) {
        results.push(m);
        this.totalSubscribed++;
      }
    }
    return results;
  }

  remove(id: string): boolean {
    return this.messages.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setChannel(id: string, channel: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.channel = channel;
    m.updated = Date.now();
    return true;
  }

  setSender(id: string, sender: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.sender = sender;
    m.updated = Date.now();
    return true;
  }

  setContent(id: string, content: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.content = content;
    m.updated = Date.now();
    return true;
  }

  setType(id: string, type: ChannelType): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.type = type;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.messages.values()) {
      m.delivered = 0;
      m.active = true;
      m.hits = 0;
    }
    this.totalCreated = 0;
    this.totalPublished = 0;
    this.totalSubscribed = 0;
    this.totalDelivered = 0;
    this.totalContentLen = 0;
  }

  getStats(): Cne2Stats {
    const all = Array.from(this.messages.values());
    const delArr = all.map(m => m.delivered);
    return {
      messages: all.length,
      totalCreated: this.totalCreated,
      totalPublished: this.totalPublished,
      totalSubscribed: this.totalSubscribed,
      broadcast: all.filter(m => m.type === 'broadcast').length,
      unicast: all.filter(m => m.type === 'unicast').length,
      multicast: all.filter(m => m.type === 'multicast').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueChannels: new Set(all.map(m => m.channel)).size,
      uniqueSenders: new Set(all.map(m => m.sender)).size,
      totalDelivered: this.totalDelivered,
      avgDelivered: all.length > 0 ? Math.round((delArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDelivered: delArr.length > 0 ? Math.max(...delArr) : 0,
      minDelivered: delArr.length > 0 ? Math.min(...delArr) : 0,
      totalContentLen: this.totalContentLen,
      avgContentLen: all.length > 0 ? Math.round((all.reduce((s, m) => s + m.content.length, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getMessage(id: string): ChannelMessage | undefined {
    return this.messages.get(id);
  }

  getAllMessages(): ChannelMessage[] {
    return Array.from(this.messages.values());
  }

  hasMessage(id: string): boolean {
    return this.messages.has(id);
  }

  getCount(): number {
    return this.messages.size;
  }

  getChannel(id: string): string | undefined {
    return this.messages.get(id)?.channel;
  }

  getSender(id: string): string | undefined {
    return this.messages.get(id)?.sender;
  }

  getContent(id: string): string | undefined {
    return this.messages.get(id)?.content;
  }

  getType(id: string): ChannelType | undefined {
    return this.messages.get(id)?.type;
  }

  getDelivered(id: string): number {
    return this.messages.get(id)?.delivered ?? 0;
  }

  getHits(id: string): number {
    return this.messages.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.messages.get(id)?.active ?? false;
  }

  isBroadcast(id: string): boolean {
    return this.messages.get(id)?.type === 'broadcast';
  }

  isUnicast(id: string): boolean {
    return this.messages.get(id)?.type === 'unicast';
  }

  isMulticast(id: string): boolean {
    return this.messages.get(id)?.type === 'multicast';
  }

  getByType(type: ChannelType): ChannelMessage[] {
    return Array.from(this.messages.values()).filter(m => m.type === type);
  }

  getByChannel(channel: string): ChannelMessage[] {
    return Array.from(this.messages.values()).filter(m => m.channel === channel);
  }

  getActiveMessages(): ChannelMessage[] {
    return Array.from(this.messages.values()).filter(m => m.active);
  }

  getInactiveMessages(): ChannelMessage[] {
    return Array.from(this.messages.values()).filter(m => !m.active);
  }

  getAllChannels(): string[] {
    return [...new Set(Array.from(this.messages.values()).map(m => m.channel))];
  }

  getAllSenders(): string[] {
    return [...new Set(Array.from(this.messages.values()).map(m => m.sender))];
  }

  getNewest(): ChannelMessage | null {
    const all = Array.from(this.messages.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): ChannelMessage | null {
    const all = Array.from(this.messages.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.messages.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.messages.get(id)?.updated ?? 0;
  }

  getTotalCreated(): number {
    return this.totalCreated;
  }

  getTotalPublished(): number {
    return this.totalPublished;
  }

  getTotalSubscribed(): number {
    return this.totalSubscribed;
  }

  clearAll(): void {
    this.messages.clear();
    this.counter = 0;
    this.totalCreated = 0;
    this.totalPublished = 0;
    this.totalSubscribed = 0;
    this.totalDelivered = 0;
    this.totalContentLen = 0;
  }
}

export default ChannelEngine;