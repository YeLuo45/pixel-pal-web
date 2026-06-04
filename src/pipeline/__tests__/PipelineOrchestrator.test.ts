import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PipelineOrchestrator } from '../PipelineOrchestrator';

describe('PipelineOrchestrator', () => {
  let orchestrator: PipelineOrchestrator;

  beforeEach(() => {
    // Clean slate for each test
  });

  afterEach(() => {
    // Reset if needed
  });

  describe('constructor', () => {
    it('should create an orchestrator with config', () => {
      orchestrator = new PipelineOrchestrator({
        maxParallel: 3,
        retryAttempts: 2,
        retryDelay: 100,
      });

      const status = orchestrator.getStatus();
      expect(status.pipeline).toBe('idle');
      expect(status.stages).toHaveLength(0);
    });
  });

  describe('addStage', () => {
    it('should add a stage and return its id', () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 1, retryDelay: 50 });

      const id = orchestrator.addStage({
        id: 'stage1',
        name: 'Test Stage',
        execute: async () => 'result1',
        dependencies: [],
      });

      expect(id).toBe('stage1');
      const status = orchestrator.getStatus();
      expect(status.stages).toHaveLength(1);
      expect(status.stages[0].id).toBe('stage1');
      expect(status.stages[0].status).toBe('pending');
    });

    it('should throw if stage id already exists', () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 1, retryDelay: 50 });

      orchestrator.addStage({
        id: 'stage1',
        name: 'Stage 1',
        execute: async () => {},
        dependencies: [],
      });

      expect(() =>
        orchestrator.addStage({
          id: 'stage1',
          name: 'Stage 1 Duplicate',
          execute: async () => {},
          dependencies: [],
        })
      ).toThrow('Stage with id "stage1" already exists');
    });

    it('should throw if pipeline is running', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'stage1',
        name: 'Stage 1',
        execute: async () => {
          await new Promise((r) => setTimeout(r, 50));
          return 'result';
        },
        dependencies: [],
      });

      // Start running - don't await
      const runPromise = orchestrator.run();
      
      // Small delay to ensure run has started
      await new Promise((r) => setTimeout(r, 20));

      expect(() =>
        orchestrator.addStage({
          id: 'stage2',
          name: 'Stage 2',
          execute: async () => {},
          dependencies: [],
        })
      ).toThrow('Cannot add stages while pipeline is running');

      // Clean up - wait for pipeline to finish
      try {
        await runPromise;
      } catch {}
    });
  });

  describe('run', () => {
    it('should execute all stages and return results', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => 'result1',
        dependencies: [],
      });

      orchestrator.addStage({
        id: 's2',
        name: 'Stage 2',
        execute: async () => 'result2',
        dependencies: ['s1'],
      });

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      expect(result.results).toContain('result1');
      expect(result.results).toContain('result2');
    });

    it('should respect dependency order', async () => {
      const executionOrder: string[] = [];
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => {
          executionOrder.push('s1');
          return 'r1';
        },
        dependencies: [],
      });

      orchestrator.addStage({
        id: 's2',
        name: 'Stage 2',
        execute: async () => {
          executionOrder.push('s2');
          return 'r2';
        },
        dependencies: ['s1'],
      });

      orchestrator.addStage({
        id: 's3',
        name: 'Stage 3',
        execute: async () => {
          executionOrder.push('s3');
          return 'r3';
        },
        dependencies: ['s2'],
      });

      await orchestrator.run();

      expect(executionOrder).toEqual(['s1', 's2', 's3']);
    });

    it('should execute parallel stages in same group concurrently', async () => {
      let startTime = 0;
      let endTime = 0;
      let parallelStarted = 0;

      orchestrator = new PipelineOrchestrator({ maxParallel: 4, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'p1',
        name: 'Parallel 1',
        parallelGroup: 'group1',
        execute: async () => {
          if (parallelStarted === 0) startTime = Date.now();
          parallelStarted++;
          await new Promise((r) => setTimeout(r, 50));
          endTime = Date.now();
          return 'r1';
        },
        dependencies: [],
      });

      orchestrator.addStage({
        id: 'p2',
        name: 'Parallel 2',
        parallelGroup: 'group1',
        execute: async () => {
          if (parallelStarted === 0) startTime = Date.now();
          parallelStarted++;
          await new Promise((r) => setTimeout(r, 50));
          return 'r2';
        },
        dependencies: [],
      });

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      // Both should have started within a short time window (concurrent)
      expect(parallelStarted).toBe(2);
      // End time should be close to start time + 50ms (not 100ms)
      expect(endTime - startTime).toBeLessThan(80);
    });

    it('should throw when pipeline already running', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => {
          // Long delay so first run is definitely started
          await new Promise((r) => setTimeout(r, 100));
          return 'result';
        },
        dependencies: [],
      });

      // Start first run
      const p1 = orchestrator.run();

      // Wait enough for run() to start
      await new Promise((r) => setTimeout(r, 20));

      // Second run should throw - use expect().toThrow() which handles async
      await expect(orchestrator.run()).rejects.toThrow('Pipeline is already running');

      // Wait for first run to complete
      await p1;
    });

    it('should handle stage execution failure', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'fail',
        name: 'Failing Stage',
        execute: async () => {
          throw new Error('Stage failed');
        },
        dependencies: [],
      });

      await expect(orchestrator.run()).rejects.toThrow('Stage failed');
      expect(orchestrator.getStatus().pipeline).toBe('failed');
    });

    it('should handle circular dependency detection', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'a',
        name: 'Stage A',
        execute: async () => {},
        dependencies: ['b'],
      });

      orchestrator.addStage({
        id: 'b',
        name: 'Stage B',
        execute: async () => {},
        dependencies: ['a'],
      });

      await expect(orchestrator.run()).rejects.toThrow('Pipeline contains circular dependencies');
    });

    it('should throw for non-existent dependency', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => {},
        dependencies: ['nonexistent'],
      });

      await expect(orchestrator.run()).rejects.toThrow('depends on non-existent stage');
    });
  });

  describe('pause and resume', () => {
    it('should pause and resume a running pipeline', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      let canResume = false;

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => {
          orchestrator.pause();
          canResume = true;
          // Wait a bit to verify we're paused
          await new Promise((r) => setTimeout(r, 30));
          return 'result1';
        },
        dependencies: [],
      });

      orchestrator.addStage({
        id: 's2',
        name: 'Stage 2',
        execute: async () => 'result2',
        dependencies: ['s1'],
      });

      const runPromise = orchestrator.run();

      // Wait for stage to start and pause
      await new Promise((r) => setTimeout(r, 20));

      expect(orchestrator.getStatus().pipeline).toBe('paused');
      expect(canResume).toBe(true);

      orchestrator.resume();
      const result = await runPromise;

      expect(result.status).toBe('completed');
    });

    it('should throw when pausing non-running pipeline', () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 1, retryDelay: 50 });

      expect(() => orchestrator.pause()).toThrow('Can only pause a running pipeline');
    });

    it('should throw when resuming non-paused pipeline', () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 1, retryDelay: 50 });

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => 'result',
        dependencies: [],
      });

      expect(() => orchestrator.resume()).toThrow('Pipeline is not paused');
    });
  });

  describe('reset', () => {
    it('should reset pipeline to idle state', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => 'result',
        dependencies: [],
      });

      await orchestrator.run();

      orchestrator.reset();

      const status = orchestrator.getStatus();
      expect(status.pipeline).toBe('idle');
      expect(status.stages[0].status).toBe('pending');
    });

    it('should reset stage retries after failure', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 2, retryDelay: 10 });

      orchestrator.addStage({
        id: 'fail',
        name: 'Failing Stage',
        execute: async () => {
          throw new Error('Fail');
        },
        dependencies: [],
      });

      await expect(orchestrator.run()).rejects.toThrow();
      expect(orchestrator.getStatus().stages[0].retries).toBe(2);

      orchestrator.reset();
      expect(orchestrator.getStatus().stages[0].retries).toBe(0);
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed stages and eventually succeed', async () => {
      let attempts = 0;
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 3, retryDelay: 10 });

      orchestrator.addStage({
        id: 'retry',
        name: 'Retry Stage',
        execute: async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error(`Attempt ${attempts} failed`);
          }
          return 'success';
        },
        dependencies: [],
      });

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      expect(attempts).toBe(3);
    });

    it('should fail after exhausting retry attempts', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 1, retryDelay: 10 });

      orchestrator.addStage({
        id: 'fail',
        name: 'Always Fail',
        execute: async () => {
          throw new Error('Always fails');
        },
        dependencies: [],
      });

      await expect(orchestrator.run()).rejects.toThrow('Always fails');
      expect(orchestrator.getStatus().stages[0].retries).toBe(1);
    });
  });

  describe('getStatus', () => {
    it('should return current pipeline and stages status', () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 1, retryDelay: 50 });

      orchestrator.addStage({
        id: 's1',
        name: 'Stage 1',
        execute: async () => 'result',
        dependencies: [],
      });

      const status = orchestrator.getStatus();

      expect(status.pipeline).toBe('idle');
      expect(status.stages).toHaveLength(1);
      expect(status.stages[0].id).toBe('s1');
      expect(status.stages[0].status).toBe('pending');
    });
  });

  describe('complex scenarios', () => {
    it('should handle diamond dependency pattern', async () => {
      const order: string[] = [];
      orchestrator = new PipelineOrchestrator({ maxParallel: 4, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'start',
        name: 'Start',
        execute: async () => {
          order.push('start');
          return 'start';
        },
        dependencies: [],
      });

      orchestrator.addStage({
        id: 'left',
        name: 'Left',
        execute: async () => {
          order.push('left');
          return 'left';
        },
        dependencies: ['start'],
      });

      orchestrator.addStage({
        id: 'right',
        name: 'Right',
        execute: async () => {
          order.push('right');
          return 'right';
        },
        dependencies: ['start'],
      });

      orchestrator.addStage({
        id: 'end',
        name: 'End',
        execute: async () => {
          order.push('end');
          return 'end';
        },
        dependencies: ['left', 'right'],
      });

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      expect(order[0]).toBe('start');
      expect(order[order.length - 1]).toBe('end');
      // left and right should come after start but before end
      const startIdx = order.indexOf('start');
      const leftIdx = order.indexOf('left');
      const rightIdx = order.indexOf('right');
      const endIdx = order.indexOf('end');

      expect(startIdx).toBeLessThan(leftIdx);
      expect(startIdx).toBeLessThan(rightIdx);
      expect(leftIdx).toBeLessThan(endIdx);
      expect(rightIdx).toBeLessThan(endIdx);
    });

    it('should handle three parallel stages in same group', async () => {
      let count = 0;

      orchestrator = new PipelineOrchestrator({ maxParallel: 4, retryAttempts: 0, retryDelay: 10 });

      for (let i = 1; i <= 3; i++) {
        const stageId = `parallel${i}`;
        orchestrator.addStage({
          id: stageId,
          name: `Parallel ${i}`,
          parallelGroup: 'parallel',
          execute: async () => {
            count++;
            return `result${i}`;
          },
          dependencies: [],
        });
      }

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      expect(count).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle empty pipeline', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(0);
    });

    it('should handle stage that returns undefined', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'undef',
        name: 'Undefined Stage',
        execute: async () => undefined,
        dependencies: [],
      });

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      expect(result.results).toContain(undefined);
    });

    it('should handle stage that returns null', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'null',
        name: 'Null Stage',
        execute: async () => null,
        dependencies: [],
      });

      const result = await orchestrator.run();

      expect(result.status).toBe('completed');
      expect(result.results).toContain(null);
    });

    it('should handle async rejection properly', async () => {
      orchestrator = new PipelineOrchestrator({ maxParallel: 2, retryAttempts: 0, retryDelay: 10 });

      orchestrator.addStage({
        id: 'reject',
        name: 'Reject Stage',
        execute: async () => Promise.reject(new Error('Async rejection')),
        dependencies: [],
      });

      await expect(orchestrator.run()).rejects.toThrow('Async rejection');
    });
  });
});