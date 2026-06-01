export interface CollabSession {
  id: string;
  name: string;
  participants: string[];
  createdAt: number;
  status: 'active' | 'paused' | 'ended';
}

export interface CollabMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'action' | 'system';
}

export class CollabHub {
  private sessions: Map<string, CollabSession> = new Map();
  private messages: Map<string, CollabMessage[]> = new Map();

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  createSession(name: string, participants: string[]): CollabSession {
    const session: CollabSession = {
      id: this.generateId(),
      name,
      participants: [...participants],
      createdAt: Date.now(),
      status: 'active',
    };
    this.sessions.set(session.id, session);
    this.messages.set(session.id, []);
    return session;
  }

  getSession(id: string): CollabSession | null {
    return this.sessions.get(id) || null;
  }

  endSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) {
      return false;
    }
    if (session.status === 'ended') {
      return false;
    }
    session.status = 'ended';
    return true;
  }

  getActiveSessions(): CollabSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === 'active'
    );
  }

  sendMessage(
    sessionId: string,
    senderId: string,
    content: string,
    type: CollabMessage['type'] = 'text'
  ): CollabMessage {
    const message: CollabMessage = {
      id: this.generateId(),
      sessionId,
      senderId,
      content,
      timestamp: Date.now(),
      type,
    };
    const messages = this.messages.get(sessionId) || [];
    messages.push(message);
    this.messages.set(sessionId, messages);
    return message;
  }

  getMessages(sessionId: string, since?: number): CollabMessage[] {
    const messages = this.messages.get(sessionId) || [];
    if (since !== undefined) {
      return messages.filter((msg) => msg.timestamp >= since);  // >= to include since itself
    }
    return [...messages];
  }

  addParticipant(sessionId: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    if (session.participants.includes(participantId)) {
      return false;
    }
    session.participants.push(participantId);
    return true;
  }

  removeParticipant(sessionId: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    const index = session.participants.indexOf(participantId);
    if (index === -1) {
      return false;
    }
    session.participants.splice(index, 1);
    return true;
  }

  broadcast(sessionId: string, message: string, exclude: string[] = []): CollabMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }
    const participants = session.participants.filter(
      (p) => !exclude.includes(p)
    );
    return participants.map((participantId) =>
      this.sendMessage(sessionId, participantId, message, 'text')
    );
  }
}