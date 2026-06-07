/**
 * GroupEngine Tests
 * chatdev-design Group Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GroupEngine } from '../GroupEngine';

describe('GroupEngine', () => {
  let gpe: GroupEngine;

  beforeEach(() => {
    gpe = new GroupEngine();
  });

  afterEach(() => {
    gpe.clearAll();
  });

  describe('create / addMember / removeMember / remove', () => {
    it('should create', () => {
      expect(gpe.create('g1')).toMatch(/^gpe-/);
    });

    it('should default type to public', () => {
      gpe.create('g1');
      expect(gpe.getType(gpe.getAllGroups()[0].id)).toBe('public');
    });

    it('should default maxSize to 100', () => {
      gpe.create('g1');
      expect(gpe.getMaxSize(gpe.getAllGroups()[0].id)).toBe(100);
    });

    it('should default members to 0', () => {
      gpe.create('g1');
      expect(gpe.getMembers(gpe.getAllGroups()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      gpe.create('g1');
      expect(gpe.isActive(gpe.getAllGroups()[0].id)).toBe(true);
    });

    it('should add member', () => {
      const id = gpe.create('g1');
      expect(gpe.addMember(id)).toBe(true);
    });

    it('should increment members', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.getMembers(id)).toBe(1);
    });

    it('should not add to full', () => {
      const id = gpe.create('g1', 'public', 1);
      gpe.addMember(id);
      expect(gpe.addMember(id)).toBe(false);
    });

    it('should not add inactive', () => {
      const id = gpe.create('g1');
      gpe.setActive(id, false);
      expect(gpe.addMember(id)).toBe(false);
    });

    it('should return false for unknown addMember', () => {
      expect(gpe.addMember('unknown')).toBe(false);
    });

    it('should remove member', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.removeMember(id)).toBe(true);
    });

    it('should not remove on empty', () => {
      const id = gpe.create('g1');
      expect(gpe.removeMember(id)).toBe(false);
    });

    it('should return false for unknown removeMember', () => {
      expect(gpe.removeMember('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = gpe.create('g1');
      expect(gpe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      gpe.create('g1');
      expect(gpe.getStats().groups).toBe(1);
    });

    it('should count total created', () => {
      gpe.create('g1');
      expect(gpe.getStats().totalCreated).toBe(1);
    });

    it('should count total added', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.getStats().totalAdded).toBe(1);
    });

    it('should count total removed', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      gpe.removeMember(id);
      expect(gpe.getStats().totalRemoved).toBe(1);
    });

    it('should count public', () => {
      gpe.create('g1', 'public');
      expect(gpe.getStats().public).toBe(1);
    });

    it('should count private', () => {
      gpe.create('g1', 'private');
      expect(gpe.getStats().private).toBe(1);
    });

    it('should count secret', () => {
      gpe.create('g1', 'secret');
      expect(gpe.getStats().secret).toBe(1);
    });

    it('should count active', () => {
      gpe.create('g1');
      expect(gpe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = gpe.create('g1');
      gpe.setActive(id, false);
      expect(gpe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      gpe.create('a');
      gpe.create('a');
      expect(gpe.getStats().uniqueNames).toBe(1);
    });

    it('should count total members', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.getStats().totalMembers).toBe(1);
    });

    it('should count total max size', () => {
      gpe.create('g1', 'public', 50);
      expect(gpe.getStats().totalMaxSize).toBe(50);
    });
  });

  describe('queries', () => {
    it('should get group', () => {
      const id = gpe.create('g1');
      expect(gpe.getGroup(id)?.name).toBe('g1');
    });

    it('should get all', () => {
      gpe.create('g1');
      expect(gpe.getAllGroups()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = gpe.create('g1');
      expect(gpe.hasGroup(id)).toBe(true);
    });

    it('should count', () => {
      expect(gpe.getCount()).toBe(0);
      gpe.create('g1');
      expect(gpe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = gpe.create('g1');
      expect(gpe.getName(id)).toBe('g1');
    });

    it('should get hits', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.getHits(id)).toBe(1);
    });

    it('should check public', () => {
      gpe.create('g1', 'public');
      expect(gpe.isPublic(gpe.getAllGroups()[0].id)).toBe(true);
    });

    it('should check private', () => {
      gpe.create('g1', 'private');
      expect(gpe.isPrivate(gpe.getAllGroups()[0].id)).toBe(true);
    });

    it('should check secret', () => {
      gpe.create('g1', 'secret');
      expect(gpe.isSecret(gpe.getAllGroups()[0].id)).toBe(true);
    });

    it('should check full', () => {
      const id = gpe.create('g1', 'public', 1);
      gpe.addMember(id);
      expect(gpe.isFull(id)).toBe(true);
    });

    it('should check empty', () => {
      gpe.create('g1');
      expect(gpe.isEmpty(gpe.getAllGroups()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = gpe.create('g1');
      expect(gpe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = gpe.create('g1');
      expect(gpe.setName(id, 'g2')).toBe(true);
    });

    it('should set type', () => {
      const id = gpe.create('g1');
      expect(gpe.setType(id, 'private')).toBe(true);
    });

    it('should set max size', () => {
      const id = gpe.create('g1');
      expect(gpe.setMaxSize(id, 200)).toBe(true);
    });

    it('should set members', () => {
      const id = gpe.create('g1');
      expect(gpe.setMembers(id, 50)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gpe.setActive('unknown', false)).toBe(false);
      expect(gpe.setName('unknown', 'n')).toBe(false);
      expect(gpe.setType('unknown', 'public')).toBe(false);
      expect(gpe.setMaxSize('unknown', 1)).toBe(false);
      expect(gpe.setMembers('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      gpe.setActive(id, false);
      gpe.resetAll();
      expect(gpe.getMembers(id)).toBe(0);
      expect(gpe.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      gpe.create('g1', 'private');
      expect(gpe.getByType('private')).toHaveLength(1);
    });

    it('should get active', () => {
      gpe.create('g1');
      expect(gpe.getActiveGroups()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = gpe.create('g1');
      gpe.setActive(id, false);
      expect(gpe.getInactiveGroups()).toHaveLength(1);
    });

    it('should get all names', () => {
      gpe.create('a');
      gpe.create('b');
      expect(gpe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      gpe.create('g1');
      expect(gpe.getNewest()?.name).toBe('g1');
    });

    it('should return null for empty newest', () => {
      expect(gpe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      gpe.create('g1');
      expect(gpe.getOldest()?.name).toBe('g1');
    });

    it('should return null for empty oldest', () => {
      expect(gpe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = gpe.create('g1');
      expect(gpe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total created', () => {
      gpe.create('g1');
      expect(gpe.getTotalCreated()).toBe(1);
    });

    it('should get total added', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      expect(gpe.getTotalAdded()).toBe(1);
    });

    it('should get total removed', () => {
      const id = gpe.create('g1');
      gpe.addMember(id);
      gpe.removeMember(id);
      expect(gpe.getTotalRemoved()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many groups', () => {
      for (let i = 0; i < 50; i++) {
        gpe.create(`g${i}`);
      }
      expect(gpe.getCount()).toBe(50);
    });
  });
});