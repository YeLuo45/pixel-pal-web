/**
 * PermissionManager Tests
 * chatdev-design Permission Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PermissionManager } from '../PermissionManager';

describe('PermissionManager', () => {
  let manager: PermissionManager;

  beforeEach(() => {
    manager = new PermissionManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  // ============================================================
  // addRole
  // ============================================================
  describe('addRole', () => {
    it('should add role', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      expect(manager.getRoleCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const perms = [{ resource: 'r', action: 'a' }];
      manager.addRole({ name: 'admin', permissions: perms });
      perms.push({ resource: 'x', action: 'y' });
      expect(manager.getPermissionsOfRole('admin')).toHaveLength(1);
    });
  });

  // ============================================================
  // grant
  // ============================================================
  describe('grant', () => {
    it('should grant permission', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      expect(manager.grant('admin', { resource: 'r', action: 'a' })).toBe(true);
    });

    it('should not duplicate', () => {
      manager.addRole({ name: 'admin', permissions: [{ resource: 'r', action: 'a' }] });
      manager.grant('admin', { resource: 'r', action: 'a' });
      expect(manager.getPermissionsOfRole('admin')).toHaveLength(1);
    });

    it('should return false for unknown role', () => {
      expect(manager.grant('unknown', { resource: 'r', action: 'a' })).toBe(false);
    });
  });

  // ============================================================
  // revoke
  // ============================================================
  describe('revoke', () => {
    it('should revoke permission', () => {
      manager.addRole({ name: 'admin', permissions: [{ resource: 'r', action: 'a' }] });
      expect(manager.revoke('admin', { resource: 'r', action: 'a' })).toBe(true);
    });

    it('should return false for missing', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      expect(manager.revoke('admin', { resource: 'r', action: 'a' })).toBe(false);
    });

    it('should return false for unknown role', () => {
      expect(manager.revoke('unknown', { resource: 'r', action: 'a' })).toBe(false);
    });
  });

  // ============================================================
  // check
  // ============================================================
  describe('check', () => {
    it('should check direct permission', () => {
      manager.addRole({ name: 'admin', permissions: [{ resource: 'r', action: 'a' }] });
      expect(manager.check('admin', { resource: 'r', action: 'a' })).toBe(true);
    });

    it('should check inherited permission', () => {
      manager.addRole({ name: 'super', permissions: [{ resource: 'r', action: 'a' }] });
      manager.addRole({ name: 'admin', permissions: [], parent: 'super' });
      expect(manager.check('admin', { resource: 'r', action: 'a' })).toBe(true);
    });

    it('should return false for missing', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      expect(manager.check('admin', { resource: 'r', action: 'a' })).toBe(false);
    });

    it('should return false for unknown role', () => {
      expect(manager.check('unknown', { resource: 'r', action: 'a' })).toBe(false);
    });
  });

  // ============================================================
  // getAuditLog
  // ============================================================
  describe('audit log', () => {
    it('should track grant', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      manager.grant('admin', { resource: 'r', action: 'a' });
      expect(manager.getAuditCount()).toBe(1);
    });

    it('should track denied', () => {
      manager.grant('unknown', { resource: 'r', action: 'a' });
      expect(manager.getDeniedAuditCount()).toBe(1);
    });

    it('should get granted count', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      manager.grant('admin', { resource: 'r', action: 'a' });
      expect(manager.getGrantedAuditCount()).toBe(1);
    });

    it('should get audit by role', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      manager.grant('admin', { resource: 'r', action: 'a' });
      expect(manager.getAuditByRole('admin')).toHaveLength(1);
    });

    it('should clear audit', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      manager.grant('admin', { resource: 'r', action: 'a' });
      manager.clearAuditLog();
      expect(manager.getAuditCount()).toBe(0);
    });
  });

  // ============================================================
  // role queries
  // ============================================================
  describe('role queries', () => {
    it('should get role', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      expect(manager.getRole('admin')?.name).toBe('admin');
    });

    it('should get all', () => {
      manager.addRole({ name: 'a', permissions: [] });
      manager.addRole({ name: 'b', permissions: [] });
      expect(manager.getAllRoles()).toHaveLength(2);
    });

    it('should remove role', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      expect(manager.removeRole('admin')).toBe(true);
    });

    it('should check existence', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      expect(manager.hasRole('admin')).toBe(true);
    });
  });

  // ============================================================
  // permission queries
  // ============================================================
  describe('permission queries', () => {
    it('should get permissions of role', () => {
      manager.addRole({ name: 'admin', permissions: [{ resource: 'r', action: 'a' }] });
      expect(manager.getPermissionsOfRole('admin')).toHaveLength(1);
    });

    it('should get all unique permissions', () => {
      manager.addRole({ name: 'a', permissions: [{ resource: 'r', action: 'a' }] });
      manager.addRole({ name: 'b', permissions: [{ resource: 'r', action: 'a' }, { resource: 'x', action: 'y' }] });
      expect(manager.getAllPermissions()).toHaveLength(2);
    });

    it('should get roles with permission', () => {
      manager.addRole({ name: 'a', permissions: [{ resource: 'r', action: 'a' }] });
      manager.addRole({ name: 'b', permissions: [] });
      expect(manager.getRolesWithPermission({ resource: 'r', action: 'a' })).toEqual(['a']);
    });
  });

  // ============================================================
  // inheritance
  // ============================================================
  describe('inheritance', () => {
    it('should set parent', () => {
      manager.addRole({ name: 'admin', permissions: [] });
      manager.addRole({ name: 'super', permissions: [] });
      expect(manager.setParent('admin', 'super')).toBe(true);
    });

    it('should get parent', () => {
      manager.addRole({ name: 'admin', permissions: [], parent: 'super' });
      expect(manager.getParent('admin')).toBe('super');
    });

    it('should get child roles', () => {
      manager.addRole({ name: 'super', permissions: [] });
      manager.addRole({ name: 'admin', permissions: [], parent: 'super' });
      expect(manager.getChildRoles('super')).toContain('admin');
    });

    it('should get effective permissions', () => {
      manager.addRole({ name: 'super', permissions: [{ resource: 'r1', action: 'a' }] });
      manager.addRole({ name: 'admin', permissions: [{ resource: 'r2', action: 'a' }], parent: 'super' });
      const perms = manager.getEffectivePermissions('admin');
      expect(perms).toHaveLength(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many roles', () => {
      for (let i = 0; i < 50; i++) {
        manager.addRole({ name: `r${i}`, permissions: [] });
      }
      expect(manager.getRoleCount()).toBe(50);
    });
  });
});