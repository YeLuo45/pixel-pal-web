/**
 * PipelineOrchestrator Tests
 * thunderbolt Pipeline Orchestrator v3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PipelineOrchestrator } from '../PipelineOrchestrator';

describe('PipelineOrchestrator', () => {
  let orchestrator: PipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new PipelineOrchestrator();
  });

  afterEach(() => {
    orchestrator.clearAll();
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('should create a pipeline', () => {
      const id = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      expect(id).toMatch(/^pipeline-/);
    });

    it('should be retrievable', () => {
      const id = orchestrator.create([]);
      expect(orchestrator.getStatus(id)).toBe('idle');
    });

    it('should allow multiple pipelines', () => {
      const id1 = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      const id2 = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      expect(id1).not.toBe(id2);
    });

    it('should handle empty stages', () => {
      const id = orchestrator.create([]);
      expect(orchestrator.getStatus(id)).toBe('idle');
    });

    it('should handle many stages', () => {
      const stages = Array(10).fill(null).map((_, i) => ({
        name: `stage-${i}`,
        tasks: [async () => i],
        parallel: false,
        retryCount: 0,
      }));
      const id = orchestrator.create(stages);
      expect(orchestrator.getStatus(id)).toBe('idle');
    });
  });

  // ============================================================
  // run
  // ============================================================
  describe('run', () => {
    it('should run simple pipeline', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => 'result'], parallel: false, retryCount: 0 },
      ]);
      const result = await orchestrator.run(id);
      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(1);
    });

    it('should collect results from all stages', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 },
        { name: 's2', tasks: [async () => 2], parallel: false, retryCount: 0 },
      ]);
      const result = await orchestrator.run(id);
      expect(result.results).toEqual([1, 2]);
    });

    it('should handle parallel stage', async () => {
      const id = orchestrator.create([
        {
          name: 'parallel',
          tasks: [async () => 1, async () => 2, async () => 3],
          parallel: true,
          retryCount: 0,
        },
      ]);
      const result = await orchestrator.run(id);
      expect(result.results).toContain(1);
      expect(result.results).toContain(2);
      expect(result.results).toContain(3);
    });

    it('should fail on error', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => { throw new Error('fail'); }], parallel: false, retryCount: 0 },
      ]);
      const result = await orchestrator.run(id);
      expect(result.status).toBe('failed');
      expect(result.errors).toHaveLength(1);
    });

    it('should retry failed stage', async () => {
      let attempts = 0;
      const id = orchestrator.create([
        {
          name: 'retry',
          tasks: [async () => { attempts++; if (attempts < 3) throw new Error('temp'); return 'done'; }],
          parallel: false,
          retryCount: 2,
        },
      ]);
      const result = await orchestrator.run(id);
      expect(result.status).toBe('completed');
      expect(attempts).toBe(3);
    });

    it('should fail after max retries', async () => {
      const id = orchestrator.create([
        {
          name: 'retry',
          tasks: [async () => { throw new Error('permanent'); }],
          parallel: false,
          retryCount: 1,
        },
      ]);
      const result = await orchestrator.run(id);
      expect(result.status).toBe('failed');
      expect(result.errors).toHaveLength(1);
    });

    it('should throw for unknown pipeline', async () => {
      await expect(orchestrator.run('unknown')).rejects.toThrow('not found');
    });

    it('should include duration in result', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => { await new Promise(r => setTimeout(r, 10)); return 1; }], parallel: false, retryCount: 0 },
      ]);
      const result = await orchestrator.run(id);
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // pause / resume
  // ============================================================
  describe('pause/resume', () => {
    it('should pause running pipeline', async () => {
      const id = orchestrator.create([
        {
          name: 'slow',
          tasks: [async () => { await new Promise(r => setTimeout(r, 50)); return 1; }],
          parallel: false,
          retryCount: 0,
        },
        { name: 's2', tasks: [async () => 2], parallel: false, retryCount: 0 },
      ]);

      // Start but immediately pause
      const runPromise = orchestrator.run(id);
      orchestrator.pause(id);
      const result = await runPromise;

      // Should be paused before completing second stage
      expect(result.status).toBe('paused');
      expect(result.results).toHaveLength(1); // Only first stage completed
    });

    it('should resume paused pipeline', async () => {
      const id = orchestrator.create([
        {
          name: 'slow',
          tasks: [async () => { await new Promise(r => setTimeout(r, 20)); return 1; }],
          parallel: false,
          retryCount: 0,
        },
        { name: 's2', tasks: [async () => 2], parallel: false, retryCount: 0 },
      ]);

      const runPromise = orchestrator.run(id);
      orchestrator.pause(id);
      await runPromise;

      orchestrator.resume(id);
      const pipeline = orchestrator.getPipeline(id);
      expect(pipeline?.status).toBe('running');
    });

    it('should do nothing when pausing non-running pipeline', () => {
      const id = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      orchestrator.pause(id);
      expect(orchestrator.getStatus(id)).toBe('idle');
    });

    it('should do nothing when resuming non-paused pipeline', () => {
      const id = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      orchestrator.resume(id);
      expect(orchestrator.getStatus(id)).toBe('idle');
    });
  });

  // ============================================================
  // cancel
  // ============================================================
  describe('cancel', () => {
    it('should cancel running pipeline', () => {
      const id = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      orchestrator.cancel(id);
      expect(orchestrator.getStatus(id)).toBe('failed');
    });

    it('should do nothing for unknown pipeline', () => {
      expect(() => orchestrator.cancel('unknown')).not.toThrow();
    });
  });

  // ============================================================
  // getStatus
  // ============================================================
  describe('getStatus', () => {
    it('should return idle for new pipeline', () => {
      const id = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      expect(orchestrator.getStatus(id)).toBe('idle');
    });

    it('should return idle for unknown pipeline', () => {
      expect(orchestrator.getStatus('unknown')).toBe('idle');
    });

    it('should reflect status changes', async () => {
      const id = orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      await orchestrator.run(id);
      expect(orchestrator.getStatus(id)).toBe('completed');
    });
  });

  // ============================================================
  // getAllPipelines
  // ============================================================
  describe('getAllPipelines', () => {
    it('should return all pipelines', () => {
      orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      orchestrator.create([{ name: 's1', tasks: [async () => 1], parallel: false, retryCount: 0 }]);
      expect(orchestrator.getAllPipelines()).toHaveLength(2);
    });

    it('should return empty for fresh orchestrator', () => {
      expect(orchestrator.getAllPipelines()).toHaveLength(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle empty tasks array in stage', () => {
      const id = orchestrator.create([{ name: 'empty', tasks: [], parallel: false, retryCount: 0 }]);
      const result = orchestrator.run(id);
      expect(result).resolves.toBeDefined();
    });

    it('should handle many parallel tasks', async () => {
      const tasks = Array(50).fill(null).map((_, i) => async () => i);
      const id = orchestrator.create([{ name: 'many', tasks, parallel: true, retryCount: 0 }]);
      const result = await orchestrator.run(id);
      expect(result.results).toHaveLength(50);
    });

    it('should handle mixed parallel and sequential stages', async () => {
      const id = orchestrator.create([
        { name: 'seq1', tasks: [async () => 1], parallel: false, retryCount: 0 },
        { name: 'parallel', tasks: [async () => 2, async () => 3], parallel: true, retryCount: 0 },
        { name: 'seq2', tasks: [async () => 4], parallel: false, retryCount: 0 },
      ]);
      const result = await orchestrator.run(id);
      expect(result.results).toEqual([1, 2, 3, 4]);
    });

    it('should propagate results through stages', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({ a: 1 })], parallel: false, retryCount: 0 },
        { name: 's2', tasks: [async () => ({ b: 2 })], parallel: false, retryCount: 0 },
      ]);
      const result = await orchestrator.run(id);
      expect(result.results).toHaveLength(2);
      expect(result.results).toContainEqual({ a: 1 });
      expect(result.results).toContainEqual({ b: 2 });
    });
  });
});