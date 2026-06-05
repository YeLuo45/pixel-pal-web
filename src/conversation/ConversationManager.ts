/**
 * Conversation Manager
 * chatdev-design Conversation Manager - Store + Track + Context + Analyze
 */

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  context: Record<string, unknown>;
  created: number;
  updated: number;
}

export interface ConversationStats {
  conversations: number;
  messages: number;
  avgMessagesPerConversation: number;
}

export class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private counter = 0;

  createConversation(participants: string[]): string {
    const id = `conv-${++this.counter}`;
    this.conversations.set(id, {
      id,
      participants: [...participants],
      messages: [],
      context: {},
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  addMessage(convId: string, message: Message): boolean {
    const conv = this.conversations.get(convId);
    if (!conv) return false;
    if (!conv.participants.includes(message.sender)) {
      conv.participants.push(message.sender);
    }
    conv.messages.push({ ...message });
    conv.updated = Date.now();
    return true;
  }

  getContext(convId: string): Record<string, unknown> {
    return { ...(this.conversations.get(convId)?.context ?? {}) };
  }

  getStats(): ConversationStats {
    const all = Array.from(this.conversations.values());
    const totalMessages = all.reduce((sum, c) => sum + c.messages.length, 0);
    return {
      conversations: all.length,
      messages: totalMessages,
      avgMessagesPerConversation: all.length > 0 ? Math.round((totalMessages / all.length) * 100) / 100 : 0,
    };
  }

  getConversation(id: string): Conversation | undefined {
    const c = this.conversations.get(id);
    return c ? { ...c, messages: [...c.messages], participants: [...c.participants] } : undefined;
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values()).map(c => ({ ...c, messages: [...c.messages] }));
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

  getMessages(convId: string): Message[] {
    return [...(this.conversations.get(convId)?.messages ?? [])];
  }

  getMessageCount(convId: string): number {
    return this.conversations.get(convId)?.messages.length ?? 0;
  }

  getParticipants(convId: string): string[] {
    return [...(this.conversations.get(convId)?.participants ?? [])];
  }

  setContext(convId: string, key: string, value: unknown): boolean {
    const conv = this.conversations.get(convId);
    if (!conv) return false;
    conv.context[key] = value;
    return true;
  }

  getContextValue(convId: string, key: string): unknown {
    return this.conversations.get(convId)?.context[key];
  }

  clearContext(convId: string): boolean {
    const conv = this.conversations.get(convId);
    if (!conv) return false;
    conv.context = {};
    return true;
  }

  removeMessage(convId: string, msgId: string): boolean {
    const conv = this.conversations.get(convId);
    if (!conv) return false;
    const idx = conv.messages.findIndex(m => m.id === msgId);
    if (idx === -1) return false;
    conv.messages.splice(idx, 1);
    return true;
  }

  getMessagesBySender(convId: string, sender: string): Message[] {
    return (this.conversations.get(convId)?.messages ?? []).filter(m => m.sender === sender);
  }

  getLastMessage(convId: string): Message | undefined {
    const msgs = this.conversations.get(convId)?.messages;
    if (!msgs || msgs.length === 0) return undefined;
    return { ...msgs[msgs.length - 1] };
  }

  getConversationsByParticipant(participant: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(c => c.participants.includes(participant))
      .map(c => ({ ...c, messages: [...c.messages] }));
  }

  getRecentConversations(limit: number): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.updated - a.updated)
      .slice(0, limit)
      .map(c => ({ ...c, messages: [...c.messages] }));
  }

  isParticipant(convId: string, participant: string): boolean {
    return this.conversations.get(convId)?.participants.includes(participant) ?? false;
  }

  getCreatedAt(convId: string): number {
    return this.conversations.get(convId)?.created ?? 0;
  }

  getUpdatedAt(convId: string): number {
    return this.conversations.get(convId)?.updated ?? 0;
  }

  clearAll(): void {
    this.conversations.clear();
    this.counter = 0;
  }
}

export default ConversationManager;