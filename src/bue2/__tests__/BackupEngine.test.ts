/**
 * BackupEngine Tests
 * thunderbolt-design Backup Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BackupEngine } from '../BackupEngine';

describe('BackupEngine', () => {
  let bue2: BackupEngine;

  beforeEach(() => {
    bue2 = new BackupEngine();
  });

  afterEach(() => {
    bue2.clearAll();
  });

  describe('create / complete / restore / verify / fail / remove', () => {
    it('should create', () => {
      expect(bue2.create('b1', 100)).toMatch(/^bue2-/);
    });

    it('should default status to pending', () => {
      bue2.create('b1', 100);
      expect(bue2.getStatus(bue2.getAllBackups()[0].id)).toBe('pending');
    });

    it('should mark as active', () => {
      bue2.create('b1', 100);
      expect(bue2.isActive(bue2.getAllBackups()[0].id)).toBe(true);
    });

    it('should complete', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.complete(id)).toBe(true);
    });

    it('should set completed', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.isCompleted(id)).toBe(true);
    });

    it('should not complete inactive', () => {
      const id = bue2.create('b1', 100);
      bue2.setActive(id, false);
      expect(bue2.complete(id)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(bue2.complete('unknown')).toBe(false);
    });

    it('should restore', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.restore(id)).toBe(true);
    });

    it('should not restore pending', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.restore(id)).toBe(false);
    });

    it('should return false for unknown restore', () => {
      expect(bue2.restore('unknown')).toBe(false);
    });

    it('should verify', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.verify(id)).toBe(true);
    });

    it('should set verified', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.verify(id);
      expect(bue2.isVerified(id)).toBe(true);
    });

    it('should not verify pending', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.verify(id)).toBe(false);
    });

    it('should return false for unknown verify', () => {
      expect(bue2.verify('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.fail(id)).toBe(true);
    });

    it('should set failed', () => {
      const id = bue2.create('b1', 100);
      bue2.fail(id);
      expect(bue2.isFailed(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(bue2.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      bue2.create('b1', 100);
      expect(bue2.getStats().backups).toBe(1);
    });

    it('should count total created', () => {
      bue2.create('b1', 100);
      expect(bue2.getStats().totalCreated).toBe(1);
    });

    it('should count total restored', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.restore(id);
      expect(bue2.getStats().totalRestored).toBe(1);
    });

    it('should count total verified', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.verify(id);
      expect(bue2.getStats().totalVerified).toBe(1);
    });

    it('should count total failed', () => {
      const id = bue2.create('b1', 100);
      bue2.fail(id);
      expect(bue2.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      bue2.create('b1', 100);
      expect(bue2.getStats().pending).toBe(1);
    });

    it('should count completed', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.getStats().completed).toBe(1);
    });

    it('should count failed', () => {
      const id = bue2.create('b1', 100);
      bue2.fail(id);
      expect(bue2.getStats().failed).toBe(1);
    });

    it('should count verified', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.verify(id);
      expect(bue2.getStats().verified).toBe(1);
    });

    it('should count active', () => {
      bue2.create('b1', 100);
      expect(bue2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bue2.create('b1', 100);
      bue2.setActive(id, false);
      expect(bue2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      bue2.create('a', 100);
      bue2.create('a', 100);
      expect(bue2.getStats().uniqueNames).toBe(1);
    });

    it('should count total size', () => {
      bue2.create('a', 100);
      expect(bue2.getStats().totalSize).toBe(100);
    });
  });

  describe('queries', () => {
    it('should get backup', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.getBackup(id)?.name).toBe('b1');
    });

    it('should get all', () => {
      bue2.create('b1', 100);
      expect(bue2.getAllBackups()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.hasBackup(id)).toBe(true);
    });

    it('should count', () => {
      expect(bue2.getCount()).toBe(0);
      bue2.create('b1', 100);
      expect(bue2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.getName(id)).toBe('b1');
    });

    it('should get size', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.getSize(id)).toBe(100);
    });

    it('should get hits', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.getHits(id)).toBe(1);
    });

    it('should check completed', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.isCompleted(id)).toBe(true);
    });

    it('should check verified', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.verify(id);
      expect(bue2.isVerified(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = bue2.create('b1', 100);
      bue2.fail(id);
      expect(bue2.isFailed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.setName(id, 'b2')).toBe(true);
    });

    it('should set size', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.setSize(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bue2.setActive('unknown', false)).toBe(false);
      expect(bue2.setName('unknown', 'b')).toBe(false);
      expect(bue2.setSize('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.setActive(id, false);
      bue2.resetAll();
      expect(bue2.isPending(id)).toBe(true);
      expect(bue2.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      bue2.create('b1', 100);
      expect(bue2.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      bue2.create('b1', 100);
      expect(bue2.getActiveBackups()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bue2.create('b1', 100);
      bue2.setActive(id, false);
      expect(bue2.getInactiveBackups()).toHaveLength(1);
    });

    it('should get all names', () => {
      bue2.create('a', 100);
      bue2.create('b', 100);
      expect(bue2.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      bue2.create('b1', 100);
      expect(bue2.getNewest()?.name).toBe('b1');
    });

    it('should return null for empty newest', () => {
      expect(bue2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bue2.create('b1', 100);
      expect(bue2.getOldest()?.name).toBe('b1');
    });

    it('should return null for empty oldest', () => {
      expect(bue2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = bue2.create('b1', 100);
      expect(bue2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      expect(bue2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total created', () => {
      bue2.create('b1', 100);
      expect(bue2.getTotalCreated()).toBe(1);
    });

    it('should get total restored', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.restore(id);
      expect(bue2.getTotalRestored()).toBe(1);
    });

    it('should get total verified', () => {
      const id = bue2.create('b1', 100);
      bue2.complete(id);
      bue2.verify(id);
      expect(bue2.getTotalVerified()).toBe(1);
    });

    it('should get total failed', () => {
      const id = bue2.create('b1', 100);
      bue2.fail(id);
      expect(bue2.getTotalFailed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many backups', () => {
      for (let i = 0; i < 50; i++) {
        bue2.create(`b${i}`, 100);
      }
      expect(bue2.getCount()).toBe(50);
    });
  });
});