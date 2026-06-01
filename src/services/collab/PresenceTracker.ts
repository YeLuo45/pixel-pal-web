export interface PresenceState {
  participantId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
  sessionId: string | null;
}

export class PresenceTracker {
  private presence: Map<string, PresenceState> = new Map();

  updatePresence(
    participantId: string,
    status: PresenceState['status'],
    sessionId?: string
  ): void {
    const presence: PresenceState = {
      participantId,
      status,
      lastSeen: Date.now(),
      sessionId: sessionId !== undefined ? sessionId : null,
    };
    this.presence.set(participantId, presence);
  }

  getPresence(participantId: string): PresenceState | null {
    return this.presence.get(participantId) || null;
  }

  getAllPresence(): PresenceState[] {
    return Array.from(this.presence.values());
  }

  getOnlineParticipants(): PresenceState[] {
    return Array.from(this.presence.values()).filter(
      (p) => p.status === 'online'
    );
  }

  markOffline(participantId: string): void {
    const existing = this.presence.get(participantId);
    if (!existing) {
      return;
    }
    this.presence.set(participantId, {
      ...existing,
      status: 'offline',
      lastSeen: Date.now(),
    });
  }

  getInactiveParticipants(thresholdMs: number): PresenceState[] {
    const now = Date.now();
    return Array.from(this.presence.values()).filter((p) => {
      return now - p.lastSeen >= thresholdMs;
    });
  }
}