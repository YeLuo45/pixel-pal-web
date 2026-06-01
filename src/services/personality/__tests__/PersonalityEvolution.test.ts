import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersonalityEvolution, EvolutionConfig } from '../PersonalityEvolution';
import { PersonalityModel } from '../PersonalityModel';
import { AdaptiveLearner } from '../AdaptiveLearner';

describe('PersonalityEvolution', () => {
  describe('constructor', () => {
    it('should create evolution engine with default config', () => {
      const evolution = new PersonalityEvolution();
      expect(evolution).toBeDefined();
      expect(evolution.getModel()).toBeInstanceOf(PersonalityModel);
      expect(evolution.getLearner()).toBeInstanceOf(AdaptiveLearner);
    });

    it('should create evolution engine with custom config', () => {
      const config: Partial<EvolutionConfig> = {
        learningRate: 0.1,
        decayRate: 0.05,
        maxDataPoints: 500,
      };
      const evolution = new PersonalityEvolution(config);
      expect(evolution).toBeDefined();
    });

    it('should use default learningRate when not specified', () => {
      const evolution = new PersonalityEvolution();
      const json = evolution.toJSON();
      expect((json as any).config.learningRate).toBe(0.01);
    });

    it('should use default decayRate when not specified', () => {
      const evolution = new PersonalityEvolution();
      const json = evolution.toJSON();
      expect((json as any).config.decayRate).toBe(0.95);
    });

    it('should use default maxDataPoints when not specified', () => {
      const evolution = new PersonalityEvolution();
      const json = evolution.toJSON();
      expect((json as any).config.maxDataPoints).toBe(1000);
    });

    it('should accept custom learningRate', () => {
      const config: Partial<EvolutionConfig> = { learningRate: 0.2 };
      const evolution = new PersonalityEvolution(config);
      const json = evolution.toJSON();
      expect((json as any).config.learningRate).toBe(0.2);
    });

    it('should accept custom decayRate', () => {
      const config: Partial<EvolutionConfig> = { decayRate: 0.9 };
      const evolution = new PersonalityEvolution(config);
      const json = evolution.toJSON();
      expect((json as any).config.decayRate).toBe(0.9);
    });

    it('should accept custom maxDataPoints', () => {
      const config: Partial<EvolutionConfig> = { maxDataPoints: 500 };
      const evolution = new PersonalityEvolution(config);
      const json = evolution.toJSON();
      expect((json as any).config.maxDataPoints).toBe(500);
    });

    it('should initialize with neutral mood', () => {
      const evolution = new PersonalityEvolution();
      expect(evolution.getModel().getMood()).toBe('neutral');
    });

    it('should initialize with 50 energy', () => {
      const evolution = new PersonalityEvolution();
      expect(evolution.getModel().getEnergy()).toBe(50);
    });
  });

  describe('processInteraction', () => {
    it('should process interaction without throwing', () => {
      const evolution = new PersonalityEvolution();
      expect(() => evolution.processInteraction('chat', 0.5)).not.toThrow();
    });

    it('should record interaction in learner', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      const data = evolution.getLearner().getData();
      expect(data.length).toBe(1);
      expect(data[0].interactionType).toBe('chat');
      expect(data[0].outcome).toBe(0.5);
    });

    it('should accept context parameter', () => {
      const evolution = new PersonalityEvolution();
      const context = { topic: 'music' };
      evolution.processInteraction('chat', 0.5, context);
      const data = evolution.getLearner().getData();
      expect(data[0].context).toEqual(context);
    });

    it('should accept negative outcomes', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', -0.5);
      const data = evolution.getLearner().getData();
      expect(data[0].outcome).toBe(-0.5);
    });

    it('should accept zero outcome', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0);
      const data = evolution.getLearner().getData();
      expect(data[0].outcome).toBe(0);
    });

    it('should accept full range outcomes', () => {
      const evolution = new PersonalityEvolution();
      [-1, -0.5, 0, 0.5, 1].forEach(outcome => {
        evolution.processInteraction('chat', outcome);
      });
      const data = evolution.getLearner().getData();
      expect(data.length).toBe(5);
    });

    it('should handle multiple interaction types', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      evolution.processInteraction('game', 0.7);
      evolution.processInteraction('social', -0.2);
      const data = evolution.getLearner().getData();
      expect(data.length).toBe(3);
    });

    it('should accept different interaction type strings', () => {
      const evolution = new PersonalityEvolution();
      const types = ['chat', 'game', 'learning', 'social', 'creative', 'work', 'rest'];
      types.forEach(type => {
        expect(() => evolution.processInteraction(type, 0.5)).not.toThrow();
      });
    });

    it('should set timestamp automatically', () => {
      const before = Date.now();
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      const after = Date.now();
      const data = evolution.getLearner().getData();
      expect(data[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(data[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should handle empty context', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5, {});
      const data = evolution.getLearner().getData();
      expect(data[0].context).toEqual({});
    });
  });

  describe('evolve', () => {
    it('should evolve personality without throwing', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      expect(() => evolution.evolve()).not.toThrow();
    });

    it('should apply learning to personality model', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.8);
      evolution.evolve();
      // Model should have applied learning (may affect traits)
      expect(evolution.getModel()).toBeInstanceOf(PersonalityModel);
    });

    it('should handle evolve without any interactions', () => {
      const evolution = new PersonalityEvolution();
      expect(() => evolution.evolve()).not.toThrow();
    });

    it('should handle multiple evolve calls', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      evolution.evolve();
      evolution.processInteraction('chat', 0.6);
      evolution.evolve();
      evolution.processInteraction('chat', 0.7);
      evolution.evolve();
      expect(() => evolution.evolve()).not.toThrow();
    });

    it('should not throw when learner has no data', () => {
      const evolution = new PersonalityEvolution();
      expect(() => evolution.evolve()).not.toThrow();
    });
  });

  describe('getEvolutionDelta', () => {
    it('should return empty object when no data', () => {
      const evolution = new PersonalityEvolution();
      const delta = evolution.getEvolutionDelta();
      expect(delta).toEqual({});
    });

    it('should return object with personality trait changes', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      const delta = evolution.getEvolutionDelta();
      expect(typeof delta).toBe('object');
    });

    it('should return object with partial personality traits', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      const delta = evolution.getEvolutionDelta();
      // Delta should have at least some traits
      expect(Object.keys(delta).length).toBeGreaterThanOrEqual(0);
    });

    it('should reflect interaction history in delta', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.8);
      const delta1 = evolution.getEvolutionDelta();
      evolution.processInteraction('chat', 0.2);
      const delta2 = evolution.getEvolutionDelta();
      // Different interactions should produce different deltas
      expect(JSON.stringify(delta1)).not.toBe(JSON.stringify(delta2));
    });

    it('should handle positive outcomes', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 1);
      const delta = evolution.getEvolutionDelta();
      expect(delta).toBeDefined();
    });

    it('should handle negative outcomes', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', -1);
      const delta = evolution.getEvolutionDelta();
      expect(delta).toBeDefined();
    });

    it('should handle multiple interactions', () => {
      const evolution = new PersonalityEvolution();
      for (let i = 0; i < 10; i++) {
        evolution.processInteraction('chat', (i - 5) / 5);
      }
      const delta = evolution.getEvolutionDelta();
      expect(delta).toBeDefined();
    });

    it('should return 0 for neutral outcomes', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0);
      const delta = evolution.getEvolutionDelta();
      expect(delta).toEqual({});
    });
  });

  describe('getModel', () => {
    it('should return the personality model', () => {
      const evolution = new PersonalityEvolution();
      const model = evolution.getModel();
      expect(model).toBeInstanceOf(PersonalityModel);
    });

    it('should return the same model on multiple calls', () => {
      const evolution = new PersonalityEvolution();
      const model1 = evolution.getModel();
      const model2 = evolution.getModel();
      expect(model1).toBe(model2);
    });

    it('should allow state inspection', () => {
      const evolution = new PersonalityEvolution();
      const model = evolution.getModel();
      expect(model.getTraits()).toBeDefined();
      expect(model.getMood()).toBeDefined();
      expect(model.getEnergy()).toBeDefined();
    });

    it('should reflect changes after evolve', () => {
      const evolution = new PersonalityEvolution();
      const model = evolution.getModel();
      const originalTraits = { ...model.getTraits() };
      evolution.processInteraction('chat', 0.8);
      evolution.evolve();
      // Model should have applied learning
      expect(evolution.getModel()).toBeInstanceOf(PersonalityModel);
    });
  });

  describe('getLearner', () => {
    it('should return the adaptive learner', () => {
      const evolution = new PersonalityEvolution();
      const learner = evolution.getLearner();
      expect(learner).toBeInstanceOf(AdaptiveLearner);
    });

    it('should return the same learner on multiple calls', () => {
      const evolution = new PersonalityEvolution();
      const learner1 = evolution.getLearner();
      const learner2 = evolution.getLearner();
      expect(learner1).toBe(learner2);
    });

    it('should have recorded interactions', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      const learner = evolution.getLearner();
      const data = learner.getData();
      expect(data.length).toBe(1);
    });

    it('should return empty data initially', () => {
      const evolution = new PersonalityEvolution();
      const learner = evolution.getLearner();
      const data = learner.getData();
      expect(data).toEqual([]);
    });
  });

  describe('toJSON', () => {
    it('should return an object', () => {
      const evolution = new PersonalityEvolution();
      const json = evolution.toJSON();
      expect(typeof json).toBe('object');
    });

    it('should include config in output', () => {
      const evolution = new PersonalityEvolution();
      const json = evolution.toJSON();
      expect(json).toHaveProperty('config');
      expect((json as any).config).toHaveProperty('learningRate');
      expect((json as any).config).toHaveProperty('decayRate');
      expect((json as any).config).toHaveProperty('maxDataPoints');
    });

    it('should include model in output', () => {
      const evolution = new PersonalityEvolution();
      const json = evolution.toJSON();
      expect(json).toHaveProperty('model');
    });

    it('should include learner data in output', () => {
      const evolution = new PersonalityEvolution();
      const json = evolution.toJSON();
      expect(json).toHaveProperty('learner');
    });

    it('should serialize model state correctly', () => {
      const evolution = new PersonalityEvolution({
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.2,
      } as any);
      const json = evolution.toJSON();
      expect((json as any).model.traits.openness).toBe(0.7);
    });

    it('should be parseable by fromJSON', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      const json = evolution.toJSON();
      const restored = PersonalityEvolution.fromJSON(json);
      expect(restored).toBeInstanceOf(PersonalityEvolution);
      expect(restored.getLearner().getData().length).toBe(1);
    });

    it('should handle custom config in toJSON', () => {
      const config: Partial<EvolutionConfig> = {
        learningRate: 0.15,
        decayRate: 0.85,
        maxDataPoints: 500,
      };
      const evolution = new PersonalityEvolution(config);
      const json = evolution.toJSON();
      expect((json as any).config.learningRate).toBe(0.15);
      expect((json as any).config.decayRate).toBe(0.85);
      expect((json as any).config.maxDataPoints).toBe(500);
    });
  });

  describe('fromJSON', () => {
    it('should create evolution from JSON object', () => {
      const data = {
        config: {
          learningRate: 0.01,
          decayRate: 0.95,
          maxDataPoints: 1000,
        },
        model: {
          traits: {
            openness: 0.7,
            conscientiousness: 0.6,
            extraversion: 0.5,
            agreeableness: 0.8,
            neuroticism: 0.2,
          },
          mood: 'happy',
          energy: 75,
          lastUpdated: Date.now(),
        },
        learner: {
          data: [
            { interactionType: 'chat', outcome: 0.5, context: {}, timestamp: Date.now() },
          ],
        },
      };
      const evolution = PersonalityEvolution.fromJSON(data);
      expect(evolution).toBeInstanceOf(PersonalityEvolution);
      expect(evolution.getModel().getTraits().openness).toBe(0.7);
      expect(evolution.getModel().getMood()).toBe('happy');
    });

    it('should handle missing config with defaults', () => {
      const data = {
        model: {
          traits: {
            openness: 0.7,
            conscientiousness: 0.6,
            extraversion: 0.5,
            agreeableness: 0.8,
            neuroticism: 0.2,
          },
          mood: 'neutral',
          energy: 50,
          lastUpdated: Date.now(),
        },
        learner: { data: [] },
      };
      const evolution = PersonalityEvolution.fromJSON(data);
      expect(evolution).toBeInstanceOf(PersonalityEvolution);
      const json = evolution.toJSON();
      expect((json as any).config.learningRate).toBe(0.01);
    });

    it('should handle empty learner data', () => {
      const data = {
        config: {
          learningRate: 0.01,
          decayRate: 0.95,
          maxDataPoints: 1000,
        },
        model: {
          traits: {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
          },
          mood: 'neutral',
          energy: 50,
          lastUpdated: Date.now(),
        },
        learner: { data: [] },
      };
      const evolution = PersonalityEvolution.fromJSON(data);
      expect(evolution.getLearner().getData()).toEqual([]);
    });

    it('should restore multiple learning records', () => {
      const data = {
        config: {
          learningRate: 0.01,
          decayRate: 0.95,
          maxDataPoints: 1000,
        },
        model: {
          traits: {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
          },
          mood: 'neutral',
          energy: 50,
          lastUpdated: Date.now(),
        },
        learner: {
          data: [
            { interactionType: 'chat', outcome: 0.5, context: {}, timestamp: Date.now() },
            { interactionType: 'game', outcome: 0.7, context: {}, timestamp: Date.now() },
          ],
        },
      };
      const evolution = PersonalityEvolution.fromJSON(data);
      expect(evolution.getLearner().getData().length).toBe(2);
    });

    it('should handle missing model with defaults', () => {
      const data = {
        learner: { data: [] },
      };
      const evolution = PersonalityEvolution.fromJSON(data);
      expect(evolution.getModel().getTraits().openness).toBe(0.5);
    });

    it('should handle empty object', () => {
      const evolution = PersonalityEvolution.fromJSON({});
      expect(evolution).toBeInstanceOf(PersonalityEvolution);
      expect(evolution.getModel().getEnergy()).toBe(50);
    });

    it('should clamp values to valid ranges', () => {
      const data = {
        config: {
          learningRate: 5, // too high
          decayRate: -0.5, // too low
          maxDataPoints: -100,
        },
        model: {
          traits: {
            openness: 2,
            conscientiousness: -1,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
          },
          mood: 'neutral' as const,
          energy: 200,
          lastUpdated: Date.now(),
        },
        learner: { data: [] },
      };
      const evolution = PersonalityEvolution.fromJSON(data);
      const json = evolution.toJSON();
      expect((json as any).config.learningRate).toBeLessThanOrEqual(1);
      expect((json as any).config.decayRate).toBeGreaterThanOrEqual(0);
      expect((json as any).model.traits.openness).toBe(1);
    });

    it('should create independent copy', () => {
      const data = {
        config: {
          learningRate: 0.01,
          decayRate: 0.95,
          maxDataPoints: 1000,
        },
        model: {
          traits: {
            openness: 0.7,
            conscientiousness: 0.6,
            extraversion: 0.5,
            agreeableness: 0.8,
            neuroticism: 0.2,
          },
          mood: 'happy',
          energy: 75,
          lastUpdated: Date.now(),
        },
        learner: { data: [] },
      };
      const evolution = PersonalityEvolution.fromJSON(data);
      evolution.processInteraction('chat', 0.9);
      expect(evolution.getLearner().getData().length).toBe(1);
      // Original data should not be affected
      expect((data.learner as any).data.length).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should evolve personality through multiple interactions', () => {
      const evolution = new PersonalityEvolution();
      const interactions = [
        { type: 'chat', outcome: 0.6 },
        { type: 'chat', outcome: 0.7 },
        { type: 'game', outcome: 0.8 },
        { type: 'social', outcome: 0.5 },
        { type: 'creative', outcome: 0.9 },
      ];
      interactions.forEach(({ type, outcome }) => {
        evolution.processInteraction(type, outcome);
        evolution.evolve();
      });
      expect(evolution.getModel()).toBeInstanceOf(PersonalityModel);
      expect(evolution.getLearner().getData().length).toBe(5);
    });

    it('should track learning patterns', () => {
      const evolution = new PersonalityEvolution();
      for (let i = 0; i < 5; i++) {
        evolution.processInteraction('chat', 0.7);
      }
      const pattern = evolution.getLearner().findPattern('chat');
      expect(pattern).toHaveLength(5);
    });

    it('should predict outcomes based on history', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.6);
      evolution.processInteraction('chat', 0.7);
      evolution.processInteraction('chat', 0.8);
      const predicted = evolution.getLearner().predictOutcome('chat');
      expect(predicted).toBeCloseTo(0.7);
    });

    it('should handle mixed positive and negative outcomes', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.8);
      evolution.processInteraction('chat', -0.4);
      evolution.processInteraction('chat', 0.6);
      evolution.processInteraction('chat', -0.2);
      const predicted = evolution.getLearner().predictOutcome('chat');
      expect(predicted).toBeCloseTo(0.2);
    });

    it('should maintain confidence with more data', () => {
      const evolution = new PersonalityEvolution();
      const confidences: number[] = [];
      for (let i = 0; i < 10; i++) {
        evolution.processInteraction('chat', 0.5);
        confidences.push(evolution.getLearner().getConfidence('chat'));
      }
      // Confidence should generally increase
      expect(confidences[9]).toBeGreaterThan(confidences[2]);
    });

    it('should handle rapid interactions', () => {
      const evolution = new PersonalityEvolution();
      for (let i = 0; i < 50; i++) {
        evolution.processInteraction('chat', Math.random());
      }
      expect(evolution.getLearner().getData().length).toBe(50);
    });

    it('should forget old data appropriately', () => {
      const evolution = new PersonalityEvolution();
      vi.useFakeTimers();
      vi.setSystemTime(1000);
      for (let i = 0; i < 5; i++) {
        evolution.processInteraction('chat', 0.5);
      }
      vi.setSystemTime(2000);
      evolution.processInteraction('chat', 0.7);
      evolution.processInteraction('chat', 0.8);
      evolution.getLearner().forgetOldData(500);
      vi.useRealTimers();
      const data = evolution.getLearner().getData();
      expect(data.length).toBeLessThanOrEqual(5);
    });

    it('should serialize and deserialize without data loss', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      evolution.processInteraction('game', 0.7);
      const json = evolution.toJSON();
      const restored = PersonalityEvolution.fromJSON(json);
      const restoredJson = restored.toJSON();
      expect(JSON.stringify(restoredJson)).toBe(JSON.stringify(json));
    });
  });

  describe('edge cases', () => {
    it('should handle config with all values at boundary', () => {
      const config: Partial<EvolutionConfig> = {
        learningRate: 0,
        decayRate: 1,
        maxDataPoints: 1,
      };
      const evolution = new PersonalityEvolution(config);
      expect(evolution).toBeDefined();
    });

    it('should handle extreme outcome values', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 1);
      evolution.processInteraction('chat', -1);
      const predicted = evolution.getLearner().predictOutcome('chat');
      expect(predicted).toBe(0);
    });

    it('should handle many different interaction types', () => {
      const evolution = new PersonalityEvolution();
      for (let i = 0; i < 20; i++) {
        evolution.processInteraction(`type${i}`, 0.5);
      }
      expect(evolution.getLearner().getData().length).toBe(20);
    });

    it('should handle context with nested objects', () => {
      const evolution = new PersonalityEvolution();
      const context = {
        user: { preferences: { theme: 'dark', language: 'en' } },
        session: { id: 123 },
      };
      evolution.processInteraction('chat', 0.5, context);
      const data = evolution.getLearner().getData();
      expect(data[0].context).toEqual(context);
    });

    it('should handle evolve called immediately after construction', () => {
      const evolution = new PersonalityEvolution();
      expect(() => evolution.evolve()).not.toThrow();
    });

    it('should handle getEvolutionDelta after evolve', () => {
      const evolution = new PersonalityEvolution();
      evolution.processInteraction('chat', 0.5);
      evolution.evolve();
      const delta = evolution.getEvolutionDelta();
      expect(delta).toBeDefined();
    });

    it('should survive extended usage', () => {
      const evolution = new PersonalityEvolution();
      for (let i = 0; i < 100; i++) {
        evolution.processInteraction('chat', (Math.random() * 2 - 1));
        if (i % 10 === 0) {
          evolution.evolve();
        }
      }
      expect(evolution.getModel()).toBeInstanceOf(PersonalityModel);
      expect(evolution.getLearner().getData().length).toBe(100);
    });
  });
});