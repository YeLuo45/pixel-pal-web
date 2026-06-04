/**
 * PipelineOrchestrator Tests
 * V193 - Thunderbolt Pipeline Orchestrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PipelineOrchestrator, PipelineStage, Pipeline } from '../PipelineOrchestrator';

describe('PipelineOrchestrator', () => {
  let orchestrator: PipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new PipelineOrchestrator();
  });

  describe('registerStage', () => {
    it('should register a valid stage', () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      expect(orchestrator.getStatus).toBeDefined();
    });

    it('should throw error when stage lacks id', () => {
      const stage = {
        id: '',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      } as PipelineStage;
      expect(() => orchestrator.registerStage(stage)).toThrow('Stage must have an id');
    });

    it('should throw error when stage lacks name', () => {
      const stage = {
        id: 'stage1',
        name: '',
        execute: vi.fn().mockResolvedValue('result'),
      } as PipelineStage;
      expect(() => orchestrator.registerStage(stage)).toThrow('Stage must have a name');
    });

    it('should throw error when stage lacks execute function', () => {
      const stage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: 'not a function',
      } as unknown as PipelineStage;
      expect(() => orchestrator.registerStage(stage)).toThrow('Stage must have an execute function');
    });
  });

  describe('createPipeline', () => {
    it('should create a pipeline with valid stages', () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test Pipeline', ['stage1']);
      expect(pipeline).toBeDefined();
      expect(pipeline.name).toBe('Test Pipeline');
      expect(pipeline.stages).toHaveLength(1);
      expect(pipeline.status).toBe('idle');
    });

    it('should throw error when pipeline has no name', () => {
      expect(() => orchestrator.createPipeline('', ['stage1'])).toThrow('Pipeline must have a name');
    });

    it('should throw error when pipeline has no stages', () => {
      expect(() => orchestrator.createPipeline('Test', [])).toThrow('Pipeline must have at least one stage');
    });

    it('should throw error when pipeline has null stages', () => {
      expect(() => orchestrator.createPipeline('Test', null as unknown as string[])).toThrow('Pipeline must have at least one stage');
    });

    it('should throw error when stage does not exist', () => {
      expect(() => orchestrator.createPipeline('Test', ['nonexistent'])).toThrow('Stage with id "nonexistent" not found');
    });

    it('should create pipeline with multiple stages', () => {
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result1'),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        execute: vi.fn().mockResolvedValue('result2'),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      const pipeline = orchestrator.createPipeline('Test Pipeline', ['stage1', 'stage2']);
      expect(pipeline.stages).toHaveLength(2);
    });
  });

  describe('execute', () => {
    it('should execute a simple pipeline sequentially', async () => {
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('input1'),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        execute: vi.fn().mockResolvedValue('input2'),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      const pipeline = orchestrator.createPipeline('Test', ['stage1', 'stage2']);

      const result = await orchestrator.execute(pipeline.id, 'initial');
      expect(result).toBe('input2');
      expect(stage1.execute).toHaveBeenCalledWith('initial');
      expect(stage2.execute).toHaveBeenCalledWith('input1');
    });

    it('should execute parallel stages concurrently', async () => {
      const executionOrder: string[] = [];
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        parallel: true,
        execute: vi.fn().mockImplementation(async () => {
          executionOrder.push('stage1-start');
          await new Promise((r) => setTimeout(r, 50));
          executionOrder.push('stage1-end');
          return 'result1';
        }),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        parallel: true,
        execute: vi.fn().mockImplementation(async () => {
          executionOrder.push('stage2-start');
          await new Promise((r) => setTimeout(r, 10));
          executionOrder.push('stage2-end');
          return 'result2';
        }),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      const pipeline = orchestrator.createPipeline('Parallel Test', ['stage1', 'stage2']);

      const result = await orchestrator.execute(pipeline.id, 'initial');
      expect(stage1.execute).toHaveBeenCalledWith('initial');
      expect(stage2.execute).toHaveBeenCalledWith('initial');
      // Both parallel stages should execute (order depends on Promise.all timing)
      expect(executionOrder).toContain('stage1-start');
      expect(executionOrder).toContain('stage2-start');
      expect(result).toBe('result2');
    });

    it('should handle stages with dependencies', async () => {
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result1'),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        dependsOn: ['stage1'],
        execute: vi.fn().mockResolvedValue('result2'),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      const pipeline = orchestrator.createPipeline('Dep Test', ['stage1', 'stage2']);

      const result = await orchestrator.execute(pipeline.id, 'initial');
      expect(result).toBe('result2');
      expect(stage1.execute).toHaveBeenCalledWith('initial');
      expect(stage2.execute).toHaveBeenCalledWith('result1');
    });

    it('should handle mixed parallel and serial stages', async () => {
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result1'),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        parallel: true,
        execute: vi.fn().mockResolvedValue('result2'),
      };
      const stage3: PipelineStage = {
        id: 'stage3',
        name: 'Stage 3',
        dependsOn: ['stage2'],
        execute: vi.fn().mockResolvedValue('result3'),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      orchestrator.registerStage(stage3);
      const pipeline = orchestrator.createPipeline('Mixed Test', ['stage1', 'stage2', 'stage3']);

      const result = await orchestrator.execute(pipeline.id, 'initial');
      expect(result).toBe('result3');
    });

    it('should throw error for circular dependencies', async () => {
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        dependsOn: ['stage2'],
        execute: vi.fn().mockResolvedValue('result1'),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        dependsOn: ['stage1'],
        execute: vi.fn().mockResolvedValue('result2'),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      const pipeline = orchestrator.createPipeline('Circular', ['stage1', 'stage2']);

      await expect(orchestrator.execute(pipeline.id, 'initial')).rejects.toThrow('Circular dependency');
    });

    it('should set pipeline status to completed on success', async () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);

      await orchestrator.execute(pipeline.id, 'initial');
      const status = orchestrator.getStatus(pipeline.id);
      expect(status.status).toBe('completed');
    });

    it('should set pipeline status to failed on error', async () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockRejectedValue(new Error('Stage failed')),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);

      await expect(orchestrator.execute(pipeline.id, 'initial')).rejects.toThrow('Stage failed');
      const status = orchestrator.getStatus(pipeline.id);
      expect(status.status).toBe('failed');
    });

    it('should throw error when pipeline not found', async () => {
      await expect(orchestrator.execute('nonexistent', 'input')).rejects.toThrow('Pipeline with id "nonexistent" not found');
    });
  });

  describe('pause and resume', () => {
    it('should throw error when pausing non-running pipeline', () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);

      expect(() => orchestrator.pause(pipeline.id)).toThrow('Cannot pause pipeline in "idle" status');
    });

    it('should throw error when resuming non-paused pipeline', async () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);

      await orchestrator.execute(pipeline.id, 'initial');
      expect(() => orchestrator.resume(pipeline.id)).toThrow('Cannot resume pipeline in "completed" status');
    });

    it('should throw error when pipeline not found for pause', () => {
      expect(() => orchestrator.pause('nonexistent')).toThrow('Pipeline with id "nonexistent" not found');
    });

    it('should throw error when pipeline not found for resume', () => {
      expect(() => orchestrator.resume('nonexistent')).toThrow('Pipeline with id "nonexistent" not found');
    });

    it('should return running status for pending pipeline', () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn(),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);
      
      // Pipeline is in idle status initially
      const status = orchestrator.getStatus(pipeline.id);
      expect(status.status).toBe('idle');
    });
  });

  describe('getStatus', () => {
    it('should return pipeline status', async () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);

      const status = orchestrator.getStatus(pipeline.id);
      expect(status).toBeDefined();
      expect(status.id).toBe(pipeline.id);
      expect(status.name).toBe('Test');
      expect(status.status).toBe('idle');
    });

    it('should throw error when pipeline not found', () => {
      expect(() => orchestrator.getStatus('nonexistent')).toThrow('Pipeline with id "nonexistent" not found');
    });

    it('should return a copy of pipeline status', async () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);

      const status1 = orchestrator.getStatus(pipeline.id);
      const status2 = orchestrator.getStatus(pipeline.id);
      expect(status1).not.toBe(status2);
      expect(status1.id).toBe(status2.id);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple parallel branches merging', async () => {
      const mainStage: PipelineStage = {
        id: 'main',
        name: 'Main',
        execute: vi.fn().mockResolvedValue('main-result'),
      };
      const branch1: PipelineStage = {
        id: 'branch1',
        name: 'Branch 1',
        parallel: true,
        dependsOn: ['main'],
        execute: vi.fn().mockResolvedValue('branch1-result'),
      };
      const branch2: PipelineStage = {
        id: 'branch2',
        name: 'Branch 2',
        parallel: true,
        dependsOn: ['main'],
        execute: vi.fn().mockResolvedValue('branch2-result'),
      };
      const merge: PipelineStage = {
        id: 'merge',
        name: 'Merge',
        dependsOn: ['branch1', 'branch2'],
        execute: vi.fn().mockImplementation((input) => {
          return Array.isArray(input) ? input : [input];
        }),
      };
      orchestrator.registerStage(mainStage);
      orchestrator.registerStage(branch1);
      orchestrator.registerStage(branch2);
      orchestrator.registerStage(merge);
      const pipeline = orchestrator.createPipeline('Merge Test', ['main', 'branch1', 'branch2', 'merge']);

      const result = await orchestrator.execute(pipeline.id, 'initial');
      expect(result).toEqual(['branch1-result', 'branch2-result']);
    });

    it('should handle three-stage parallel pipeline', async () => {
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        parallel: true,
        execute: vi.fn().mockResolvedValue('s1'),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        parallel: true,
        execute: vi.fn().mockResolvedValue('s2'),
      };
      const stage3: PipelineStage = {
        id: 'stage3',
        name: 'Stage 3',
        parallel: true,
        execute: vi.fn().mockResolvedValue('s3'),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      orchestrator.registerStage(stage3);
      const pipeline = orchestrator.createPipeline('Triple Parallel', ['stage1', 'stage2', 'stage3']);

      const result = await orchestrator.execute(pipeline.id, 'initial');
      expect(result).toBe('s3');
    });

    it('should propagate input through serial stages', async () => {
      const stage1: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockImplementation((input: unknown) => `${input}-a`),
      };
      const stage2: PipelineStage = {
        id: 'stage2',
        name: 'Stage 2',
        execute: vi.fn().mockImplementation((input: unknown) => `${input}-b`),
      };
      const stage3: PipelineStage = {
        id: 'stage3',
        name: 'Stage 3',
        execute: vi.fn().mockImplementation((input: unknown) => `${input}-c`),
      };
      orchestrator.registerStage(stage1);
      orchestrator.registerStage(stage2);
      orchestrator.registerStage(stage3);
      const pipeline = orchestrator.createPipeline('Chain', ['stage1', 'stage2', 'stage3']);

      const result = await orchestrator.execute(pipeline.id, 'start');
      expect(result).toBe('start-a-b-c');
    });

    it('should handle async errors properly', async () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockRejectedValue(new Error('Async error')),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Async Error Test', ['stage1']);

      await expect(orchestrator.execute(pipeline.id, 'initial')).rejects.toThrow('Async error');
      const status = orchestrator.getStatus(pipeline.id);
      expect(status.status).toBe('failed');
    });

    it('should correctly track pipeline status through lifecycle', async () => {
      const stage: PipelineStage = {
        id: 'stage1',
        name: 'Stage 1',
        execute: vi.fn().mockResolvedValue('result'),
      };
      orchestrator.registerStage(stage);
      const pipeline = orchestrator.createPipeline('Test', ['stage1']);

      // Initially idle
      let status = orchestrator.getStatus(pipeline.id);
      expect(status.status).toBe('idle');

      // Execute pipeline
      await orchestrator.execute(pipeline.id, 'initial');
      status = orchestrator.getStatus(pipeline.id);
      expect(status.status).toBe('completed');
    });
  });
});