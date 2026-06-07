/**
 * StreamEngine Tests
 * claude-code-design Stream Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamEngine } from '../StreamEngine';

describe('StreamEngine', () => {
  let sme: StreamEngine;

  beforeEach(() => {
    sme = new StreamEngine();
  });

  afterEach(() => {
    sme.clearAll();
  });

  describe('open / write / close / pause / resume / remove', () => {
    it('should open', () => {
      expect(sme.open('s1')).toBe('sme-1');
    });

    it('should default status to open', () => {
      sme.open('s1');
      expect(sme.getStatus('sme-1')).toBe('open');
    });

    it('should mark as active', () => {
      sme.open('s1');
      expect(sme.isActive('sme-1')).toBe(true);
    });

    it('should write', () => {
      sme.open('s1');
      expect(sme.write('sme-1', 100)).toBe(true);
    });

    it('should not write to closed', () => {
      sme.open('s1');
      sme.close('sme-1');
      expect(sme.write('sme-1', 100)).toBe(false);
    });

    it('should not write to paused', () => {
      sme.open('s1');
      sme.pause('sme-1');
      expect(sme.write('sme-1', 100)).toBe(false);
    });

    it('should not write to inactive', () => {
      sme.open('s1');
      sme.setActive('sme-1', false);
      expect(sme.write('sme-1', 100)).toBe(false);
    });

    it('should return false for unknown write', () => {
      expect(sme.write('unknown', 100)).toBe(false);
    });

    it('should close', () => {
      sme.open('s1');
      expect(sme.close('sme-1')).toBe(true);
    });

    it('should pause', () => {
      sme.open('s1');
      expect(sme.pause('sme-1')).toBe(true);
    });

    it('should not pause closed', () => {
      sme.open('s1');
      sme.close('sme-1');
      expect(sme.pause('sme-1')).toBe(false);
    });

    it('should resume', () => {
      sme.open('s1');
      sme.pause('sme-1');
      expect(sme.resume('sme-1')).toBe(true);
    });

    it('should not resume open', () => {
      sme.open('s1');
      expect(sme.resume('sme-1')).toBe(false);
    });

    it('should remove', () => {
      sme.open('s1');
      expect(sme.remove('sme-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sme.open('s1');
      expect(sme.getStats().streams).toBe(1);
    });

    it('should count total opened', () => {
      sme.open('s1');
      expect(sme.getStats().totalOpened).toBe(1);
    });

    it('should count total closed', () => {
      sme.open('s1');
      sme.close('sme-1');
      expect(sme.getStats().totalClosed).toBe(1);
    });

    it('should count total paused', () => {
      sme.open('s1');
      sme.pause('sme-1');
      expect(sme.getStats().totalPaused).toBe(1);
    });

    it('should count total bytes', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      expect(sme.getStats().totalBytes).toBe(100);
    });

    it('should count open', () => {
      sme.open('s1');
      expect(sme.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      sme.open('s1');
      sme.close('sme-1');
      expect(sme.getStats().closed).toBe(1);
    });

    it('should count paused', () => {
      sme.open('s1');
      sme.pause('sme-1');
      expect(sme.getStats().paused).toBe(1);
    });

    it('should count active', () => {
      sme.open('s1');
      expect(sme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      sme.open('s1');
      sme.setActive('sme-1', false);
      expect(sme.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      expect(sme.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sme.open('a');
      sme.open('a');
      expect(sme.getStats().uniqueNames).toBe(1);
    });

    it('should count total chunks', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      sme.write('sme-1', 100);
      expect(sme.getStats().totalChunks).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get stream', () => {
      sme.open('s1');
      expect(sme.getStream('sme-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sme.open('s1');
      expect(sme.getAllStreams()).toHaveLength(1);
    });

    it('should check existence', () => {
      sme.open('s1');
      expect(sme.hasStream('sme-1')).toBe(true);
    });

    it('should count', () => {
      expect(sme.getCount()).toBe(0);
      sme.open('s1');
      expect(sme.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      sme.open('s1');
      expect(sme.getName('sme-1')).toBe('s1');
    });

    it('should get bytes', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      expect(sme.getBytes('sme-1')).toBe(100);
    });

    it('should get chunks', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      expect(sme.getChunks('sme-1')).toBe(1);
    });

    it('should get hits', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      expect(sme.getHits('sme-1')).toBe(1);
    });

    it('should check open', () => {
      sme.open('s1');
      expect(sme.isOpen('sme-1')).toBe(true);
    });

    it('should check closed', () => {
      sme.open('s1');
      sme.close('sme-1');
      expect(sme.isClosed('sme-1')).toBe(true);
    });

    it('should check paused', () => {
      sme.open('s1');
      sme.pause('sme-1');
      expect(sme.isPaused('sme-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      sme.open('s1');
      expect(sme.setActive('sme-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sme.setActive('unknown', false)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      sme.close('sme-1');
      sme.setActive('sme-1', false);
      sme.resetAll();
      expect(sme.getBytes('sme-1')).toBe(0);
      expect(sme.getStatus('sme-1')).toBe('open');
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      sme.open('s1');
      expect(sme.getByStatus('open')).toHaveLength(1);
    });

    it('should get active', () => {
      sme.open('s1');
      expect(sme.getActiveStreams()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sme.open('s1');
      sme.setActive('sme-1', false);
      expect(sme.getInactiveStreams()).toHaveLength(1);
    });

    it('should get all names', () => {
      sme.open('a');
      sme.open('b');
      expect(sme.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sme.open('s1');
      expect(sme.getNewest()?.id).toBe('sme-1');
    });

    it('should return null for empty newest', () => {
      expect(sme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sme.open('s1');
      expect(sme.getOldest()?.id).toBe('sme-1');
    });

    it('should return null for empty oldest', () => {
      expect(sme.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      sme.open('s1');
      expect(sme.getCreatedAt('sme-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      expect(sme.getUpdatedAt('sme-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total opened', () => {
      sme.open('s1');
      expect(sme.getTotalOpened()).toBe(1);
    });

    it('should get total closed', () => {
      sme.open('s1');
      sme.close('sme-1');
      expect(sme.getTotalClosed()).toBe(1);
    });

    it('should get total paused', () => {
      sme.open('s1');
      sme.pause('sme-1');
      expect(sme.getTotalPaused()).toBe(1);
    });

    it('should get total bytes', () => {
      sme.open('s1');
      sme.write('sme-1', 100);
      expect(sme.getTotalBytes()).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle many streams', () => {
      for (let i = 0; i < 50; i++) {
        sme.open(`s${i}`);
      }
      expect(sme.getCount()).toBe(50);
    });
  });
});