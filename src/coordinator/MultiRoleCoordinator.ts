/**
 * Multi-Role Coordinator
 * chatdev-design Multi-Role Coordinator v2 - Assignment + Routing + Scoring + Conflict Resolution
 */

export interface Participant {
  id: string;
  role: string;
  active: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: number;
  status: 'active' | 'paused' | 'completed';
}

export class MultiRoleCoordinator {
  private participants: Map<string, Participant> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messageLog: Map<string, { from: string; to: string; content: string }[]> = new Map();
  private conversationCounter = 0;

  addParticipant(participant: Participant): void {
    this.participants.set(participant.id, { ...participant });
  }

  assignRole(participantId: string, role: string): boolean {
    const p = this.participants.get(participantId);
    if (!p) return false;
    p.role = role;
    return true;
  }

  startConversation(participantIds: string[]): string {
    const id = `conv-${++this.conversationCounter}`;
    this.conversations.set(id, {
      id,
      participants: [...participantIds],
      messages: 0,
      status: 'active',
    });
    this.messageLog.set(id, []);
    return id;
  }

  routeMessage(convId: string, from: string, message: string): string[] {
    const conv = this.conversations.get(convId);
    if (!conv) return [];

    const log = this.messageLog.get(convId);
    if (!log) return [];

    // Route to all other participants in the conversation
    const recipients: string[] = [];
    for (const participantId of conv.participants) {
      if (participantId !== from) {
        log.push({ from, to: participantId, content: message });
        recipients.push(participantId);
      }
    }

    conv.messages += recipients.length;
    return recipients;
  }

  resolveConflict(participantId1: string, participantId2: string): string | null {
    const p1 = this.participants.get(participantId1);
    const p2 = this.participants.get(participantId2);
    if (!p1 || !p2) return null;

    // Higher priority: higher active state or specific role
    if (p1.role === p2.role) {
      // Same role, pick by ID alphabetical
      return p1.id < p2.id ? p1.id : p2.id;
    }

    // Different roles, use role priority mapping
    const priority: Record<string, number> = {
      'reviewer': 4,
      'leader': 3,
      'manager': 2,
      'developer': 1,
    };

    const p1Priority = priority[p1.role] ?? 0;
    const p2Priority = priority[p2.role] ?? 0;
    return p1Priority >= p2Priority ? p1.id : p2.id;
  }

  getCoordinationScore(convId: string): number {
    const conv = this.conversations.get(convId);
    if (!conv || conv.participants.length === 0) return 0;

    // Score based on message count and active participants
    const activeCount = conv.participants.filter(pid => this.participants.get(pid)?.active).length;
    const baseScore = activeCount / conv.participants.length * 50;
    const messageScore = Math.min(50, conv.messages * 2);
    return Math.round((baseScore + messageScore) * 100) / 100;
  }

  getParticipant(id: string): Participant | undefined {
    return this.participants.get(id);
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getAllParticipants(): Participant[] {
    return Array.from(this.participants.values());
  }

  getActiveParticipants(): Participant[] {
    return Array.from(this.participants.values()).filter(p => p.active);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  removeParticipant(id: string): boolean {
    return this.participants.delete(id);
  }

  pauseConversation(convId: string): boolean {
    const conv = this.conversations.get(convId);
    if (!conv || conv.status !== 'active') return false;
    conv.status = 'paused';
    return true;
  }

  resumeConversation(convId: string): boolean {
    const conv = this.conversations.get(convId);
    if (!conv || conv.status !== 'paused') return false;
    conv.status = 'active';
    return true;
  }

  completeConversation(convId: string): boolean {
    const conv = this.conversations.get(convId);
    if (!conv) return false;
    conv.status = 'completed';
    return true;
  }

  getParticipantsByRole(role: string): Participant[] {
    return Array.from(this.participants.values()).filter(p => p.role === role);
  }

  getMessageCount(convId: string): number {
    return this.messageLog.get(convId)?.length ?? 0;
  }

  getMessageLog(convId: string): { from: string; to: string; content: string }[] {
    return [...(this.messageLog.get(convId) ?? [])];
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.participants.get(id);
    if (!p) return false;
    p.active = active;
    return true;
  }

  hasParticipant(id: string): boolean {
    return this.participants.has(id);
  }

  hasConversation(id: string): boolean {
    return this.conversations.has(id);
  }

  getParticipantCount(): number {
    return this.participants.size;
  }

  getConversationCount(): number {
    return this.conversations.size;
  }

  clearAll(): void {
    this.participants.clear();
    this.conversations.clear();
    this.messageLog.clear();
    this.conversationCounter = 0;
  }
}

export default MultiRoleCoordinator;