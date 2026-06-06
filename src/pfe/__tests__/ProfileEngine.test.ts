/**
 * ProfileEngine Tests
 * generic-agent-design Profile Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileEngine } from '../ProfileEngine';

describe('ProfileEngine', () => {
  let pfe: ProfileEngine;

  beforeEach(() => {
    pfe = new ProfileEngine();
  });

  afterEach(() => {
    pfe.clearAll();
  });

  // ============================================================
  // create / update / setAttribute / removeAttribute / get / remove
  // ============================================================
  describe('create / update / setAttribute / removeAttribute / get / remove', () => {
    it('should create', () => {
      expect(pfe.create('Alice', 'alice@example.com', 'hello')).toBe('pfe-1');
    });

    it('should default bio to empty', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      expect(pfe.getBio(id)).toBe('');
    });

    it('should mark as active', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      expect(pfe.isActive(id)).toBe(true);
    });

    it('should update', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      expect(pfe.update(id, 'new bio')).toBe(true);
    });

    it('should update bio', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      pfe.update(id, 'new bio');
      expect(pfe.getBio(id)).toBe('new bio');
    });

    it('should not update inactive', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      pfe.setActive(id, false);
      expect(pfe.update(id, 'new')).toBe(false);
    });

    it('should return false for unknown update', () => {
      expect(pfe.update('unknown', 'bio')).toBe(false);
    });

    it('should set attribute', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      expect(pfe.setAttribute(id, 'k1', 'v1')).toBe(true);
    });

    it('should not set attribute on unknown', () => {
      expect(pfe.setAttribute('unknown', 'k1', 'v1')).toBe(false);
    });

    it('should remove attribute', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      pfe.setAttribute(id, 'k1', 'v1');
      expect(pfe.removeAttribute(id, 'k1')).toBe(true);
    });

    it('should not remove missing attribute', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      expect(pfe.removeAttribute(id, 'k1')).toBe(false);
    });

    it('should return false for unknown removeAttribute', () => {
      expect(pfe.removeAttribute('unknown', 'k1')).toBe(false);
    });

    it('should get', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      expect(pfe.get(id)?.name).toBe('Alice');
    });

    it('should not get inactive', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      pfe.setActive(id, false);
      expect(pfe.get(id)).toBeUndefined();
    });

    it('should return undefined for unknown get', () => {
      expect(pfe.get('unknown')).toBeUndefined();
    });

    it('should remove', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      expect(pfe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pfe.create('Alice', 'alice@example.com');
      const stats = pfe.getStats();
      expect(stats.profiles).toBe(1);
    });

    it('should count total created', () => {
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.getStats().totalCreated).toBe(1);
    });

    it('should count total updated', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      pfe.update(id, 'new');
      expect(pfe.getStats().totalUpdated).toBe(1);
    });

    it('should count active', () => {
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      pfe.setActive(id, false);
      expect(pfe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pfe.create('Alice', 'alice@example.com');
      pfe.get(id);
      expect(pfe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pfe.create('Alice', 'a@e.com');
      pfe.create('Alice', 'b@e.com');
      expect(pfe.getStats().uniqueNames).toBe(1);
    });

    it('should count unique emails', () => {
      pfe.create('Alice', 'a@e.com');
      pfe.create('Bob', 'a@e.com');
      expect(pfe.getStats().uniqueEmails).toBe(1);
    });

    it('should compute avg bio length', () => {
      pfe.create('a', 'a@e.com', 'hi');
      expect(pfe.getStats().avgBioLength).toBe(2);
    });

    it('should get max bio length', () => {
      pfe.create('a', 'a@e.com', 'hi');
      pfe.create('b', 'b@e.com', 'hello');
      expect(pfe.getStats().maxBioLength).toBe(5);
    });

    it('should get min bio length', () => {
      pfe.create('a', 'a@e.com', 'hi');
      pfe.create('b', 'b@e.com', 'hello');
      expect(pfe.getStats().minBioLength).toBe(2);
    });

    it('should count total attributes', () => {
      const id = pfe.create('a', 'a@e.com');
      pfe.setAttribute(id, 'k1', 'v1');
      pfe.setAttribute(id, 'k2', 'v2');
      expect(pfe.getStats().totalAttributes).toBe(2);
    });

    it('should count unique attributes', () => {
      const id1 = pfe.create('a', 'a@e.com');
      const id2 = pfe.create('b', 'b@e.com');
      pfe.setAttribute(id1, 'k1', 'v1');
      pfe.setAttribute(id2, 'k1', 'v1');
      expect(pfe.getStats().uniqueAttributes).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get profile', () => {
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.getProfile('pfe-1')?.name).toBe('Alice');
    });

    it('should get all', () => {
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.getAllProfiles()).toHaveLength(1);
    });

    it('should check existence', () => {
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.hasProfile('pfe-1')).toBe(true);
    });

    it('should count', () => {
      expect(pfe.getCount()).toBe(0);
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.getName('pfe-1')).toBe('Alice');
    });

    it('should get email', () => {
      pfe.create('Alice', 'alice@example.com');
      expect(pfe.getEmail('pfe-1')).toBe('alice@example.com');
    });

    it('should get bio length', () => {
      pfe.create('a', 'a@e.com', 'hi');
      expect(pfe.getBioLength('pfe-1')).toBe(2);
    });

    it('should get attributes', () => {
      const id = pfe.create('a', 'a@e.com');
      pfe.setAttribute(id, 'k1', 'v1');
      expect(pfe.getAttributes(id)).toEqual({ k1: 'v1' });
    });

    it('should get attribute count', () => {
      const id = pfe.create('a', 'a@e.com');
      pfe.setAttribute(id, 'k1', 'v1');
      expect(pfe.getAttributeCount(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = pfe.create('a', 'a@e.com');
      pfe.get(id);
      expect(pfe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.setActive('pfe-1', false)).toBe(true);
    });

    it('should set name', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.setName('pfe-1', 'b')).toBe(true);
    });

    it('should set email', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.setEmail('pfe-1', 'b@e.com')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pfe.setActive('unknown', false)).toBe(false);
      expect(pfe.setName('unknown', 'a')).toBe(false);
      expect(pfe.setEmail('unknown', 'a@e.com')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pfe.create('a', 'a@e.com', 'hi');
      pfe.update(id, 'new');
      pfe.setAttribute(id, 'k1', 'v1');
      pfe.setActive(id, false);
      pfe.resetAll();
      expect(pfe.getBio(id)).toBe('');
      expect(pfe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / email / state
  // ============================================================
  describe('by name / email / state', () => {
    it('should get by name', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.getByName('a')).toHaveLength(1);
    });

    it('should get by email', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.getByEmail('a@e.com')).toHaveLength(1);
    });

    it('should get active', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.getActiveProfiles()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pfe.create('a', 'a@e.com');
      pfe.setActive('pfe-1', false);
      expect(pfe.getInactiveProfiles()).toHaveLength(1);
    });

    it('should get all names', () => {
      pfe.create('a', 'a@e.com');
      pfe.create('b', 'b@e.com');
      expect(pfe.getAllNames()).toHaveLength(2);
    });

    it('should get all emails', () => {
      pfe.create('a', 'a@e.com');
      pfe.create('b', 'b@e.com');
      expect(pfe.getAllEmails()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.getNewest()?.id).toBe('pfe-1');
    });

    it('should return null for empty newest', () => {
      expect(pfe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.getOldest()?.id).toBe('pfe-1');
    });

    it('should return null for empty oldest', () => {
      expect(pfe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.getCreatedAt('pfe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pfe.create('a', 'a@e.com');
      pfe.update(id, 'new');
      expect(pfe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total created', () => {
      pfe.create('a', 'a@e.com');
      expect(pfe.getTotalCreated()).toBe(1);
    });

    it('should get total updated', () => {
      const id = pfe.create('a', 'a@e.com');
      pfe.update(id, 'new');
      expect(pfe.getTotalUpdated()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many profiles', () => {
      for (let i = 0; i < 50; i++) {
        pfe.create(`u${i}`, `u${i}@e.com`);
      }
      expect(pfe.getCount()).toBe(50);
    });
  });
});