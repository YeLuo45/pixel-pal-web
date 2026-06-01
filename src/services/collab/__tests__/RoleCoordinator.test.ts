import { describe, it, expect, beforeEach } from 'vitest';
import { RoleCoordinator, RoleAssignment } from '../RoleCoordinator';

describe('RoleCoordinator', () => {
  let coordinator: RoleCoordinator;

  beforeEach(() => {
    coordinator = new RoleCoordinator();
  });

  describe('Role Assignment', () => {
    it('should assign a role to a participant', () => {
      const assignment = coordinator.assignRole('session1', 'moderator', 'user1');
      expect(assignment).toBeDefined();
      expect(assignment.roleId).toBe('moderator');
      expect(assignment.participantId).toBe('user1');
      expect(assignment.sessionId).toBe('session1');
    });

    it('should track assignment time', () => {
      const before = Date.now();
      const assignment = coordinator.assignRole('session1', 'moderator', 'user1');
      const after = Date.now();
      expect(assignment.assignedAt).toBeGreaterThanOrEqual(before);
      expect(assignment.assignedAt).toBeLessThanOrEqual(after);
    });

    it('should unassign a role', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      const result = coordinator.unassignRole('session1', 'moderator');
      expect(result).toBe(true);
    });

    it('should return false when unassigning non-existent role', () => {
      const result = coordinator.unassignRole('session1', 'non-existent');
      expect(result).toBe(false);
    });

    it('should get all role assignments for a session', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user2');
      coordinator.assignRole('session2', 'moderator', 'user3');
      
      const session1Assignments = coordinator.getRoleAssignments('session1');
      expect(session1Assignments).toHaveLength(2);
      session1Assignments.forEach(a => expect(a.sessionId).toBe('session1'));
    });

    it('should get participant roles for a session', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user1');
      coordinator.assignRole('session1', 'participant', 'user2');
      
      const user1Roles = coordinator.getParticipantRoles('session1', 'user1');
      expect(user1Roles).toHaveLength(2);
      expect(user1Roles.map(r => r.roleId)).toContain('moderator');
      expect(user1Roles.map(r => r.roleId)).toContain('scribe');
    });

    it('should return empty array for participant with no roles', () => {
      const roles = coordinator.getParticipantRoles('session1', 'user1');
      expect(roles).toHaveLength(0);
    });
  });

  describe('Role Switching', () => {
    it('should switch role from one participant to another', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      const result = coordinator.switchRole('session1', 'user1', 'user2');
      expect(result).toBe(true);
      
      const roles = coordinator.getParticipantRoles('session1', 'user2');
      expect(roles.some(r => r.roleId === 'moderator')).toBe(true);
    });

    it('should return false when switching non-existent role', () => {
      const result = coordinator.switchRole('session1', 'user1', 'user2');
      expect(result).toBe(false);
    });

    it('should preserve role metadata on switch', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      const originalAssignment = coordinator.getParticipantRoles('session1', 'user1')[0];
      coordinator.switchRole('session1', 'user1', 'user2');
      
      const newRoles = coordinator.getParticipantRoles('session1', 'user2');
      expect(newRoles.length).toBeGreaterThan(0);
    });

    it('should handle switch when new participant already has role', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user2');
      
      const result = coordinator.switchRole('session1', 'user1', 'user2');
      expect(result).toBe(true);
      
      // User2 should now have both roles
      const user2Roles = coordinator.getParticipantRoles('session1', 'user2');
      expect(user2Roles.some(r => r.roleId === 'moderator')).toBe(true);
      expect(user2Roles.some(r => r.roleId === 'scribe')).toBe(true);
    });
  });

  describe('Available Roles', () => {
    it('should return occupied roles for a session', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user2');
      coordinator.assignRole('session2', 'moderator', 'user3');
      
      const occupied = coordinator.getOccupiedRoles('session1');
      expect(occupied).toHaveLength(2);
      occupied.forEach(a => expect(a.sessionId).toBe('session1'));
    });

    it('should return empty array for session with no assignments', () => {
      const occupied = coordinator.getOccupiedRoles('session1');
      expect(occupied).toHaveLength(0);
    });

    it('should get available (unassigned) roles', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user2');
      // All roles: moderator, scribe, participant, observer
      const available = coordinator.getAvailableRoles('session1');
      expect(available).toContain('participant');
      expect(available).toContain('observer');
      expect(available).not.toContain('moderator');
      expect(available).not.toContain('scribe');
    });

    it('should return all roles as available when none assigned', () => {
      const available = coordinator.getAvailableRoles('session1');
      expect(available.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple sessions independently', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session2', 'scribe', 'user2');
      
      const session1Roles = coordinator.getRoleAssignments('session1');
      const session2Roles = coordinator.getRoleAssignments('session2');
      
      expect(session1Roles).toHaveLength(1);
      expect(session2Roles).toHaveLength(1);
      expect(session1Roles[0].roleId).toBe('moderator');
      expect(session2Roles[0].roleId).toBe('scribe');
    });

    it('should handle same role assigned to multiple participants', () => {
      coordinator.assignRole('session1', 'participant', 'user1');
      coordinator.assignRole('session1', 'participant', 'user2');
      
      const assignments = coordinator.getRoleAssignments('session1');
      expect(assignments.filter(a => a.roleId === 'participant')).toHaveLength(2);
    });

    it('should handle unassigning from session with no assignments', () => {
      const result = coordinator.unassignRole('session1', 'moderator');
      expect(result).toBe(false);
    });

    it('should handle switching role in non-existent session', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      const result = coordinator.switchRole('session2', 'user1', 'user2');
      expect(result).toBe(false);
    });

    it('should handle switch when old participant does not have role', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      const result = coordinator.switchRole('session1', 'user2', 'user3');
      expect(result).toBe(false);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain assignment count consistency', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user2');
      coordinator.assignRole('session1', 'participant', 'user3');
      
      const assignments = coordinator.getRoleAssignments('session1');
      expect(assignments).toHaveLength(3);
    });

    it('should handle role unassignment correctly', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user2');
      
      coordinator.unassignRole('session1', 'moderator');
      
      const remaining = coordinator.getRoleAssignments('session1');
      expect(remaining).toHaveLength(1);
      expect(remaining[0].roleId).toBe('scribe');
    });

    it('should correctly report participant roles after operations', () => {
      coordinator.assignRole('session1', 'moderator', 'user1');
      coordinator.assignRole('session1', 'scribe', 'user1');
      
      coordinator.unassignRole('session1', 'moderator');
      
      const roles = coordinator.getParticipantRoles('session1', 'user1');
      expect(roles).toHaveLength(1);
      expect(roles[0].roleId).toBe('scribe');
    });
  });
});