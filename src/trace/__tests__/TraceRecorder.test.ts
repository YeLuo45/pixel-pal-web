/**
 * TraceRecorder Tests
 * claude-code-design Trace Recorder
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TraceRecorder } from '../TraceRecorder';

describe('TraceRecorder', () => {
  let tr: TraceRecorder;

  beforeEach(() => {
    tr = new TraceRecorder();
  });

  afterEach(() => {
    tr.clearAll();
  });

  // ============================================================
  // start / end
  // ============================================================
  describe('start / end', () => {
    it('should start', () => {
      expect(tr.start('span1')).toBe('tr-1');
    });

    it('should start with parent', () => {
      const parent = tr.start('parent');
      expect(tr.start('child', parent)).toBe('tr-2');
    });

    it('should end', () => {
      const id = tr.start('span1');
      const duration = tr.end(id);
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for unknown end', () => {
      expect(tr.end('unknown')).toBe(0);
    });

    it('should end with error', () => {
      const id = tr.start('span1');
      tr.end(id, 'error');
      expect(tr.isError(id)).toBe(true);
    });
  });

  // ============================================================
  // getTrace
  // ============================================================
  describe('getTrace', () => {
    it('should get trace', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getTrace(id)?.span).toBe('span1');
    });

    it('should return null for unknown', () => {
      expect(tr.getTrace('unknown')).toBeNull();
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      const id = tr.start('span1');
      tr.end(id);
      const stats = tr.getStats();
      expect(stats.traces).toBe(1);
    });

    it('should compute avg', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getStats().avgDuration).toBeGreaterThanOrEqual(0);
    });

    it('should count errors', () => {
      const id = tr.start('span1');
      tr.end(id, 'error');
      expect(tr.getStats().errors).toBe(1);
    });

    it('should count ok', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getStats().okCount).toBe(1);
    });

    it('should compute max', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getStats().maxDuration).toBeGreaterThanOrEqual(0);
    });

    it('should compute min', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getStats().minDuration).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get active', () => {
      tr.start('span1');
      expect(tr.getActiveTraces()).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getCompletedTraces()).toHaveLength(1);
    });

    it('should get by status', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getByStatus('ok')).toHaveLength(1);
    });

    it('should get ok', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getOkTraces()).toHaveLength(1);
    });

    it('should get errors', () => {
      const id = tr.start('span1');
      tr.end(id, 'error');
      expect(tr.getErrorTraces()).toHaveLength(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get all', () => {
      tr.start('span1');
      expect(tr.getAllTraces()).toHaveLength(1);
    });

    it('should remove', () => {
      tr.start('span1');
      expect(tr.removeTrace('tr-1')).toBe(true);
    });

    it('should check existence', () => {
      tr.start('span1');
      expect(tr.hasTrace('tr-1')).toBe(true);
    });

    it('should count', () => {
      expect(tr.getCount()).toBe(0);
      tr.start('span1');
      expect(tr.getCount()).toBe(1);
    });

    it('should count active', () => {
      tr.start('span1');
      expect(tr.getActiveCount()).toBe(1);
    });

    it('should count completed', () => {
      const id = tr.start('span1');
      tr.end(id);
      expect(tr.getCompletedCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get span', () => {
      tr.start('hello');
      expect(tr.getSpan('tr-1')).toBe('hello');
    });

    it('should get parent', () => {
      tr.start('hello');
      expect(tr.getParent('tr-1')).toBeNull();
    });

    it('should get status', () => {
      const id = tr.start('hello');
      tr.end(id);
      expect(tr.getStatus(id)).toBe('ok');
    });

    it('should get duration', () => {
      const id = tr.start('hello');
      tr.end(id);
      expect(tr.getDuration(id)).toBeGreaterThanOrEqual(0);
    });

    it('should get start', () => {
      tr.start('hello');
      expect(tr.getStart('tr-1')).toBeGreaterThan(0);
    });

    it('should get end', () => {
      const id = tr.start('hello');
      tr.end(id);
      expect(tr.getEnd(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isActive', () => {
      tr.start('hello');
      expect(tr.isActive('tr-1')).toBe(true);
    });

    it('should check isCompleted', () => {
      const id = tr.start('hello');
      tr.end(id);
      expect(tr.isCompleted(id)).toBe(true);
    });

    it('should check isOk', () => {
      const id = tr.start('hello');
      tr.end(id);
      expect(tr.isOk(id)).toBe(true);
    });

    it('should check isError', () => {
      const id = tr.start('hello');
      tr.end(id, 'error');
      expect(tr.isError(id)).toBe(true);
    });
  });

  // ============================================================
  // metadata
  // ============================================================
  describe('metadata', () => {
    it('should set metadata', () => {
      tr.start('hello');
      expect(tr.setMetadata('tr-1', 'k', 'v')).toBe(true);
    });

    it('should get metadata', () => {
      tr.start('hello');
      tr.setMetadata('tr-1', 'k', 'v');
      expect(tr.getMetadata('tr-1', 'k')).toBe('v');
    });

    it('should get all metadata', () => {
      tr.start('hello');
      tr.setMetadata('tr-1', 'k', 'v');
      expect(tr.getAllMetadata('tr-1')).toEqual({ k: 'v' });
    });

    it('should return false for unknown setMetadata', () => {
      expect(tr.setMetadata('unknown', 'k', 'v')).toBe(false);
    });
  });

  // ============================================================
  // children
  // ============================================================
  describe('children', () => {
    it('should get children', () => {
      const parent = tr.start('parent');
      tr.start('child', parent);
      expect(tr.getChildren(parent)).toHaveLength(1);
    });

    it('should count children', () => {
      const parent = tr.start('parent');
      tr.start('child', parent);
      expect(tr.getChildrenCount(parent)).toBe(1);
    });
  });

  // ============================================================
  // roots
  // ============================================================
  describe('roots', () => {
    it('should get roots', () => {
      tr.start('root');
      expect(tr.getRoots()).toHaveLength(1);
    });

    it('should count roots', () => {
      tr.start('root');
      expect(tr.getRootsCount()).toBe(1);
    });
  });

  // ============================================================
  // by span
  // ============================================================
  describe('by span', () => {
    it('should get by span', () => {
      tr.start('hello');
      expect(tr.getBySpan('hello')).toHaveLength(1);
    });

    it('should get all spans', () => {
      tr.start('a');
      tr.start('b');
      expect(tr.getAllSpans()).toHaveLength(2);
    });

    it('should count spans', () => {
      tr.start('a');
      tr.start('b');
      expect(tr.getSpanCount()).toBe(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get slowest', () => {
      const id = tr.start('hello');
      tr.end(id);
      expect(tr.getSlowestTrace()?.id).toBe(id);
    });

    it('should return null for empty slowest', () => {
      expect(tr.getSlowestTrace()).toBeNull();
    });

    it('should get fastest', () => {
      const id = tr.start('hello');
      tr.end(id);
      expect(tr.getFastestTrace()?.id).toBe(id);
    });

    it('should return null for empty fastest', () => {
      expect(tr.getFastestTrace()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many traces', () => {
      for (let i = 0; i < 50; i++) {
        tr.start(`s${i}`);
      }
      expect(tr.getCount()).toBe(50);
    });
  });
});