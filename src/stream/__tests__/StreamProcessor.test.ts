/**
 * StreamProcessor Tests
 * thunderbolt-design Stream Processor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamProcessor } from '../StreamProcessor';

describe('StreamProcessor', () => {
  let processor: StreamProcessor;

  beforeEach(() => {
    processor = new StreamProcessor();
  });

  afterEach(() => {
    processor.clearAll();
  });

  // ============================================================
  // createStream
  // ============================================================
  describe('createStream', () => {
    it('should create stream', () => {
      const id = processor.createStream('test');
      expect(id).toBe('stream-1');
    });
  });

  // ============================================================
  // emit
  // ============================================================
  describe('emit', () => {
    it('should emit event', () => {
      const id = processor.createStream('test');
      expect(processor.emit(id, { type: 'click', data: { x: 1 } })).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(processor.emit('unknown', { type: 'click', data: {} })).toBe(false);
    });
  });

  // ============================================================
  // filter
  // ============================================================
  describe('filter', () => {
    it('should filter events', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'click', data: { x: 1 } });
      processor.emit(id, { type: 'hover', data: { x: 2 } });
      const result = processor.filter(id, e => e.type === 'click');
      expect(result).toHaveLength(1);
    });

    it('should return empty for unknown', () => {
      expect(processor.filter('unknown', () => true)).toHaveLength(0);
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should aggregate', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'click', data: {} });
      processor.emit(id, { type: 'click', data: {} });
      processor.emit(id, { type: 'hover', data: {} });
      const stats = processor.aggregate(id);
      expect(stats.count).toBe(3);
      expect(stats.types.click).toBe(2);
    });

    it('should return empty for unknown', () => {
      const stats = processor.aggregate('unknown');
      expect(stats.count).toBe(0);
    });
  });

  // ============================================================
  // event queries
  // ============================================================
  describe('event queries', () => {
    it('should get events', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: {} });
      expect(processor.getEvents(id)).toHaveLength(1);
    });

    it('should get event count', () => {
      const id = processor.createStream('test');
      expect(processor.getEventCount(id)).toBe(0);
    });

    it('should check hasStream', () => {
      const id = processor.createStream('test');
      expect(processor.hasStream(id)).toBe(true);
    });

    it('should remove stream', () => {
      const id = processor.createStream('test');
      expect(processor.removeStream(id)).toBe(true);
    });

    it('should count streams', () => {
      expect(processor.getCount()).toBe(0);
      processor.createStream('a');
      expect(processor.getCount()).toBe(1);
    });
  });

  // ============================================================
  // map / reduce
  // ============================================================
  describe('map / reduce', () => {
    it('should map', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      const result = processor.map(id, e => e.type);
      expect(result).toEqual(['a', 'b']);
    });

    it('should reduce', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      const sum = processor.reduce(id, (acc, e) => acc + (e.data as number), 0);
      expect(sum).toBe(3);
    });
  });

  // ============================================================
  // find / some / every
  // ============================================================
  describe('find / some / every', () => {
    it('should find', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      expect(processor.find(id, e => e.type === 'b')?.data).toBe(2);
    });

    it('should some', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      expect(processor.some(id, e => e.type === 'a')).toBe(true);
    });

    it('should every', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      expect(processor.every(id, e => e.type === 'a')).toBe(true);
    });

    it('should count', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      expect(processor.count(id, e => e.type === 'a')).toBe(1);
    });
  });

  // ============================================================
  // by type
  // ============================================================
  describe('by type', () => {
    it('should get by type', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      expect(processor.getByType(id, 'a')).toHaveLength(1);
    });

    it('should count by type', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      expect(processor.getByTypeCount(id, 'a')).toBe(1);
    });

    it('should get all types', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      expect(processor.getAllTypes(id)).toHaveLength(2);
    });
  });

  // ============================================================
  // first / last / recent
  // ============================================================
  describe('first / last / recent', () => {
    it('should get first', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      expect(processor.getFirst(id)?.type).toBe('a');
    });

    it('should get last', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      expect(processor.getLast(id)?.type).toBe('b');
    });

    it('should return undefined for empty first', () => {
      const id = processor.createStream('test');
      expect(processor.getFirst(id)).toBeUndefined();
    });

    it('should return undefined for empty last', () => {
      const id = processor.createStream('test');
      expect(processor.getLast(id)).toBeUndefined();
    });

    it('should get recent', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      processor.emit(id, { type: 'b', data: 2 });
      processor.emit(id, { type: 'c', data: 3 });
      expect(processor.getRecent(id, 2)).toHaveLength(2);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear stream', () => {
      const id = processor.createStream('test');
      processor.emit(id, { type: 'a', data: 1 });
      expect(processor.clearStream(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(processor.clearStream('unknown')).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many streams', () => {
      for (let i = 0; i < 50; i++) {
        processor.createStream(`s${i}`);
      }
      expect(processor.getCount()).toBe(50);
    });
  });
});