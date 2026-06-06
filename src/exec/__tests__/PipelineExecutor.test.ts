/**
 * PipelineExecutor Tests
 * thunderbolt-design Pipeline Executor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PipelineExecutor } from '../PipelineExecutor';

describe('PipelineExecutor', () => {
  let pe: PipelineExecutor;

  beforeEach(() => {
    pe = new PipelineExecutor();
  });

  afterEach(() => {
    pe.clearAll();
  });

  // ============================================================
  // define / execute / rollback
  // ============================================================
  describe('define / execute / rollback', () => {
    it('should define', () => {
      expect(pe.define('p1', ['s1', 's2'])).toBe('pe-1');
    });

    it('should execute', () => {
      const id = pe.define('p1', ['s1']);
      expect(pe.execute(id)).toBe(true);
    });

    it('should mark completed after execute', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.getStatus(id)).toBe('completed');
    });

    it('should not execute completed', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      // After execute, status is 'completed' (synchronous), not 'running'
      expect(pe.execute(id)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(pe.execute('unknown')).toBe(false);
    });

    it('should rollback', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.rollback(id)).toBe(true);
    });

    it('should not rollback idle', () => {
      const id = pe.define('p1', ['s1']);
      expect(pe.rollback(id)).toBe(false);
    });

    it('should return false for unknown rollback', () => {
      expect(pe.rollback('unknown')).toBe(false);
    });

    it('should track history', () => {
      const id = pe.define('p1', ['s1', 's2']);
      pe.execute(id);
      expect(pe.getHistory(id)).toEqual(['s1', 's2']);
    });

    it('should track current stage', () => {
      const id = pe.define('p1', ['s1', 's2', 's3']);
      pe.execute(id);
      expect(pe.getCurrentStage(id)).toBe(3);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.define('p1', ['s1']);
      const stats = pe.getStats();
      expect(stats.pipelines).toBe(1);
    });

    it('should count executed', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.getStats().executed).toBe(1);
    });

    it('should count rolled back', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      pe.rollback(id);
      expect(pe.getStats().rolledBack).toBe(1);
    });

    it('should count completed', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.getStats().completed).toBe(1);
    });

    it('should count idle', () => {
      pe.define('p1', ['s1']);
      expect(pe.getStats().idle).toBe(1);
    });

    it('should compute avg stages', () => {
      pe.define('p1', ['s1', 's2']);
      pe.define('p2', ['s1']);
      expect(pe.getStats().avgStages).toBe(1.5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pipeline', () => {
      pe.define('p1', ['s1']);
      expect(pe.getPipeline('pe-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pe.define('p1', ['s1']);
      expect(pe.getAllPipelines()).toHaveLength(1);
    });

    it('should remove', () => {
      pe.define('p1', ['s1']);
      expect(pe.removePipeline('pe-1')).toBe(true);
    });

    it('should check existence', () => {
      pe.define('p1', ['s1']);
      expect(pe.hasPipeline('pe-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.define('p1', ['s1']);
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pe.define('p1', ['s1']);
      expect(pe.getName('pe-1')).toBe('p1');
    });

    it('should get stages', () => {
      pe.define('p1', ['s1', 's2']);
      expect(pe.getStages('pe-1')).toEqual(['s1', 's2']);
    });

    it('should get stage count', () => {
      pe.define('p1', ['s1', 's2']);
      expect(pe.getStageCount('pe-1')).toBe(2);
    });

    it('should get status', () => {
      pe.define('p1', ['s1']);
      expect(pe.getStatus('pe-1')).toBe('idle');
    });

    it('should get executed', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.getExecuted(id)).toBe(1);
    });

    it('should get rolled back', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      pe.rollback(id);
      expect(pe.getRolledBack(id)).toBe(1);
    });

    it('should get current stage', () => {
      pe.define('p1', ['s1']);
      expect(pe.getCurrentStage('pe-1')).toBe(0);
    });

    it('should get history', () => {
      pe.define('p1', ['s1']);
      expect(pe.getHistory('pe-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isIdle', () => {
      pe.define('p1', ['s1']);
      expect(pe.isIdle('pe-1')).toBe(true);
    });

    it('should check isRunning', () => {
      pe.define('p1', ['s1']);
      expect(pe.isRunning('pe-1')).toBe(false);
    });

    it('should check isCompleted', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.isCompleted('pe-1')).toBe(true);
    });

    it('should check isRolledback', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      pe.rollback(id);
      expect(pe.isRolledback('pe-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      const id = pe.define('p1', ['s1']);
      expect(pe.setName(id, 'p2')).toBe(true);
    });

    it('should set stages', () => {
      const id = pe.define('p1', ['s1']);
      expect(pe.setStages(id, ['s2'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pe.setName('unknown', 'p')).toBe(false);
      expect(pe.setStages('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.reset(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(pe.reset('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      pe.resetAll();
      expect(pe.getExecuted(id)).toBe(0);
    });
  });

  // ============================================================
  // by name / status
  // ============================================================
  describe('by name / status', () => {
    it('should get by name', () => {
      pe.define('p1', ['s1']);
      expect(pe.getByName('p1')).toHaveLength(1);
    });

    it('should get by status', () => {
      pe.define('p1', ['s1']);
      expect(pe.getByStatus('idle')).toHaveLength(1);
    });

    it('should get all names', () => {
      pe.define('p1', ['s1']);
      pe.define('p2', ['s1']);
      expect(pe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pe.define('p1', ['s1']);
      expect(pe.getNameCount()).toBe(1);
    });

    it('should get by min stages', () => {
      pe.define('p1', ['s1', 's2']);
      expect(pe.getByMinStages(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most executed', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.getMostExecuted()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(pe.getMostExecuted()).toBeNull();
    });

    it('should get newest', () => {
      pe.define('p1', ['s1']);
      expect(pe.getNewest()?.id).toBe('pe-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.define('p1', ['s1']);
      expect(pe.getOldest()?.id).toBe('pe-1');
    });

    it('should return null for empty oldest', () => {
      expect(pe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pe.define('p1', ['s1']);
      expect(pe.getCreatedAt('pe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.define('p1', ['s1']);
      pe.execute(id);
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many pipelines', () => {
      for (let i = 0; i < 50; i++) {
        pe.define(`p${i}`, ['s1']);
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});