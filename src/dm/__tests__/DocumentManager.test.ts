/**
 * DocumentManager Tests
 * chatdev-design Document Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DocumentManager } from '../DocumentManager';

describe('DocumentManager', () => {
  let dm: DocumentManager;

  beforeEach(() => {
    dm = new DocumentManager();
  });

  afterEach(() => {
    dm.clearAll();
  });

  // ============================================================
  // create / update / share
  // ============================================================
  describe('create / update / share', () => {
    it('should create', () => {
      expect(dm.create('Doc1', 'content1')).toBe('dm-1');
    });

    it('should mark as active', () => {
      const id = dm.create('Doc1', 'content1');
      expect(dm.isActive(id)).toBe(true);
    });

    it('should update', () => {
      const id = dm.create('Doc1', 'content1');
      expect(dm.update(id, 'content2')).toBe(id);
    });

    it('should increment version on update', () => {
      const id = dm.create('Doc1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getVersionCount(id)).toBe(2);
    });

    it('should update content', () => {
      const id = dm.create('Doc1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getContent(id)).toBe('c2');
    });

    it('should not update inactive', () => {
      const id = dm.create('Doc1', 'c1');
      dm.setActive(id, false);
      expect(dm.update(id, 'c2')).toBe('');
    });

    it('should return empty for unknown update', () => {
      expect(dm.update('unknown', 'c2')).toBe('');
    });

    it('should share', () => {
      const id = dm.create('Doc1', 'c1');
      expect(dm.share(id, 'user1')).toBe(true);
    });

    it('should increment shared count', () => {
      const id = dm.create('Doc1', 'c1');
      dm.share(id, 'user1');
      expect(dm.getSharedCount(id)).toBe(1);
    });

    it('should not share duplicate', () => {
      const id = dm.create('Doc1', 'c1');
      dm.share(id, 'user1');
      dm.share(id, 'user1');
      expect(dm.getSharedCount(id)).toBe(1);
    });

    it('should not share inactive', () => {
      const id = dm.create('Doc1', 'c1');
      dm.setActive(id, false);
      expect(dm.share(id, 'user1')).toBe(false);
    });

    it('should return false for unknown share', () => {
      expect(dm.share('unknown', 'u1')).toBe(false);
    });

    it('should unshare', () => {
      const id = dm.create('Doc1', 'c1');
      dm.share(id, 'user1');
      expect(dm.unshare(id, 'user1')).toBe(true);
    });

    it('should remove from shared', () => {
      const id = dm.create('Doc1', 'c1');
      dm.share(id, 'user1');
      dm.unshare(id, 'user1');
      expect(dm.getSharedCount(id)).toBe(0);
    });

    it('should return false for unknown unshare', () => {
      expect(dm.unshare('unknown', 'u1')).toBe(false);
    });

    it('should get version by index', () => {
      const id = dm.create('Doc1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getVersion(id, 0)).toBe('c1');
      expect(dm.getVersion(id, 1)).toBe('c2');
    });

    it('should check isShared', () => {
      const id = dm.create('Doc1', 'c1');
      dm.share(id, 'user1');
      expect(dm.isShared(id, 'user1')).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      dm.create('D1', 'c1');
      const stats = dm.getStats();
      expect(stats.documents).toBe(1);
    });

    it('should count total versions', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getStats().totalVersions).toBe(2);
    });

    it('should count total shares', () => {
      const id = dm.create('D1', 'c1');
      dm.share(id, 'u1');
      dm.share(id, 'u2');
      expect(dm.getStats().totalShares).toBe(2);
    });

    it('should count total hits', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      dm.create('D1', 'c1');
      expect(dm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = dm.create('D1', 'c1');
      dm.setActive(id, false);
      expect(dm.getStats().inactive).toBe(1);
    });

    it('should compute avg versions', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getStats().avgVersions).toBe(2);
    });

    it('should compute avg shares', () => {
      const id = dm.create('D1', 'c1');
      dm.share(id, 'u1');
      expect(dm.getStats().avgShares).toBe(1);
    });

    it('should count titles', () => {
      dm.create('D1', 'c1');
      dm.create('D2', 'c2');
      expect(dm.getStats().titles).toBe(2);
    });

    it('should compute content length', () => {
      dm.create('D1', 'abcde');
      expect(dm.getStats().contentLength).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get document', () => {
      dm.create('D1', 'c1');
      expect(dm.getDocument('dm-1')?.title).toBe('D1');
    });

    it('should get all', () => {
      dm.create('D1', 'c1');
      expect(dm.getAllDocuments()).toHaveLength(1);
    });

    it('should remove', () => {
      dm.create('D1', 'c1');
      expect(dm.removeDocument('dm-1')).toBe(true);
    });

    it('should check existence', () => {
      dm.create('D1', 'c1');
      expect(dm.hasDocument('dm-1')).toBe(true);
    });

    it('should count', () => {
      expect(dm.getCount()).toBe(0);
      dm.create('D1', 'c1');
      expect(dm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get title', () => {
      dm.create('D1', 'c1');
      expect(dm.getTitle('dm-1')).toBe('D1');
    });

    it('should get content', () => {
      dm.create('D1', 'c1');
      expect(dm.getContent('dm-1')).toBe('c1');
    });

    it('should get versions', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getVersions(id)).toEqual(['c1', 'c2']);
    });

    it('should get version count', () => {
      dm.create('D1', 'c1');
      expect(dm.getVersionCount('dm-1')).toBe(1);
    });

    it('should get shared', () => {
      const id = dm.create('D1', 'c1');
      dm.share(id, 'u1');
      expect(dm.getShared(id)).toEqual(['u1']);
    });

    it('should get shared count', () => {
      dm.create('D1', 'c1');
      expect(dm.getSharedCount('dm-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      dm.create('D1', 'c1');
      expect(dm.getHistory('dm-1').length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      dm.create('D1', 'c1');
      expect(dm.setActive('dm-1', false)).toBe(true);
    });

    it('should set title', () => {
      dm.create('D1', 'c1');
      expect(dm.setTitle('dm-1', 'D2')).toBe(true);
    });

    it('should set content', () => {
      const id = dm.create('D1', 'c1');
      expect(dm.setContent(id, 'c2')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(dm.setActive('unknown', false)).toBe(false);
      expect(dm.setTitle('unknown', 'D')).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      dm.create('D1', 'c1');
      expect(dm.touch('dm-1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(dm.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      dm.share(id, 'u1');
      dm.setActive(id, false);
      dm.resetAll();
      expect(dm.getVersionCount(id)).toBe(1);
      expect(dm.getSharedCount(id)).toBe(0);
      expect(dm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by title / state
  // ============================================================
  describe('by title / state', () => {
    it('should get by title', () => {
      dm.create('D1', 'c1');
      expect(dm.getByTitle('D1')).toHaveLength(1);
    });

    it('should get shared with', () => {
      const id = dm.create('D1', 'c1');
      dm.share(id, 'u1');
      expect(dm.getSharedWith('u1')).toHaveLength(1);
    });

    it('should get active', () => {
      dm.create('D1', 'c1');
      expect(dm.getActiveDocuments()).toHaveLength(1);
    });

    it('should get inactive', () => {
      dm.create('D1', 'c1');
      dm.setActive('dm-1', false);
      expect(dm.getInactiveDocuments()).toHaveLength(1);
    });

    it('should get all titles', () => {
      dm.create('D1', 'c1');
      dm.create('D2', 'c2');
      expect(dm.getAllTitles()).toHaveLength(2);
    });

    it('should get title count', () => {
      dm.create('D1', 'c1');
      expect(dm.getTitleCount()).toBe(1);
    });

    it('should get all users', () => {
      const id = dm.create('D1', 'c1');
      dm.share(id, 'u1');
      dm.share(id, 'u2');
      expect(dm.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      const id = dm.create('D1', 'c1');
      dm.share(id, 'u1');
      expect(dm.getUserCount()).toBe(1);
    });

    it('should get by min versions', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getByMinVersions(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most versions', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getMostVersions()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(dm.getMostVersions()).toBeNull();
    });

    it('should get most shared', () => {
      const id = dm.create('D1', 'c1');
      dm.share(id, 'u1');
      dm.share(id, 'u2');
      expect(dm.getMostShared()?.id).toBe(id);
    });

    it('should return null for empty most shared', () => {
      expect(dm.getMostShared()).toBeNull();
    });

    it('should get newest', () => {
      dm.create('D1', 'c1');
      expect(dm.getNewest()?.id).toBe('dm-1');
    });

    it('should return null for empty newest', () => {
      expect(dm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      dm.create('D1', 'c1');
      expect(dm.getOldest()?.id).toBe('dm-1');
    });

    it('should return null for empty oldest', () => {
      expect(dm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      dm.create('D1', 'c1');
      expect(dm.getCreatedAt('dm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = dm.create('D1', 'c1');
      dm.update(id, 'c2');
      expect(dm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many documents', () => {
      for (let i = 0; i < 50; i++) {
        dm.create(`D${i}`, `c${i}`);
      }
      expect(dm.getCount()).toBe(50);
    });
  });
});