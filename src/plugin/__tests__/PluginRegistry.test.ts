/**
 * PluginRegistry Tests
 * chatdev-design Plugin Registry
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PluginRegistry } from '../PluginRegistry';

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  afterEach(() => {
    registry.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register plugin', () => {
      expect(registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] })).toBe(true);
    });

    it('should reject duplicate', () => {
      registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] });
      expect(registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] })).toBe(false);
    });
  });

  // ============================================================
  // enable / disable
  // ============================================================
  describe('enable / disable', () => {
    it('should enable', () => {
      registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] });
      expect(registry.enable('p1')).toBe(true);
      expect(registry.isEnabled('p1')).toBe(true);
    });

    it('should disable', () => {
      registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] });
      registry.enable('p1');
      expect(registry.disable('p1')).toBe(true);
      expect(registry.isDisabled('p1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(registry.enable('unknown')).toBe(false);
      expect(registry.disable('unknown')).toBe(false);
    });

    it('should toggle', () => {
      registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] });
      expect(registry.toggle('p1')).toBe(true);
      expect(registry.toggle('p1')).toBe(true);
    });
  });

  // ============================================================
  // find / getByName
  // ============================================================
  describe('find / getByName', () => {
    it('should find', () => {
      registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] });
      expect(registry.find('p1')?.name).toBe('test');
    });

    it('should return null for unknown', () => {
      expect(registry.find('unknown')).toBeNull();
    });

    it('should get by name', () => {
      registry.register({ id: 'p1', name: 'test', version: '1.0.0', dependencies: [] });
      expect(registry.getByName('test')?.id).toBe('p1');
    });

    it('should return null for unknown name', () => {
      expect(registry.getByName('unknown')).toBeNull();
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get all', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getAllPlugins()).toHaveLength(1);
    });

    it('should remove', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.removePlugin('p1')).toBe(true);
    });

    it('should check existence', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.hasPlugin('p1')).toBe(true);
    });

    it('should count', () => {
      expect(registry.getCount()).toBe(0);
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getCount()).toBe(1);
    });
  });

  // ============================================================
  // version
  // ============================================================
  describe('version', () => {
    it('should update version', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.updateVersion('p1', '2.0.0')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(registry.updateVersion('unknown', '2.0.0')).toBe(false);
    });

    it('should get version', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getVersion('p1')).toBe('1.0.0');
    });

    it('should get by version', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      registry.register({ id: 'p2', name: 'b', version: '2.0.0', dependencies: [] });
      expect(registry.getByVersion('1.0.0')).toHaveLength(1);
    });

    it('should get all versions', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      registry.register({ id: 'p2', name: 'b', version: '2.0.0', dependencies: [] });
      expect(registry.getAllVersions()).toHaveLength(2);
    });
  });

  // ============================================================
  // dependencies
  // ============================================================
  describe('dependencies', () => {
    it('should add dependency', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.addDependency('p1', 'p2')).toBe(true);
    });

    it('should not add duplicate dependency', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: ['p2'] });
      registry.addDependency('p1', 'p2');
      expect(registry.getDependencies('p1')).toHaveLength(1);
    });

    it('should remove dependency', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: ['p2'] });
      expect(registry.removeDependency('p1', 'p2')).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(registry.removeDependency('p1', 'p2')).toBe(false);
    });

    it('should get dependencies', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: ['p2'] });
      expect(registry.getDependencies('p1')).toEqual(['p2']);
    });

    it('should check hasDependency', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: ['p2'] });
      expect(registry.hasDependency('p1', 'p2')).toBe(true);
    });

    it('should get by dependency', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: ['p2'] });
      expect(registry.getByDependency('p2')).toHaveLength(1);
    });
  });

  // ============================================================
  // enabled/disabled
  // ============================================================
  describe('enabled/disabled', () => {
    it('should get enabled', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      registry.enable('p1');
      expect(registry.getEnabled()).toHaveLength(1);
    });

    it('should get disabled', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getDisabled()).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getCreatedAt('p1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getUpdatedAt('p1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // names
  // ============================================================
  describe('names', () => {
    it('should get all names', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getAllNames()).toContain('a');
    });

    it('should check hasName', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.hasName('a')).toBe(true);
    });

    it('should get by name list', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getByNameList('a')).toHaveLength(1);
    });

    it('should count names', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      expect(registry.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rate / bulk
  // ============================================================
  describe('rate / bulk', () => {
    it('should get enable rate', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      registry.enable('p1');
      expect(registry.getEnableRate()).toBe(1);
    });

    it('should return 0 for empty', () => {
      expect(registry.getEnableRate()).toBe(0);
    });

    it('should enable all', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      registry.register({ id: 'p2', name: 'b', version: '1.0.0', dependencies: [] });
      expect(registry.enableAll()).toBe(2);
    });

    it('should disable all', () => {
      registry.register({ id: 'p1', name: 'a', version: '1.0.0', dependencies: [] });
      registry.enable('p1');
      expect(registry.disableAll()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many plugins', () => {
      for (let i = 0; i < 50; i++) {
        registry.register({ id: `p${i}`, name: `p${i}`, version: '1.0.0', dependencies: [] });
      }
      expect(registry.getCount()).toBe(50);
    });
  });
});