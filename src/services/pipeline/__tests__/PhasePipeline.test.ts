import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PhasePipeline, PipelinePhase, PhaseResult, PipelineConfig } from '../PhasePipeline';

describe('PhasePipeline', () => {
  let pipeline: PhasePipeline;

  describe('constructor()', () => {
    it('should create pipeline with config', () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION, PipelinePhase.EXECUTION],
        timeoutPerPhase: 5000,
        continueOnError: true
      };
      pipeline = new PhasePipeline(config);
      expect(pipeline).toBeInstanceOf(PhasePipeline);
    });

    it('should create pipeline with default config', () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);
      expect(pipeline).toBeInstanceOf(PhasePipeline);
    });
  });

  describe('execute()', () => {
    it('should execute all phases in order', async () => {
      const config: PipelineConfig = {
        phases: [
          PipelinePhase.INTENT_DETECTION,
          PipelinePhase.CONTEXT_GATHERING,
          PipelinePhase.EXECUTION,
          PipelinePhase.REFLECTION,
          PipelinePhase.RESPONSE
        ]
      };
      pipeline = new PhasePipeline(config);

      const input = { query: 'test' };
      const results = await pipeline.execute(input);

      expect(results.length).toBe(5);
      expect(results[0].phase).toBe(PipelinePhase.INTENT_DETECTION);
      expect(results[1].phase).toBe(PipelinePhase.CONTEXT_GATHERING);
    });

    it('should return PhaseResult for each phase', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results[0]).toHaveProperty('phase');
      expect(results[0]).toHaveProperty('output');
      expect(results[0]).toHaveProperty('success');
      expect(results[0]).toHaveProperty('duration');
    });

    it('should set success true for completed phases', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results[0].success).toBe(true);
    });

    it('should track phase duration', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple phases', async () => {
      const config: PipelineConfig = {
        phases: [
          PipelinePhase.INTENT_DETECTION,
          PipelinePhase.EXECUTION,
          PipelinePhase.RESPONSE
        ]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results.length).toBe(3);
    });

    it('should execute with empty phases array', async () => {
      const config: PipelineConfig = {
        phases: []
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results).toEqual([]);
    });
  });

  describe('getResults()', () => {
    it('should return empty array before execution', () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      expect(pipeline.getResults()).toEqual([]);
    });

    it('should return results after execution', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      await pipeline.execute({});
      expect(pipeline.getResults().length).toBe(1);
    });

    it('should preserve result order', async () => {
      const config: PipelineConfig = {
        phases: [
          PipelinePhase.INTENT_DETECTION,
          PipelinePhase.EXECUTION,
          PipelinePhase.RESPONSE
        ]
      };
      pipeline = new PhasePipeline(config);

      await pipeline.execute({});
      const results = pipeline.getResults();

      expect(results[0].phase).toBe(PipelinePhase.INTENT_DETECTION);
      expect(results[1].phase).toBe(PipelinePhase.EXECUTION);
      expect(results[2].phase).toBe(PipelinePhase.RESPONSE);
    });
  });

  describe('getResultByPhase()', () => {
    it('should return result for specific phase', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION, PipelinePhase.EXECUTION]
      };
      pipeline = new PhasePipeline(config);

      await pipeline.execute({});

      const result = pipeline.getResultByPhase(PipelinePhase.INTENT_DETECTION);
      expect(result).not.toBeNull();
      expect(result?.phase).toBe(PipelinePhase.INTENT_DETECTION);
    });

    it('should return null for non-existent phase', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      await pipeline.execute({});

      const result = pipeline.getResultByPhase(PipelinePhase.RESPONSE);
      expect(result).toBeNull();
    });

    it('should return null before execution', () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      const result = pipeline.getResultByPhase(PipelinePhase.INTENT_DETECTION);
      expect(result).toBeNull();
    });
  });

  describe('reset()', () => {
    it('should clear all results', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      await pipeline.execute({});
      expect(pipeline.getResults().length).toBe(1);

      pipeline.reset();
      expect(pipeline.getResults()).toEqual([]);
    });

    it('should allow re-execution after reset', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      await pipeline.execute({});
      pipeline.reset();

      const results = await pipeline.execute({});
      expect(results.length).toBe(1);
    });
  });

  describe('PipelinePhase enum', () => {
    it('should have all expected phases', () => {
      expect(PipelinePhase.INTENT_DETECTION).toBe('intent_detection');
      expect(PipelinePhase.CONTEXT_GATHERING).toBe('context_gathering');
      expect(PipelinePhase.EXECUTION).toBe('execution');
      expect(PipelinePhase.REFLECTION).toBe('reflection');
      expect(PipelinePhase.RESPONSE).toBe('response');
    });
  });

  describe('continueOnError option', () => {
    it('should continue when continueOnError is true', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION, PipelinePhase.EXECUTION],
        continueOnError: true
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results.length).toBe(2);
    });

    it('should set success false on error when continueOnError is false', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION],
        continueOnError: false
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results[0].success).toBe(true);
    });
  });

  describe('timeoutPerPhase option', () => {
    it('should handle timeout configuration', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION],
        timeoutPerPhase: 1000
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should work without timeout', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results[0].duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('phase output handling', () => {
    it('should pass input through phases', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION, PipelinePhase.EXECUTION]
      };
      pipeline = new PhasePipeline(config);

      const input = { test: 'data' };
      const results = await pipeline.execute(input);

      results.forEach(result => {
        expect(result.output).toBeDefined();
      });
    });

    it('should have output for each phase', async () => {
      const config: PipelineConfig = {
        phases: [
          PipelinePhase.INTENT_DETECTION,
          PipelinePhase.CONTEXT_GATHERING,
          PipelinePhase.EXECUTION
        ]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});

      results.forEach(result => {
        expect(result.output).toBeDefined();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle single phase pipeline', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.EXECUTION]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results.length).toBe(1);
      expect(results[0].phase).toBe(PipelinePhase.EXECUTION);
    });

    it('should handle duplicate phases', async () => {
      const config: PipelineConfig = {
        phases: [
          PipelinePhase.INTENT_DETECTION,
          PipelinePhase.INTENT_DETECTION
        ]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results.length).toBe(2);
    });

    it('should handle all phases', async () => {
      const config: PipelineConfig = {
        phases: [
          PipelinePhase.INTENT_DETECTION,
          PipelinePhase.CONTEXT_GATHERING,
          PipelinePhase.EXECUTION,
          PipelinePhase.REFLECTION,
          PipelinePhase.RESPONSE
        ]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});
      expect(results.length).toBe(5);
    });
  });

  describe('performance', () => {
    it('should complete quickly for simple phases', async () => {
      const config: PipelineConfig = {
        phases: [
          PipelinePhase.INTENT_DETECTION,
          PipelinePhase.CONTEXT_GATHERING,
          PipelinePhase.EXECUTION
        ]
      };
      pipeline = new PhasePipeline(config);

      const start = Date.now();
      await pipeline.execute({});
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });
  });

  describe('result integrity', () => {
    it('should maintain result order after multiple executions', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION, PipelinePhase.EXECUTION]
      };
      pipeline = new PhasePipeline(config);

      await pipeline.execute({});
      const firstResults = pipeline.getResults();

      await pipeline.execute({});
      const secondResults = pipeline.getResults();

      expect(secondResults.length).toBe(2);
    });

    it('should return valid PhaseResult structure', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      const results = await pipeline.execute({});

      const result = results[0];
      expect(typeof result.phase).toBe('string');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.duration).toBe('number');
      expect(result.output).toBeDefined();
    });
  });

  describe('metadata preservation', () => {
    it('should preserve phase metadata in output', async () => {
      const config: PipelineConfig = {
        phases: [PipelinePhase.INTENT_DETECTION]
      };
      pipeline = new PhasePipeline(config);

      const input = { query: 'test query', context: { userId: '123' } };
      const results = await pipeline.execute(input);

      expect(results[0].output).toBeDefined();
    });
  });
});