/**
 * PipelineOrchestratorV3 Tests
 * thunderbolt-design Pipeline Orchestrator v3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PipelineOrchestratorV3 } from '../PipelineOrchestratorV3';

describe('PipelineOrchestratorV3', () => {
  let orchestrator: PipelineOrchestratorV3;

  beforeEach(() => {
    orchestrator = new PipelineOrchestratorV3();
  });

  afterEach(() => {
    orchestrator.clearAll();
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('should create pipeline with stages', () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({})], parallel: false, retryCount: 0 },
      ]);
      expect(id).toBe('pipeline-1');
    });

    it('should create many pipelines', () => {
      for (let i = 0; i < 100; i++) {
        orchestrator.create([{ name: 's', tasks: [async () => ({})], parallel: false, retryCount: 0 }]);
      }
      expect(orchestrator.getPipelineCount()).toBe(100);
    });

    it('should return idle state', () => {
      const id = orchestrator.create([{ name: 's1', tasks: [async () => ({})], parallel: false, retryCount: 0 }]);
      const state = orchestrator.getState(id);
      expect(state?.status).toBe('idle');
    });
  });

  // ============================================================
  // run
  // ============================================================
  describe('run', () => {
    it('should run pipeline and complete', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({ data: 1 })], parallel: false, retryCount: 0 },
        { name: 's2', tasks: [async () => ({ data: 2 })], parallel: false, retryCount: 0 },
      ]);
      const state = await orchestrator.run(id);
      expect(state.status).toBe('completed');
    });

    it('should run parallel stage', async () => {
      const id = orchestrator.create([
        {
          name: 'parallel',
          tasks: [async () => 1, async () => 2, async () => 3],
          parallel: true,
          retryCount: 0,
        },
      ]);
      const state = await orchestrator.run(id);
      expect(state.status).toBe('completed');
      const result = state.results.get('parallel') as number[];
      expect(result).toHaveLength(3);
    });

    it('should propagate results through stages', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({ a: 1 })], parallel: false, retryCount: 0 },
        { name: 's2', tasks: [async () => ({ b: 2 })], parallel: false, retryCount: 0 },
      ]);
      const state = await orchestrator.run(id);
      expect(state.results.has('s1-0')).toBe(true);
      expect(state.results.has('s2-0')).toBe(true);
    });

    it('should fail on task error', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => { throw new Error('fail'); }], parallel: false, retryCount: 0 },
      ]);
      const state = await orchestrator.run(id);
      expect(state.status).toBe('failed');
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const id = orchestrator.create([
        {
          name: 's1',
          tasks: [async () => {
            attempts++;
            if (attempts < 3) throw new Error('transient');
            return { ok: true };
          }],
          parallel: false,
          retryCount: 2,
        },
      ]);
      const state = await orchestrator.run(id);
      expect(state.status).toBe('completed');
      expect(attempts).toBe(3);
    });
  });

  // ============================================================
  // pause / resume
  // ============================================================
  describe('pause / resume', () => {
    it('should pause running pipeline', async () => {
      const id = orchestrator.create([
        {
          name: 's1',
          tasks: [async () => { await new Promise(r => setTimeout(r, 50)); return {}; }],
          parallel: false,
          retryCount: 0,
        },
      ]);
      const runPromise = orchestrator.run(id);
      const paused = orchestrator.pause(id);
      expect(paused).toBe(true);
      const state = orchestrator.getState(id);
      expect(state?.status).toBe('paused');
    });

    it('should resume paused pipeline', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({})], parallel: false, retryCount: 0 },
        { name: 's2', tasks: [async () => ({})], parallel: false, retryCount: 0 },
      ]);
      // Start and then pause
      const runPromise = orchestrator.run(id);
      orchestrator.pause(id);
      const resumed = orchestrator.resume(id);
      expect(resumed).toBe(true);
      const state = orchestrator.getState(id);
      expect(state?.status).toBe('running');
    });

    it('should return false for unknown pipeline', () => {
      expect(orchestrator.pause('unknown')).toBe(false);
      expect(orchestrator.resume('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getState
  // ============================================================
  describe('getState', () => {
    it('should return null for unknown', () => {
      expect(orchestrator.getState('unknown')).toBeNull();
    });

    it('should return copy of results', () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({})], parallel: false, retryCount: 0 },
      ]);
      const state = orchestrator.getState(id);
      state?.results.set('fake', 'value');
      const state2 = orchestrator.getState(id);
      expect(state2?.results.has('fake')).toBe(false);
    });
  });

  // ============================================================
  // getMetrics
  // ============================================================
  describe('getMetrics', () => {
    it('should return pipeline metrics', async () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({})], parallel: false, retryCount: 0 },
        { name: 's2', tasks: [async () => ({})], parallel: false, retryCount: 0 },
      ]);
      const metrics = orchestrator.getMetrics(id);
      expect(metrics?.stages).toBe(2);
    });

    it('should return null for unknown', () => {
      expect(orchestrator.getMetrics('unknown')).toBeNull();
    });
  });

  // ============================================================
  // deletePipeline
  // ============================================================
  describe('deletePipeline', () => {
    it('should delete pipeline', () => {
      const id = orchestrator.create([
        { name: 's1', tasks: [async () => ({})], parallel: false, retryCount: 0 },
      ]);
      expect(orchestrator.deletePipeline(id)).toBe(true);
      expect(orchestrator.getState(id)).toBeNull();
    });

    it('should return false for unknown', () => {
      expect(orchestrator.deletePipeline('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getAllPipelines / getActivePipelines
  // ============================================================
  describe('getAllPipelines / getActivePipelines', () => {
    it('should return all pipeline ids', () => {
      orchestrator.create([{ name: 's', tasks: [async () => ({})], parallel: false, retryCount: 0 }]);
      orchestrator.create([{ name: 's', tasks: [async () => ({})], parallel: false, retryCount: 0 }]);
      expect(orchestrator.getAllPipelines()).toHaveLength(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle empty stages', () => {
      const id = orchestrator.create([]);
      expect(id).toBe('pipeline-1');
    });

    it('should handle many parallel tasks', async () => {
      const tasks = Array.from({ length: 50 }, (_, i) => async () => i);
      const id = orchestrator.create([{ name: 'parallel', tasks, parallel: true, retryCount: 0 }]);
      const state = await orchestrator.run(id);
      expect(state.status).toBe('completed');
    });

    it('should handle retry exhaustion', async () => {
      const id = orchestrator.create([
        {
          name: 's1',
          tasks: [async () => { throw new Error('always fails'); }],
          parallel: false,
          retryCount: 2,
        },
      ]);
      const state = await orchestrator.run(id);
      expect(state.status).toBe('failed');
    });
  });
});