/**
 * RoleCoordinator Tests
 * chatdev-design Role Coordinator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoleCoordinator } from '../RoleCoordinator';

describe('RoleCoordinator', () => {
  let rc: RoleCoordinator;

  beforeEach(() => {
    rc = new RoleCoordinator();
  });

  afterEach(() => {
    rc.clearAll();
  });

  // ============================================================
  // register / assign / release
  // ============================================================
  describe('register / assign / release', () => {
    it('should register', () => {
      expect(rc.register('developer', ['code'])).toBe('role-1');
    });

    it('should assign', () => {
      const id = rc.register('developer', ['code']);
      expect(rc.assign(id, 'alice')).toBe(true);
    });

    it('should not assign already assigned', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.assign(id, 'bob')).toBe(false);
    });

    it('should release', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.release(id)).toBe(true);
    });

    it('should not release unassigned', () => {
      const id = rc.register('developer', ['code']);
      expect(rc.release(id)).toBe(false);
    });

    it('should return false for unknown assign', () => {
      expect(rc.assign('unknown', 'alice')).toBe(false);
    });

    it('should return false for unknown release', () => {
      expect(rc.release('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rc.register('developer', ['code']);
      const stats = rc.getStats();
      expect(stats.roles).toBe(1);
    });

    it('should count assigned', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.getStats().assigned).toBe(1);
    });

    it('should count available', () => {
      rc.register('developer', ['code']);
      expect(rc.getStats().available).toBe(1);
    });

    it('should count active', () => {
      rc.register('developer', ['code']);
      expect(rc.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rc.register('developer', ['code']);
      rc.setActive(id, false);
      expect(rc.getStats().inactive).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get role', () => {
      rc.register('developer', ['code']);
      expect(rc.getRole('role-1')?.name).toBe('developer');
    });

    it('should get all', () => {
      rc.register('developer', ['code']);
      expect(rc.getAllRoles()).toHaveLength(1);
    });

    it('should remove', () => {
      rc.register('developer', ['code']);
      expect(rc.removeRole('role-1')).toBe(true);
    });

    it('should check existence', () => {
      rc.register('developer', ['code']);
      expect(rc.hasRole('role-1')).toBe(true);
    });

    it('should count', () => {
      expect(rc.getCount()).toBe(0);
      rc.register('developer', ['code']);
      expect(rc.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      rc.register('developer', ['code']);
      expect(rc.getName('role-1')).toBe('developer');
    });

    it('should get capabilities', () => {
      rc.register('developer', ['code', 'test']);
      expect(rc.getCapabilities('role-1')).toEqual(['code', 'test']);
    });

    it('should get assigned', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.getAssigned(id)).toBe('alice');
    });

    it('should check isAssigned', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.isAssigned(id)).toBe(true);
    });

    it('should check isAvailable', () => {
      rc.register('developer', ['code']);
      expect(rc.isAvailable('role-1')).toBe(true);
    });
  });

  // ============================================================
  // capabilities
  // ============================================================
  describe('capabilities', () => {
    it('should check hasCapability', () => {
      rc.register('developer', ['code']);
      expect(rc.hasCapability('role-1', 'code')).toBe(true);
    });

    it('should add capability', () => {
      rc.register('developer', ['code']);
      expect(rc.addCapability('role-1', 'test')).toBe(true);
    });

    it('should remove capability', () => {
      rc.register('developer', ['code', 'test']);
      expect(rc.removeCapability('role-1', 'code')).toBe(true);
    });

    it('should return false for unknown add', () => {
      expect(rc.addCapability('unknown', 'a')).toBe(false);
    });

    it('should return false for unknown remove', () => {
      expect(rc.removeCapability('unknown', 'a')).toBe(false);
    });

    it('should return false for missing remove', () => {
      rc.register('developer', ['code']);
      expect(rc.removeCapability('role-1', 'missing')).toBe(false);
    });

    it('should count capabilities', () => {
      rc.register('developer', ['code', 'test']);
      expect(rc.getCapabilityCount('role-1')).toBe(2);
    });
  });

  // ============================================================
  // active
  // ============================================================
  describe('active', () => {
    it('should check isActive', () => {
      rc.register('developer', ['code']);
      expect(rc.isActive('role-1')).toBe(true);
    });

    it('should set active', () => {
      rc.register('developer', ['code']);
      expect(rc.setActive('role-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rc.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // by name / member / capability
  // ============================================================
  describe('by name / member / capability', () => {
    it('should get by name', () => {
      rc.register('developer', ['code']);
      expect(rc.getByName('developer')).toHaveLength(1);
    });

    it('should get by member', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.getByMember('alice')).toHaveLength(1);
    });

    it('should get by capability', () => {
      rc.register('developer', ['code']);
      expect(rc.getByCapability('code')).toHaveLength(1);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get assigned roles', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.getAssignedRoles()).toHaveLength(1);
    });

    it('should get available roles', () => {
      rc.register('developer', ['code']);
      expect(rc.getAvailableRoles()).toHaveLength(1);
    });

    it('should get active roles', () => {
      rc.register('developer', ['code']);
      expect(rc.getActiveRoles()).toHaveLength(1);
    });

    it('should get inactive roles', () => {
      const id = rc.register('developer', ['code']);
      rc.setActive(id, false);
      expect(rc.getInactiveRoles()).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      rc.register('developer', ['code']);
      expect(rc.getCreatedAt('role-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      rc.register('developer', ['code']);
      expect(rc.getUpdatedAt('role-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // members
  // ============================================================
  describe('members', () => {
    it('should get all members', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.getAllMembers()).toEqual(['alice']);
    });

    it('should get member count', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.getMemberCount()).toBe(1);
    });

    it('should count roles for member', () => {
      const id = rc.register('developer', ['code']);
      rc.assign(id, 'alice');
      expect(rc.getRolesForMember('alice')).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many roles', () => {
      for (let i = 0; i < 50; i++) {
        rc.register(`r${i}`, ['c']);
      }
      expect(rc.getCount()).toBe(50);
    });
  });
});