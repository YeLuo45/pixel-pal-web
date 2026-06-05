/**
 * PipelineManager Tests
 * thunderbolt-design Pipeline Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PipelineManager } from '../PipelineManager';

describe('PipelineManager', () => {
  let manager: PipelineManager;

  beforeEach(() => {
    manager = new PipelineManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  // ============================================================
  // createPipeline
  // ============================================================
  describe('createPipeline', () => {
    it('should create pipeline', () => {
      const id = manager.createPipeline('test');
      expect(id).toBe('pipe-1');
    });

    it('should have no stages initially', () => {
      const id = manager.createPipeline('test');
      expect(manager.getStageCount(id)).toBe(0);
    });
  });

  // ============================================================
  // addStage
  // ============================================================
  describe('addStage', () => {
    it('should add stage', () => {
      const id = manager.createPipeline('test');
      expect(manager.addStage(id, 's1', async () => true)).toBe('stage-1');
    });

    it('should return null for unknown pipeline', () => {
      expect(manager.addStage('unknown', 's1', async () => true)).toBeNull();
    });
  });

  // ============================================================
  // runPipeline
  // ============================================================
  describe('runPipeline', () => {
    it('should run pipeline', async () => {
      const id = manager.createPipeline('test');
      manager.addStage(id, 's1', async () => true);
      expect(await manager.runPipeline(id)).toBe(true);
    });

    it('should mark stages completed', async () => {
      const id = manager.createPipeline('test');
      const stageId = manager.addStage(id, 's1', async () => true);
      await manager.runPipeline(id);
      expect(manager.isStageCompleted(id, stageId!)).toBe(true);
    });

    it('should stop on failed stage', async () => {
      const id = manager.createPipeline('test');
      manager.addStage(id, 's1', async () => false);
      expect(await manager.runPipeline(id)).toBe(false);
    });

    it('should return false for unknown', async () => {
      expect(await manager.runPipeline('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      manager.createPipeline('test');
      const stats = manager.getStats();
      expect(stats.pipelines).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pipeline', () => {
      manager.createPipeline('test');
      expect(manager.getPipeline('pipe-1')?.name).toBe('test');
    });

    it('should get all', () => {
      manager.createPipeline('a');
      manager.createPipeline('b');
      expect(manager.getAllPipelines()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = manager.createPipeline('test');
      expect(manager.removePipeline(id)).toBe(true);
    });

    it('should check existence', () => {
      manager.createPipeline('test');
      expect(manager.hasPipeline('pipe-1')).toBe(true);
    });

    it('should count', () => {
      expect(manager.getCount()).toBe(0);
      manager.createPipeline('test');
      expect(manager.getCount()).toBe(1);
    });
  });

  // ============================================================
  // name / stages
  // ============================================================
  describe('name / stages', () => {
    it('should get name', () => {
      manager.createPipeline('test');
      expect(manager.getName('pipe-1')).toBe('test');
    });

    it('should get stages', () => {
      const id = manager.createPipeline('test');
      manager.addStage(id, 's1', async () => true);
      expect(manager.getStages(id)).toHaveLength(1);
    });

    it('should get stage count', () => {
      const id = manager.createPipeline('test');
      manager.addStage(id, 's1', async () => true);
      expect(manager.getStageCount(id)).toBe(1);
    });

    it('should get stage', () => {
      const id = manager.createPipeline('test');
      const stageId = manager.addStage(id, 's1', async () => true);
      expect(manager.getStage(id, stageId!)?.name).toBe('s1');
    });

    it('should remove stage', () => {
      const id = manager.createPipeline('test');
      const stageId = manager.addStage(id, 's1', async () => true);
      expect(manager.removeStage(id, stageId!)).toBe(true);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should get stage status', () => {
      const id = manager.createPipeline('test');
      const stageId = manager.addStage(id, 's1', async () => true);
      expect(manager.getStageStatus(id, stageId!)).toBe('pending');
    });

    it('should check isStagePending', () => {
      const id = manager.createPipeline('test');
      const stageId = manager.addStage(id, 's1', async () => true);
      expect(manager.isStagePending(id, stageId!)).toBe(true);
    });

    it('should check isStageRunning', () => {
      expect(manager.isStageRunning('unknown', 'unknown')).toBe(false);
    });

    it('should check isStageCompleted', () => {
      expect(manager.isStageCompleted('unknown', 'unknown')).toBe(false);
    });

    it('should check isStageFailed', () => {
      expect(manager.isStageFailed('unknown', 'unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset stage', async () => {
      const id = manager.createPipeline('test');
      const stageId = manager.addStage(id, 's1', async () => true);
      await manager.runPipeline(id);
      expect(manager.resetStage(id, stageId!)).toBe(true);
    });

    it('should reset pipeline', async () => {
      const id = manager.createPipeline('test');
      manager.addStage(id, 's1', async () => true);
      await manager.runPipeline(id);
      expect(manager.resetPipeline(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(manager.resetStage('unknown', 'unknown')).toBe(false);
      expect(manager.resetPipeline('unknown')).toBe(false);
    });
  });

  // ============================================================
  // completed / failed
  // ============================================================
  describe('completed / failed', () => {
    it('should get completed stages', async () => {
      const id = manager.createPipeline('test');
      manager.addStage(id, 's1', async () => true);
      await manager.runPipeline(id);
      expect(manager.getCompletedStages(id)).toHaveLength(1);
    });

    it('should get failed stages', async () => {
      const id = manager.createPipeline('test');
      manager.addStage(id, 's1', async () => false);
      await manager.runPipeline(id);
      expect(manager.getFailedStages(id)).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      manager.createPipeline('test');
      expect(manager.getCreatedAt('pipe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      manager.createPipeline('test');
      expect(manager.getUpdatedAt('pipe-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many pipelines', () => {
      for (let i = 0; i < 50; i++) {
        manager.createPipeline(`p${i}`);
      }
      expect(manager.getCount()).toBe(50);
    });
  });
});