/**
 * MultiRoleCoordinator Tests
 * chatdev-design Multi-Role Coordinator v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiRoleCoordinator } from '../MultiRoleCoordinator';

describe('MultiRoleCoordinator', () => {
  let coord: MultiRoleCoordinator;

  beforeEach(() => {
    coord = new MultiRoleCoordinator();
  });

  afterEach(() => {
    coord.clearAll();
  });

  // ============================================================
  // addParticipant
  // ============================================================
  describe('addParticipant', () => {
    it('should add participant', () => {
      coord.addParticipant({ id: 'p1', role: 'developer', active: true });
      expect(coord.getParticipantCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const p = { id: 'p1', role: 'developer', active: true };
      coord.addParticipant(p);
      p.role = 'changed';
      expect(coord.getParticipant('p1')?.role).toBe('developer');
    });
  });

  // ============================================================
  // assignRole
  // ============================================================
  describe('assignRole', () => {
    it('should assign role', () => {
      coord.addParticipant({ id: 'p1', role: 'developer', active: true });
      expect(coord.assignRole('p1', 'leader')).toBe(true);
      expect(coord.getParticipant('p1')?.role).toBe('leader');
    });

    it('should return false for unknown', () => {
      expect(coord.assignRole('unknown', 'x')).toBe(false);
    });
  });

  // ============================================================
  // startConversation
  // ============================================================
  describe('startConversation', () => {
    it('should start conversation', () => {
      coord.addParticipant({ id: 'p1', role: 'developer', active: true });
      coord.addParticipant({ id: 'p2', role: 'developer', active: true });
      const id = coord.startConversation(['p1', 'p2']);
      expect(coord.getConversationCount()).toBe(1);
    });

    it('should auto-increment id', () => {
      const id1 = coord.startConversation(['p1']);
      const id2 = coord.startConversation(['p2']);
      expect(id1).toBe('conv-1');
      expect(id2).toBe('conv-2');
    });
  });

  // ============================================================
  // routeMessage
  // ============================================================
  describe('routeMessage', () => {
    it('should route to all participants', () => {
      coord.addParticipant({ id: 'p1', role: 'developer', active: true });
      coord.addParticipant({ id: 'p2', role: 'developer', active: true });
      coord.addParticipant({ id: 'p3', role: 'developer', active: true });
      const convId = coord.startConversation(['p1', 'p2', 'p3']);
      const recipients = coord.routeMessage(convId, 'p1', 'hello');
      expect(recipients).toHaveLength(2);
    });

    it('should return empty for unknown conv', () => {
      expect(coord.routeMessage('unknown', 'p1', 'hi')).toHaveLength(0);
    });

    it('should track message count', () => {
      coord.addParticipant({ id: 'p1', role: 'developer', active: true });
      coord.addParticipant({ id: 'p2', role: 'developer', active: true });
      const convId = coord.startConversation(['p1', 'p2']);
      coord.routeMessage(convId, 'p1', 'hi');
      coord.routeMessage(convId, 'p2', 'hello');
      expect(coord.getMessageCount(convId)).toBe(2);
    });
  });

  // ============================================================
  // resolveConflict
  // ============================================================
  describe('resolveConflict', () => {
    it('should pick higher priority role', () => {
      coord.addParticipant({ id: 'p1', role: 'leader', active: true });
      coord.addParticipant({ id: 'p2', role: 'developer', active: true });
      expect(coord.resolveConflict('p1', 'p2')).toBe('p1');
    });

    it('should pick alphabetically when same role', () => {
      coord.addParticipant({ id: 'p2', role: 'developer', active: true });
      coord.addParticipant({ id: 'p1', role: 'developer', active: true });
      expect(coord.resolveConflict('p2', 'p1')).toBe('p1');
    });

    it('should return null for unknown', () => {
      expect(coord.resolveConflict('unknown', 'p1')).toBeNull();
    });
  });

  // ============================================================
  // getCoordinationScore
  // ============================================================
  describe('getCoordinationScore', () => {
    it('should return 0 for unknown conv', () => {
      expect(coord.getCoordinationScore('unknown')).toBe(0);
    });

    it('should return 0 for empty participants', () => {
      const id = coord.startConversation([]);
      expect(coord.getCoordinationScore(id)).toBe(0);
    });

    it('should calculate score based on active and messages', () => {
      coord.addParticipant({ id: 'p1', role: 'developer', active: true });
      coord.addParticipant({ id: 'p2', role: 'developer', active: true });
      const id = coord.startConversation(['p1', 'p2']);
      coord.routeMessage(id, 'p1', 'hi');
      const score = coord.getCoordinationScore(id);
      expect(score).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // getAllParticipants / getActiveParticipants
  // ============================================================
  describe('filter participants', () => {
    it('should return all participants', () => {
      coord.addParticipant({ id: 'p1', role: 'dev', active: true });
      coord.addParticipant({ id: 'p2', role: 'dev', active: true });
      expect(coord.getAllParticipants()).toHaveLength(2);
    });

    it('should return only active', () => {
      coord.addParticipant({ id: 'p1', role: 'dev', active: true });
      coord.addParticipant({ id: 'p2', role: 'dev', active: false });
      expect(coord.getActiveParticipants()).toHaveLength(1);
    });

    it('should filter by role', () => {
      coord.addParticipant({ id: 'p1', role: 'dev', active: true });
      coord.addParticipant({ id: 'p2', role: 'leader', active: true });
      expect(coord.getParticipantsByRole('dev')).toHaveLength(1);
    });
  });

  // ============================================================
  // pause / resume / complete
  // ============================================================
  describe('conversation status', () => {
    it('should pause active conversation', () => {
      const id = coord.startConversation(['p1']);
      expect(coord.pauseConversation(id)).toBe(true);
      expect(coord.getConversation(id)?.status).toBe('paused');
    });

    it('should resume paused conversation', () => {
      const id = coord.startConversation(['p1']);
      coord.pauseConversation(id);
      expect(coord.resumeConversation(id)).toBe(true);
      expect(coord.getConversation(id)?.status).toBe('active');
    });

    it('should complete conversation', () => {
      const id = coord.startConversation(['p1']);
      expect(coord.completeConversation(id)).toBe(true);
      expect(coord.getConversation(id)?.status).toBe('completed');
    });

    it('should return false for unknown', () => {
      expect(coord.pauseConversation('unknown')).toBe(false);
      expect(coord.resumeConversation('unknown')).toBe(false);
    });
  });

  // ============================================================
  // removeParticipant / setActive
  // ============================================================
  describe('remove / setActive', () => {
    it('should remove participant', () => {
      coord.addParticipant({ id: 'p1', role: 'dev', active: true });
      expect(coord.removeParticipant('p1')).toBe(true);
    });

    it('should set active state', () => {
      coord.addParticipant({ id: 'p1', role: 'dev', active: true });
      expect(coord.setActive('p1', false)).toBe(true);
      expect(coord.getActiveParticipants()).toHaveLength(0);
    });

    it('should return false for unknown', () => {
      expect(coord.removeParticipant('unknown')).toBe(false);
      expect(coord.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // has / count
  // ============================================================
  describe('has / count', () => {
    it('should check participant existence', () => {
      coord.addParticipant({ id: 'p1', role: 'dev', active: true });
      expect(coord.hasParticipant('p1')).toBe(true);
      expect(coord.hasParticipant('unknown')).toBe(false);
    });

    it('should check conversation existence', () => {
      const id = coord.startConversation([]);
      expect(coord.hasConversation(id)).toBe(true);
      expect(coord.hasConversation('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getMessageLog
  // ============================================================
  describe('getMessageLog', () => {
    it('should return message log', () => {
      coord.addParticipant({ id: 'p1', role: 'dev', active: true });
      coord.addParticipant({ id: 'p2', role: 'dev', active: true });
      const id = coord.startConversation(['p1', 'p2']);
      coord.routeMessage(id, 'p1', 'hi');
      const log = coord.getMessageLog(id);
      expect(log).toHaveLength(1);
      expect(log[0].from).toBe('p1');
    });

    it('should return empty for unknown', () => {
      expect(coord.getMessageLog('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many participants', () => {
      for (let i = 0; i < 50; i++) {
        coord.addParticipant({ id: `p${i}`, role: 'dev', active: true });
      }
      expect(coord.getParticipantCount()).toBe(50);
    });

    it('should handle many conversations', () => {
      for (let i = 0; i < 20; i++) {
        coord.startConversation([`p${i}`]);
      }
      expect(coord.getConversationCount()).toBe(20);
    });

    it('should not expose internal arrays', () => {
      const id = coord.startConversation(['p1', 'p2']);
      const log = coord.getMessageLog(id);
      log.push({ from: 'fake', to: 'fake', content: 'fake' });
      expect(coord.getMessageLog(id)).toHaveLength(0);
    });
  });
});