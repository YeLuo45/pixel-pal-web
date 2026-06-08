/**
 * StreamEngine Tests
 * thunderbolt-design Stream Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamEngine } from '../StreamEngine';

describe('StreamEngine', () => {
  let ste: StreamEngine;

  beforeEach(() => {
    ste = new StreamEngine();
  });

  afterEach(() => {
    ste.clearAll();
  });

  describe('create / write / flush / close / fail / reset / remove', () => {
    it('should create', () => {
      expect(ste.create('s1')).toMatch(/^ste-/);
    });

    it('should default mode to idle', () => {
      ste.create('s1');
      expect(ste.getMode(ste.getAllStreams()[0].id)).toBe('idle');
    });

    it('should mark as active', () => {
      ste.create('s1');
      expect(ste.isActive(ste.getAllStreams()[0].id)).toBe(true);
    });

    it('should write', () => {
      const id = ste.create('s1');
      expect(ste.write(id, 10)).toBe(true);
    });

    it('should set writing on write', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.isWriting(id)).toBe(true);
    });

    it('should not write inactive', () => {
      const id = ste.create('s1');
      ste.setActive(id, false);
      expect(ste.write(id, 10)).toBe(false);
    });

    it('should not write closed', () => {
      const id = ste.create('s1');
      ste.close(id);
      expect(ste.write(id, 10)).toBe(false);
    });

    it('should not write error', () => {
      const id = ste.create('s1');
      ste.fail(id);
      expect(ste.write(id, 10)).toBe(false);
    });

    it('should return false for unknown write', () => {
      expect(ste.write('unknown', 10)).toBe(false);
    });

    it('should flush', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.flush(id)).toBe(true);
    });

    it('should set flushing on flush', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.flush(id);
      expect(ste.isFlushing(id)).toBe(true);
    });

    it('should not flush closed', () => {
      const id = ste.create('s1');
      ste.close(id);
      expect(ste.flush(id)).toBe(false);
    });

    it('should not flush inactive', () => {
      const id = ste.create('s1');
      ste.setActive(id, false);
      expect(ste.flush(id)).toBe(false);
    });

    it('should return false for unknown flush', () => {
      expect(ste.flush('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = ste.create('s1');
      expect(ste.close(id)).toBe(true);
    });

    it('should set closed', () => {
      const id = ste.create('s1');
      ste.close(id);
      expect(ste.isClosed(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(ste.close('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = ste.create('s1');
      expect(ste.fail(id)).toBe(true);
    });

    it('should set error', () => {
      const id = ste.create('s1');
      ste.fail(id);
      expect(ste.isError(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(ste.fail('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.reset(id)).toBe(true);
    });

    it('should set idle on reset', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.reset(id);
      expect(ste.isIdle(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(ste.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ste.create('s1');
      expect(ste.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ste.create('s1');
      expect(ste.getStats().streams).toBe(1);
    });

    it('should count total added', () => {
      ste.create('s1');
      expect(ste.getStats().totalAdded).toBe(1);
    });

    it('should count total written', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.getStats().totalWrittenSum).toBe(10);
    });

    it('should count total flushed', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.flush(id);
      expect(ste.getStats().totalFlushedSum).toBe(10);
    });

    it('should count idle', () => {
      ste.create('s1');
      expect(ste.getStats().idle).toBe(1);
    });

    it('should count writing', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.getStats().writing).toBe(1);
    });

    it('should count flushing', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.flush(id);
      expect(ste.getStats().flushing).toBe(1);
    });

    it('should count closed', () => {
      const id = ste.create('s1');
      ste.close(id);
      expect(ste.getStats().closed).toBe(1);
    });

    it('should count error', () => {
      const id = ste.create('s1');
      ste.fail(id);
      expect(ste.getStats().error).toBe(1);
    });

    it('should count active', () => {
      ste.create('s1');
      expect(ste.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ste.create('s1');
      ste.setActive(id, false);
      expect(ste.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ste.create('a');
      ste.create('a');
      expect(ste.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get stream', () => {
      const id = ste.create('s1');
      expect(ste.getStream(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      ste.create('s1');
      expect(ste.getAllStreams()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ste.create('s1');
      expect(ste.hasStream(id)).toBe(true);
    });

    it('should count', () => {
      expect(ste.getCount()).toBe(0);
      ste.create('s1');
      expect(ste.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ste.create('s1');
      expect(ste.getName(id)).toBe('s1');
    });

    it('should get written', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.getWritten(id)).toBe(10);
    });

    it('should get flushed', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.flush(id);
      expect(ste.getFlushed(id)).toBe(10);
    });

    it('should get hits', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.getHits(id)).toBe(1);
    });

    it('should check writing', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.isWriting(id)).toBe(true);
    });

    it('should check flushing', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.flush(id);
      expect(ste.isFlushing(id)).toBe(true);
    });

    it('should check closed', () => {
      const id = ste.create('s1');
      ste.close(id);
      expect(ste.isClosed(id)).toBe(true);
    });

    it('should check error', () => {
      const id = ste.create('s1');
      ste.fail(id);
      expect(ste.isError(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ste.create('s1');
      expect(ste.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ste.create('s1');
      expect(ste.setName(id, 's2')).toBe(true);
    });

    it('should set mode', () => {
      const id = ste.create('s1');
      expect(ste.setMode(id, 'writing')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ste.setActive('unknown', false)).toBe(false);
      expect(ste.setName('unknown', 's')).toBe(false);
      expect(ste.setMode('unknown', 'idle')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.setActive(id, false);
      ste.resetAll();
      expect(ste.isIdle(id)).toBe(true);
      expect(ste.isActive(id)).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      ste.create('s1');
      expect(ste.getByMode('idle')).toHaveLength(1);
    });

    it('should get active', () => {
      ste.create('s1');
      expect(ste.getActiveStreams()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ste.create('s1');
      ste.setActive(id, false);
      expect(ste.getInactiveStreams()).toHaveLength(1);
    });

    it('should get all names', () => {
      ste.create('a');
      ste.create('b');
      expect(ste.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ste.create('s1');
      expect(ste.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(ste.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ste.create('s1');
      expect(ste.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(ste.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ste.create('s1');
      expect(ste.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ste.create('s1');
      expect(ste.getTotalAdded()).toBe(1);
    });

    it('should get total written', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      expect(ste.getTotalWritten()).toBe(10);
    });

    it('should get total flushed', () => {
      const id = ste.create('s1');
      ste.write(id, 10);
      ste.flush(id);
      expect(ste.getTotalFlushed()).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle many streams', () => {
      for (let i = 0; i < 50; i++) {
        ste.create(`s${i}`);
      }
      expect(ste.getCount()).toBe(50);
    });
  });
});