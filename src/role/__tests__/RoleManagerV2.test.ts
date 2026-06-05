/**
 * RoleManagerV2 Tests
 * chatdev-design Role Manager v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoleManagerV2 } from '../RoleManagerV2';

describe('RoleManagerV2', () => {
  let manager: RoleManagerV2;

  beforeEach(() => {
    manager = new RoleManagerV2();
  });

  afterEach(() => {
    manager.clearAll();
  });

  // ============================================================
  // createRole
  // ============================================================
  describe('createRole', () => {
    it('should create role', () => {
      const id = manager.createRole({ name: 'admin', capabilities: ['x'], status: 'active', created: 0, updated: 0 });
      expect(id).toBe('role-1');
    });

    it('should not mutate input', () => {
      const caps = ['a'];
      manager.createRole({ name: 'admin', capabilities: caps, status: 'active', created: 0, updated: 0 });
      caps.push('b');
      expect(manager.getRole('role-1')?.capabilities).toEqual(['a']);
    });
  });

  // ============================================================
  // activate / deactivate / deprecate
  // ============================================================
  describe('activate / deactivate / deprecate', () => {
    it('should activate', () => {
      const id = manager.createRole({ name: 'a', capabilities: [], status: 'inactive', created: 0, updated: 0 });
      expect(manager.activate(id)).toBe(true);
      expect(manager.getRole(id)?.status).toBe('active');
    });

    it('should deactivate', () => {
      const id = manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.deactivate(id)).toBe(true);
    });

    it('should deprecate', () => {
      const id = manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.deprecate(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(manager.activate('unknown')).toBe(false);
      expect(manager.deactivate('unknown')).toBe(false);
      expect(manager.deprecate('unknown')).toBe(false);
    });
  });

  // ============================================================
  // sync
  // ============================================================
  describe('sync', () => {
    it('should sync capabilities', () => {
      const id = manager.createRole({ name: 'a', capabilities: ['x'], status: 'active', created: 0, updated: 0 });
      expect(manager.sync(id, ['y', 'z'])).toBe(true);
      expect(manager.getCapabilities(id)).toEqual(['y', 'z']);
    });

    it('should return false for unknown', () => {
      expect(manager.sync('unknown', ['x'])).toBe(false);
    });

    it('should track version on sync', () => {
      const id = manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      const v1 = manager.getVersion(id);
      manager.sync(id, ['x']);
      expect(manager.getVersion(id)).toBe(v1 + 1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      manager.createRole({ name: 'b', capabilities: [], status: 'inactive', created: 0, updated: 0 });
      const stats = manager.getStats();
      expect(stats.total).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.inactive).toBe(1);
    });
  });

  // ============================================================
  // role queries
  // ============================================================
  describe('role queries', () => {
    it('should get role', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.getRole('role-1')?.name).toBe('a');
    });

    it('should get all', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.getAllRoles()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.removeRole(id)).toBe(true);
    });

    it('should check existence', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.hasRole('role-1')).toBe(true);
    });
  });

  // ============================================================
  // status filters
  // ============================================================
  describe('status filters', () => {
    it('should get active', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.getActive()).toHaveLength(1);
    });

    it('should get inactive', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'inactive', created: 0, updated: 0 });
      expect(manager.getInactive()).toHaveLength(1);
    });

    it('should get deprecated', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'deprecated', created: 0, updated: 0 });
      expect(manager.getDeprecated()).toHaveLength(1);
    });

    it('should get by status', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.getByStatus('active')).toHaveLength(1);
    });
  });

  // ============================================================
  // getByName / getCapabilities
  // ============================================================
  describe('getByName / getCapabilities', () => {
    it('should get by name', () => {
      manager.createRole({ name: 'admin', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.getByName('admin')?.id).toBe('role-1');
    });

    it('should return undefined for unknown', () => {
      expect(manager.getByName('unknown')).toBeUndefined();
    });

    it('should get capabilities', () => {
      manager.createRole({ name: 'a', capabilities: ['x', 'y'], status: 'active', created: 0, updated: 0 });
      expect(manager.getCapabilities('role-1')).toEqual(['x', 'y']);
    });
  });

  // ============================================================
  // addCapability / removeCapability
  // ============================================================
  describe('addCapability / removeCapability', () => {
    it('should add capability', () => {
      const id = manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.addCapability(id, 'x')).toBe(true);
    });

    it('should not add duplicate', () => {
      const id = manager.createRole({ name: 'a', capabilities: ['x'], status: 'active', created: 0, updated: 0 });
      manager.addCapability(id, 'x');
      expect(manager.getCapabilities(id)).toHaveLength(1);
    });

    it('should remove capability', () => {
      const id = manager.createRole({ name: 'a', capabilities: ['x'], status: 'active', created: 0, updated: 0 });
      expect(manager.removeCapability(id, 'x')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(manager.addCapability('unknown', 'x')).toBe(false);
      expect(manager.removeCapability('unknown', 'x')).toBe(false);
    });
  });

  // ============================================================
  // history / version / rollback
  // ============================================================
  describe('history / version / rollback', () => {
    it('should track history on update', () => {
      const id = manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      manager.activate(id);
      expect(manager.getHistoryCount(id)).toBe(1);
    });

    it('should get version', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      expect(manager.getVersion('role-1')).toBe(1);
    });

    it('should rollback', () => {
      const id = manager.createRole({ name: 'a', capabilities: ['x'], status: 'active', created: 0, updated: 0 });
      manager.sync(id, ['y']);
      expect(manager.rollback(id, 1)).toBe(true);
    });

    it('should return false for unknown rollback', () => {
      expect(manager.rollback('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      const before = Date.now();
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      const after = Date.now();
      const created = manager.getCreatedAt('role-1');
      expect(created).toBeGreaterThanOrEqual(before);
      expect(created).toBeLessThanOrEqual(after);
    });

    it('should get updated at', () => {
      manager.createRole({ name: 'a', capabilities: [], status: 'active', created: 0, updated: 0 });
      const updated = manager.getUpdatedAt('role-1');
      expect(updated).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many roles', () => {
      for (let i = 0; i < 50; i++) {
        manager.createRole({ name: `r${i}`, capabilities: [], status: 'active', created: 0, updated: 0 });
      }
      expect(manager.getCount()).toBe(50);
    });
  });
});