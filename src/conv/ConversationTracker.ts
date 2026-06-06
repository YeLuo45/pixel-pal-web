/**
 * Conversation Tracker
 * chatdev-design Conversation Tracker - Start + AddMessage + GetTurns + Stats
 */

export interface Conversation {
  id: string;
  topic: string;
  participants: string[];
  turns: number;
  messages: string[];
  created: number;
  updated: number;
  closed: boolean;
  hits: number;
  history: number[];
}

export interface ConvStats {
  conversations: number;
  totalTurns: number;
  totalMessages: number;
  avgTurns: number;
  open: number;
  closed: number;
  topics: number;
}

export class ConversationTracker {
  private conversations: Map<string, Conversation> = new Map();
  private counter = 0;

  start(topic: string): string {
    const id = `conv-${++this.counter}`;
    this.conversations.set(id, {
      id,
      topic,
      participants: [],
      turns: 0,
      messages: [],
      created: Date.now(),
      updated: Date.now(),
      closed: false,
      hits: 0,
      history: [],
    });
    return id;
  }

  addMessage(id: string, message: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    if (c.closed) return false;
    c.messages.push(message);
    c.turns++;
    c.history.push(c.turns);
    c.updated = Date.now();
    return true;
  }

  join(id: string, participant: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    if (c.closed) return false;
    if (c.participants.includes(participant)) return false;
    c.participants.push(participant);
    c.updated = Date.now();
    return true;
  }

  close(id: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    c.closed = true;
    c.updated = Date.now();
    return true;
  }

  getTurns(id: string): number {
    return this.conversations.get(id)?.turns ?? 0;
  }

  getStats(): ConvStats {
    const all = Array.from(this.conversations.values());
    return {
      conversations: all.length,
      totalTurns: all.reduce((s, c) => s + c.turns, 0),
      totalMessages: all.reduce((s, c) => s + c.messages.length, 0),
      avgTurns: all.length > 0 ? Math.round((all.reduce((s, c) => s + c.turns, 0) / all.length) * 100) / 100 : 0,
      open: all.filter(c => !c.closed).length,
      closed: all.filter(c => c.closed).length,
      topics: new Set(all.map(c => c.topic)).size,
    };
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  removeConversation(id: string): boolean {
    return this.conversations.delete(id);
  }

  hasConversation(id: string): boolean {
    return this.conversations.has(id);
  }

  getCount(): number {
    return this.conversations.size;
  }

  getTopic(id: string): string | undefined {
    return this.conversations.get(id)?.topic;
  }

  getParticipants(id: string): string[] {
    return [...(this.conversations.get(id)?.participants ?? [])];
  }

  getParticipantCount(id: string): number {
    return this.getParticipants(id).length;
  }

  getMessages(id: string): string[] {
    return [...(this.conversations.get(id)?.messages ?? [])];
  }

  getMessageCount(id: string): number {
    return this.getMessages(id).length;
  }

  getLastMessage(id: string): string | undefined {
    const msgs = this.getMessages(id);
    return msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
  }

  getHistory(id: string): number[] {
    return [...(this.conversations.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.conversations.get(id)?.hits ?? 0;
  }

  isClosed(id: string): boolean {
    return this.conversations.get(id)?.closed ?? false;
  }

  isOpen(id: string): boolean {
    return !this.isClosed(id);
  }

  isParticipant(id: string, participant: string): boolean {
    return this.conversations.get(id)?.participants.includes(participant) ?? false;
  }

  setTopic(id: string, topic: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    c.topic = topic;
    c.updated = Date.now();
    return true;
  }

  leave(id: string, participant: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    if (!c.participants.includes(participant)) return false;
    c.participants = c.participants.filter(p => p !== participant);
    c.updated = Date.now();
    return true;
  }

  reopen(id: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    c.closed = false;
    c.updated = Date.now();
    return true;
  }

  resetTurns(id: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    c.turns = 0;
    c.messages = [];
    c.history = [];
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.conversations.values()) {
      c.turns = 0;
      c.messages = [];
      c.history = [];
      c.closed = false;
      c.hits = 0;
    }
  }

  getByTopic(topic: string): Conversation[] {
    return Array.from(this.conversations.values()).filter(c => c.topic === topic);
  }

  getByParticipant(participant: string): Conversation[] {
    return Array.from(this.conversations.values()).filter(c => c.participants.includes(participant));
  }

  getOpenConversations(): Conversation[] {
    return Array.from(this.conversations.values()).filter(c => !c.closed);
  }

  getClosedConversations(): Conversation[] {
    return Array.from(this.conversations.values()).filter(c => c.closed);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.conversations.values()).map(c => c.topic))];
  }

  getTopicCount(): number {
    return this.getAllTopics().length;
  }

  getByMinTurns(min: number): Conversation[] {
    return Array.from(this.conversations.values()).filter(c => c.turns >= min);
  }

  getMostTurns(): Conversation | null {
    const all = Array.from(this.conversations.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.turns > max.turns ? c : max);
  }

  getNewest(): Conversation | null {
    const all = Array.from(this.conversations.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Conversation | null {
    const all = Array.from(this.conversations.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.conversations.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.conversations.get(id)?.updated ?? 0;
  }

  touch(id: string): boolean {
    const c = this.conversations.get(id);
    if (!c) return false;
    c.hits++;
    c.updated = Date.now();
    return true;
  }

  clearAll(): void {
    this.conversations.clear();
    this.counter = 0;
  }
}

export default ConversationTracker;