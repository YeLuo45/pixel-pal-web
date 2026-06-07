/**
 * HashEngine Tests
 * claude-code-design Hash Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HashEngine } from '../HashEngine';

describe('HashEngine', () => {
  let hse: HashEngine;

  beforeEach(() => {
    hse = new HashEngine();
  });

  afterEach(() => {
    hse.clearAll();
  });

  describe('hash / verify / recompute / remove', () => {
    it('should hash', () => {
      expect(hse.hash('hello')).toMatch(/^hse-/);
    });

    it('should default algo to sha256', () => {
      hse.hash('hello');
      expect(hse.getAlgo(hse.getAllHashes()[0].id)).toBe('sha256');
    });

    it('should set hash value', () => {
      hse.hash('hello');
      const h = hse.getAllHashes()[0].hash;
      expect(h).toHaveLength(64);
    });

    it('should mark as active', () => {
      hse.hash('hello');
      expect(hse.isActive(hse.getAllHashes()[0].id)).toBe(true);
    });

    it('should verify', () => {
      const id = hse.hash('hello');
      expect(hse.verify(id, 'hello')).toBe(true);
    });

    it('should not verify different input', () => {
      const id = hse.hash('hello');
      expect(hse.verify(id, 'world')).toBe(false);
    });

    it('should not verify inactive', () => {
      const id = hse.hash('hello');
      hse.setActive(id, false);
      expect(hse.verify(id, 'hello')).toBe(false);
    });

    it('should return false for unknown verify', () => {
      expect(hse.verify('unknown', 'hello')).toBe(false);
    });

    it('should recompute', () => {
      const id = hse.hash('hello');
      expect(hse.recompute(id, 'world')).toBe(true);
    });

    it('should return false for unknown recompute', () => {
      expect(hse.recompute('unknown', 'x')).toBe(false);
    });

    it('should remove', () => {
      const id = hse.hash('hello');
      expect(hse.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      hse.hash('hello');
      expect(hse.getStats().hashes).toBe(1);
    });

    it('should count total hashed', () => {
      hse.hash('hello');
      expect(hse.getStats().totalHashed).toBe(1);
    });

    it('should count total verified', () => {
      const id = hse.hash('hello');
      hse.verify(id, 'hello');
      expect(hse.getStats().totalVerified).toBe(1);
    });

    it('should count md5', () => {
      hse.hash('a', 'md5');
      expect(hse.getStats().md5).toBe(1);
    });

    it('should count sha1', () => {
      hse.hash('a', 'sha1');
      expect(hse.getStats().sha1).toBe(1);
    });

    it('should count sha256', () => {
      hse.hash('a', 'sha256');
      expect(hse.getStats().sha256).toBe(1);
    });

    it('should count sha512', () => {
      hse.hash('a', 'sha512');
      expect(hse.getStats().sha512).toBe(1);
    });

    it('should count active', () => {
      hse.hash('hello');
      expect(hse.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = hse.hash('hello');
      hse.setActive(id, false);
      expect(hse.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = hse.hash('hello');
      hse.verify(id, 'hello');
      expect(hse.getStats().totalHits).toBe(1);
    });

    it('should count unique inputs', () => {
      hse.hash('a');
      hse.hash('a');
      expect(hse.getStats().uniqueInputs).toBe(1);
    });

    it('should count unique hashes', () => {
      hse.hash('a');
      hse.hash('b');
      expect(hse.getStats().uniqueHashes).toBe(2);
    });

    it('should count total length', () => {
      hse.hash('hello');
      expect(hse.getStats().totalLength).toBe(5);
    });
  });

  describe('queries', () => {
    it('should get hash', () => {
      const id = hse.hash('hello');
      expect(hse.getHash(id)?.input).toBe('hello');
    });

    it('should get all', () => {
      hse.hash('hello');
      expect(hse.getAllHashes()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = hse.hash('hello');
      expect(hse.hasHash(id)).toBe(true);
    });

    it('should count', () => {
      expect(hse.getCount()).toBe(0);
      hse.hash('hello');
      expect(hse.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get input', () => {
      const id = hse.hash('hello');
      expect(hse.getInput(id)).toBe('hello');
    });

    it('should get hash value', () => {
      const id = hse.hash('hello');
      expect(hse.getHash2(id)).toHaveLength(64);
    });

    it('should get length', () => {
      const id = hse.hash('hello');
      expect(hse.getLength(id)).toBe(5);
    });

    it('should get hits', () => {
      const id = hse.hash('hello');
      hse.verify(id, 'hello');
      expect(hse.getHits(id)).toBe(1);
    });

    it('should check md5', () => {
      hse.hash('a', 'md5');
      expect(hse.isMd5(hse.getAllHashes()[0].id)).toBe(true);
    });

    it('should check sha1', () => {
      hse.hash('a', 'sha1');
      expect(hse.isSha1(hse.getAllHashes()[0].id)).toBe(true);
    });

    it('should check sha256', () => {
      hse.hash('a', 'sha256');
      expect(hse.isSha256(hse.getAllHashes()[0].id)).toBe(true);
    });

    it('should check sha512', () => {
      hse.hash('a', 'sha512');
      expect(hse.isSha512(hse.getAllHashes()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = hse.hash('hello');
      expect(hse.setActive(id, false)).toBe(true);
    });

    it('should set algo', () => {
      const id = hse.hash('hello');
      expect(hse.setAlgo(id, 'md5')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hse.setActive('unknown', false)).toBe(false);
      expect(hse.setAlgo('unknown', 'md5')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = hse.hash('hello');
      hse.setActive(id, false);
      hse.resetAll();
      expect(hse.isActive(id)).toBe(true);
    });
  });

  describe('by algo / state', () => {
    it('should get by algo', () => {
      hse.hash('a', 'md5');
      expect(hse.getByAlgo('md5')).toHaveLength(1);
    });

    it('should get active', () => {
      hse.hash('hello');
      expect(hse.getActiveHashes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = hse.hash('hello');
      hse.setActive(id, false);
      expect(hse.getInactiveHashes()).toHaveLength(1);
    });

    it('should get all inputs', () => {
      hse.hash('a');
      hse.hash('b');
      expect(hse.getAllInputs()).toHaveLength(2);
    });

    it('should get all hash strings', () => {
      hse.hash('a');
      hse.hash('b');
      expect(hse.getAllHashStrings()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      hse.hash('hello');
      expect(hse.getNewest()?.input).toBe('hello');
    });

    it('should return null for empty newest', () => {
      expect(hse.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      hse.hash('hello');
      expect(hse.getOldest()?.input).toBe('hello');
    });

    it('should return null for empty oldest', () => {
      expect(hse.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = hse.hash('hello');
      expect(hse.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = hse.hash('hello');
      hse.verify(id, 'hello');
      expect(hse.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total hashed', () => {
      hse.hash('hello');
      expect(hse.getTotalHashed()).toBe(1);
    });

    it('should get total verified', () => {
      const id = hse.hash('hello');
      hse.verify(id, 'hello');
      expect(hse.getTotalVerified()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many hashes', () => {
      for (let i = 0; i < 50; i++) {
        hse.hash(`text${i}`);
      }
      expect(hse.getCount()).toBe(50);
    });
  });
});