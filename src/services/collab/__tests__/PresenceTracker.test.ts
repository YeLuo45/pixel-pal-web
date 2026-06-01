import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PresenceTracker, PresenceState } from '../PresenceTracker';

describe('PresenceTracker', () => {
  let tracker: PresenceTracker;

  beforeEach(() => {
    tracker = new PresenceTracker();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Status Updates', () => {
    it('should update presence for a participant', () => {
      tracker.updatePresence('user1', 'online');
      const presence = tracker.getPresence('user1');
      expect(presence).toBeDefined();
      expect(presence?.participantId).toBe('user1');
      expect(presence?.status).toBe('online');
    });

    it('should update presence with session ID', () => {
      tracker.updatePresence('user1', 'online', 'session1');
      const presence = tracker.getPresence('user1');
      expect(presence?.sessionId).toBe('session1');
    });

    it('should update status to away', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user1', 'away');
      const presence = tracker.getPresence('user1');
      expect(presence?.status).toBe('away');
    });

    it('should update status to busy', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user1', 'busy');
      const presence = tracker.getPresence('user1');
      expect(presence?.status).toBe('busy');
    });

    it('should update status to offline', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user1', 'offline');
      const presence = tracker.getPresence('user1');
      expect(presence?.status).toBe('offline');
    });

    it('should update lastSeen on status change', () => {
      const before = Date.now();
      tracker.updatePresence('user1', 'online');
      const after = Date.now();
      const presence = tracker.getPresence('user1');
      expect(presence?.lastSeen).toBeGreaterThanOrEqual(before);
      expect(presence?.lastSeen).toBeLessThanOrEqual(after);
    });

    it('should return null for non-existent participant', () => {
      const presence = tracker.getPresence('non-existent');
      expect(presence).toBeNull();
    });
  });

  describe('Bulk Queries', () => {
    it('should get all presence states', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user2', 'away');
      tracker.updatePresence('user3', 'busy');
      
      const all = tracker.getAllPresence();
      expect(all).toHaveLength(3);
    });

    it('should get online participants', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user2', 'away');
      tracker.updatePresence('user3', 'online');
      tracker.updatePresence('user4', 'offline');
      
      const online = tracker.getOnlineParticipants();
      expect(online).toHaveLength(2);
      expect(online.map(p => p.participantId)).toContain('user1');
      expect(online.map(p => p.participantId)).toContain('user3');
    });

    it('should return empty array when no participants', () => {
      const all = tracker.getAllPresence();
      const online = tracker.getOnlineParticipants();
      expect(all).toHaveLength(0);
      expect(online).toHaveLength(0);
    });
  });

  describe('Offline Management', () => {
    it('should mark participant as offline', () => {
      tracker.updatePresence('user1', 'online');
      tracker.markOffline('user1');
      const presence = tracker.getPresence('user1');
      expect(presence?.status).toBe('offline');
    });

    it('should markOffline for non-existent participant', () => {
      // Should not throw
      tracker.markOffline('non-existent');
      const presence = tracker.getPresence('non-existent');
      expect(presence).toBeNull();
    });

    it('should handle multiple markOffline calls', () => {
      tracker.updatePresence('user1', 'online');
      tracker.markOffline('user1');
      tracker.markOffline('user1');
      const presence = tracker.getPresence('user1');
      expect(presence?.status).toBe('offline');
    });
  });

  describe('Inactive Detection', () => {
    it('should detect inactive participants', () => {
      tracker.updatePresence('user1', 'online');
      
      // Simulate time passage by directly manipulating lastSeen
      const oldTime = Date.now() - 60000; // 60 seconds ago
      const presence = tracker.getPresence('user1');
      if (presence) {
        vi.spyOn(presence, 'lastSeen', 'get').mockReturnValue(oldTime);
      }
      
      const inactive = tracker.getInactiveParticipants(30000); // 30 second threshold
      expect(inactive.some(p => p.participantId === 'user1')).toBe(true);
    });

    it('should return empty array when all participants active', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user2', 'online');
      
      const inactive = tracker.getInactiveParticipants(60000); // 60 second threshold
      expect(inactive).toHaveLength(0);
    });

    it('should handle threshold of zero', () => {
      tracker.updatePresence('user1', 'online');
      const inactive = tracker.getInactiveParticipants(0);
      expect(inactive.some(p => p.participantId === 'user1')).toBe(true);
    });

    it('should consider lastSeen timestamp for inactivity', () => {
      // This test verifies that getInactiveParticipants uses lastSeen
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user2', 'online');
      
      // User1's lastSeen is old
      const user1Presence = tracker.getPresence('user1');
      if (user1Presence) {
        Object.defineProperty(user1Presence, 'lastSeen', {
          value: Date.now() - 120000,
          writable: true
        });
      }
      
      const inactive = tracker.getInactiveParticipants(60000);
      expect(inactive.map(p => p.participantId)).toContain('user1');
      expect(inactive.map(p => p.participantId)).not.toContain('user2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle presence update with different statuses', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user1', 'busy');
      tracker.updatePresence('user1', 'away');
      tracker.updatePresence('user1', 'online');
      
      const presence = tracker.getPresence('user1');
      expect(presence?.status).toBe('online');
    });

    it('should set session ID when provided', () => {
      tracker.updatePresence('user1', 'online', 'session1');
      
      const presence = tracker.getPresence('user1');
      expect(presence?.sessionId).toBe('session1');
    });

    it('should handle update with undefined session ID', () => {
      tracker.updatePresence('user1', 'online', 'session1');
      tracker.updatePresence('user1', 'online');
      
      const presence = tracker.getPresence('user1');
      expect(presence?.sessionId).toBeNull();
    });

    it('should track multiple participants independently', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user2', 'away');
      tracker.updatePresence('user3', 'busy');
      
      expect(tracker.getPresence('user1')?.status).toBe('online');
      expect(tracker.getPresence('user2')?.status).toBe('away');
      expect(tracker.getPresence('user3')?.status).toBe('busy');
    });

    it('should handle getOnlineParticipants with mixed statuses', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user2', 'online');
      tracker.updatePresence('user3', 'offline');
      tracker.updatePresence('user4', 'away');
      tracker.updatePresence('user5', 'busy');
      
      const online = tracker.getOnlineParticipants();
      expect(online).toHaveLength(2);
    });

    it('should correctly filter by status in getOnlineParticipants', () => {
      tracker.updatePresence('user1', 'online');
      tracker.updatePresence('user2', 'online');
      
      const online = tracker.getOnlineParticipants();
      online.forEach(p => expect(p.status).toBe('online'));
    });
  });

  describe('Data Consistency', () => {
    it('should preserve lastSeen across multiple updates', () => {
      tracker.updatePresence('user1', 'online');
      const firstLastSeen = tracker.getPresence('user1')?.lastSeen;
      
      // Wait a tiny bit to ensure different timestamp
      const newLastSeen = Date.now();
      tracker.updatePresence('user1', 'away');
      
      // After update, lastSeen should be updated
      const updatedLastSeen = tracker.getPresence('user1')?.lastSeen;
      expect(updatedLastSeen).toBeGreaterThanOrEqual(firstLastSeen!);
    });

    it('should maintain presence data after multiple operations', () => {
      tracker.updatePresence('user1', 'online', 'session1');
      tracker.updatePresence('user2', 'away', 'session1');
      tracker.markOffline('user1');
      tracker.updatePresence('user3', 'busy');
      
      const all = tracker.getAllPresence();
      expect(all).toHaveLength(3);
      
      const user1 = tracker.getPresence('user1');
      expect(user1?.status).toBe('offline');
      
      const user2 = tracker.getPresence('user2');
      expect(user2?.status).toBe('away');
      expect(user2?.sessionId).toBe('session1');
    });
  });
});