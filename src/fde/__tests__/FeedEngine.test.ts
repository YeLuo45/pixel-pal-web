/**
 * FeedEngine Tests
 * chatdev-design Feed Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeedEngine } from '../FeedEngine';

describe('FeedEngine', () => {
  let fde: FeedEngine;

  beforeEach(() => {
    fde = new FeedEngine();
  });

  afterEach(() => {
    fde.clearAll();
  });

  describe('add / publish / read / pause / archive / remove', () => {
    it('should add', () => {
      expect(fde.add('t1', 'b1')).toMatch(/^fde-/);
    });

    it('should default status to active', () => {
      fde.add('t1', 'b1');
      expect(fde.getStatus(fde.getAllItems()[0].id)).toBe('active');
    });

    it('should mark as active', () => {
      fde.add('t1', 'b1');
      expect(fde.isActive(fde.getAllItems()[0].id)).toBe(true);
    });

    it('should publish', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.publish(id)).toBe(true);
    });

    it('should set published', () => {
      const id = fde.add('t1', 'b1');
      fde.publish(id);
      expect(fde.isPublished(id)).toBe(true);
    });

    it('should not publish inactive', () => {
      const id = fde.add('t1', 'b1');
      fde.setActive(id, false);
      expect(fde.publish(id)).toBe(false);
    });

    it('should return false for unknown publish', () => {
      expect(fde.publish('unknown')).toBe(false);
    });

    it('should read', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.read(id)).toBe(true);
    });

    it('should set reads', () => {
      const id = fde.add('t1', 'b1');
      fde.read(id);
      expect(fde.getReads(id)).toBe(1);
    });

    it('should not read inactive', () => {
      const id = fde.add('t1', 'b1');
      fde.setActive(id, false);
      expect(fde.read(id)).toBe(false);
    });

    it('should return false for unknown read', () => {
      expect(fde.read('unknown')).toBe(false);
    });

    it('should pause', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.pause(id)).toBe(true);
    });

    it('should set paused', () => {
      const id = fde.add('t1', 'b1');
      fde.pause(id);
      expect(fde.isPaused(id)).toBe(true);
    });

    it('should archive', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.archive(id)).toBe(true);
    });

    it('should set archived', () => {
      const id = fde.add('t1', 'b1');
      fde.archive(id);
      expect(fde.isArchived(id)).toBe(true);
    });

    it('should remove', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      fde.add('t1', 'b1');
      expect(fde.getStats().items).toBe(1);
    });

    it('should count total added', () => {
      fde.add('t1', 'b1');
      expect(fde.getStats().totalAdded).toBe(1);
    });

    it('should count total published', () => {
      const id = fde.add('t1', 'b1');
      fde.publish(id);
      expect(fde.getStats().totalPublished).toBe(1);
    });

    it('should count total read', () => {
      const id = fde.add('t1', 'b1');
      fde.read(id);
      expect(fde.getStats().totalRead).toBe(1);
    });

    it('should count active', () => {
      fde.add('t1', 'b1');
      expect(fde.getStats().active).toBe(1);
    });

    it('should count paused', () => {
      const id = fde.add('t1', 'b1');
      fde.pause(id);
      expect(fde.getStats().paused).toBe(1);
    });

    it('should count archived', () => {
      const id = fde.add('t1', 'b1');
      fde.archive(id);
      expect(fde.getStats().archived).toBe(1);
    });

    it('should count published', () => {
      const id = fde.add('t1', 'b1');
      fde.publish(id);
      expect(fde.getStats().published).toBe(1);
    });

    it('should count unpublished', () => {
      fde.add('t1', 'b1');
      expect(fde.getStats().unpublished).toBe(1);
    });

    it('should count unique active', () => {
      fde.add('t1', 'b1');
      expect(fde.getStats().uniqueActive).toBe(1);
    });

    it('should count total hits', () => {
      const id = fde.add('t1', 'b1');
      fde.read(id);
      expect(fde.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      fde.add('a', 'b1');
      fde.add('a', 'b2');
      expect(fde.getStats().uniqueTitles).toBe(1);
    });

    it('should count total body len', () => {
      fde.add('t1', 'b1');
      expect(fde.getStats().totalBodyLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get item', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.getItem(id)?.title).toBe('t1');
    });

    it('should get all', () => {
      fde.add('t1', 'b1');
      expect(fde.getAllItems()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.hasItem(id)).toBe(true);
    });

    it('should count', () => {
      expect(fde.getCount()).toBe(0);
      fde.add('t1', 'b1');
      expect(fde.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get title', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.getTitle(id)).toBe('t1');
    });

    it('should get body', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.getBody(id)).toBe('b1');
    });

    it('should get hits', () => {
      const id = fde.add('t1', 'b1');
      fde.read(id);
      expect(fde.getHits(id)).toBe(1);
    });

    it('should check active status', () => {
      fde.add('t1', 'b1');
      expect(fde.isActive_(fde.getAllItems()[0].id)).toBe(true);
    });

    it('should check paused status', () => {
      const id = fde.add('t1', 'b1');
      fde.pause(id);
      expect(fde.isPaused(id)).toBe(true);
    });

    it('should check archived status', () => {
      const id = fde.add('t1', 'b1');
      fde.archive(id);
      expect(fde.isArchived(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.setActive(id, false)).toBe(true);
    });

    it('should set title', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.setTitle(id, 't2')).toBe(true);
    });

    it('should set body', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.setBody(id, 'b2')).toBe(true);
    });

    it('should set status', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.setStatus(id, 'paused')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fde.setActive('unknown', false)).toBe(false);
      expect(fde.setTitle('unknown', 't')).toBe(false);
      expect(fde.setBody('unknown', 'b')).toBe(false);
      expect(fde.setStatus('unknown', 'active')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = fde.add('t1', 'b1');
      fde.read(id);
      fde.setActive(id, false);
      fde.resetAll();
      expect(fde.getReads(id)).toBe(0);
      expect(fde.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      fde.add('t1', 'b1');
      expect(fde.getByStatus('active')).toHaveLength(1);
    });

    it('should get active', () => {
      fde.add('t1', 'b1');
      expect(fde.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = fde.add('t1', 'b1');
      fde.setActive(id, false);
      expect(fde.getInactiveItems()).toHaveLength(1);
    });

    it('should get published', () => {
      const id = fde.add('t1', 'b1');
      fde.publish(id);
      expect(fde.getPublishedItems()).toHaveLength(1);
    });

    it('should get unpublished', () => {
      fde.add('t1', 'b1');
      expect(fde.getUnpublishedItems()).toHaveLength(1);
    });

    it('should get all titles', () => {
      fde.add('a', 'b1');
      fde.add('b', 'b2');
      expect(fde.getAllTitles()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      fde.add('t1', 'b1');
      expect(fde.getNewest()?.title).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(fde.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      fde.add('t1', 'b1');
      expect(fde.getOldest()?.title).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(fde.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = fde.add('t1', 'b1');
      expect(fde.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = fde.add('t1', 'b1');
      fde.read(id);
      expect(fde.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      fde.add('t1', 'b1');
      expect(fde.getTotalAdded()).toBe(1);
    });

    it('should get total published', () => {
      const id = fde.add('t1', 'b1');
      fde.publish(id);
      expect(fde.getTotalPublished()).toBe(1);
    });

    it('should get total read', () => {
      const id = fde.add('t1', 'b1');
      fde.read(id);
      expect(fde.getTotalRead()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        fde.add(`t${i}`, 'b');
      }
      expect(fde.getCount()).toBe(50);
    });
  });
});