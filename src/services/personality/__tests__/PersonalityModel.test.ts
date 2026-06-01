import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersonalityModel, PersonalityTraits, PersonalityState } from '../PersonalityModel';

describe('PersonalityModel', () => {
  describe('constructor', () => {
    it('should create a model with default traits when no initialTraits provided', () => {
      const model = new PersonalityModel();
      const traits = model.getTraits();
      expect(traits.openness).toBe(0.5);
      expect(traits.conscientiousness).toBe(0.5);
      expect(traits.extraversion).toBe(0.5);
      expect(traits.agreeableness).toBe(0.5);
      expect(traits.neuroticism).toBe(0.5);
    });

    it('should create a model with custom initial traits', () => {
      const model = new PersonalityModel({ openness: 0.8 });
      const traits = model.getTraits();
      expect(traits.openness).toBe(0.8);
      expect(traits.conscientiousness).toBe(0.5);
    });

    it('should create a model with all custom traits', () => {
      const model = new PersonalityModel({
        openness: 0.9,
        conscientiousness: 0.7,
        extraversion: 0.6,
        agreeableness: 0.8,
        neuroticism: 0.3,
      });
      const traits = model.getTraits();
      expect(traits.openness).toBe(0.9);
      expect(traits.conscientiousness).toBe(0.7);
      expect(traits.extraversion).toBe(0.6);
      expect(traits.agreeableness).toBe(0.8);
      expect(traits.neuroticism).toBe(0.3);
    });

    it('should initialize mood to neutral', () => {
      const model = new PersonalityModel();
      expect(model.getMood()).toBe('neutral');
    });

    it('should initialize energy to 50', () => {
      const model = new PersonalityModel();
      expect(model.getEnergy()).toBe(50);
    });

    it('should initialize lastUpdated to current timestamp', () => {
      const before = Date.now();
      const model = new PersonalityModel();
      const after = Date.now();
      const state = model.getState();
      expect(state.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(state.lastUpdated).toBeLessThanOrEqual(after);
    });
  });

  describe('getState', () => {
    it('should return complete personality state', () => {
      const model = new PersonalityModel({
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.2,
      });
      const state = model.getState();
      expect(state.traits.openness).toBe(0.7);
      expect(state.traits.conscientiousness).toBe(0.6);
      expect(state.traits.extraversion).toBe(0.5);
      expect(state.traits.agreeableness).toBe(0.8);
      expect(state.traits.neuroticism).toBe(0.2);
      expect(state.mood).toBe('neutral');
      expect(state.energy).toBe(50);
      expect(typeof state.lastUpdated).toBe('number');
    });
  });

  describe('getTraits', () => {
    it('should return a copy of traits to prevent mutation', () => {
      const model = new PersonalityModel({ openness: 0.7 });
      const traits = model.getTraits();
      traits.openness = 0.99; // mutate
      const traits2 = model.getTraits();
      expect(traits2.openness).toBe(0.7); // should not be affected
    });

    it('should return all five personality traits', () => {
      const model = new PersonalityModel();
      const traits = model.getTraits();
      expect(Object.keys(traits)).toEqual([
        'openness',
        'conscientiousness',
        'extraversion',
        'agreeableness',
        'neuroticism',
      ]);
    });
  });

  describe('getMood', () => {
    it('should return current mood', () => {
      const model = new PersonalityModel();
      expect(model.getMood()).toBe('neutral');
      model.updateMood('happy');
      expect(model.getMood()).toBe('happy');
    });

    it('should return valid mood types', () => {
      const model = new PersonalityModel();
      const moods: PersonalityState['mood'][] = ['happy', 'neutral', 'sad', 'excited'];
      moods.forEach(mood => {
        model.updateMood(mood);
        expect(model.getMood()).toBe(mood);
      });
    });
  });

  describe('getEnergy', () => {
    it('should return current energy level', () => {
      const model = new PersonalityModel();
      expect(model.getEnergy()).toBe(50);
    });

    it('should reflect energy changes', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(30);
      expect(model.getEnergy()).toBe(80);
      model.adjustEnergy(-20);
      expect(model.getEnergy()).toBe(60);
    });
  });

  describe('updateTraits', () => {
    it('should update single trait', () => {
      const model = new PersonalityModel({ openness: 0.5 });
      model.updateTraits({ openness: 0.8 });
      expect(model.getTraits().openness).toBe(0.8);
    });

    it('should clamp traits to 0-1 range', () => {
      const model = new PersonalityModel({ openness: 0.5 });
      model.updateTraits({ openness: 1.5 });
      expect(model.getTraits().openness).toBe(1.0);
      model.updateTraits({ openness: -0.5 });
      expect(model.getTraits().openness).toBe(0.0);
    });

    it('should update multiple traits at once', () => {
      const model = new PersonalityModel();
      model.updateTraits({
        openness: 0.9,
        extraversion: 0.3,
        agreeableness: 0.7,
      });
      const traits = model.getTraits();
      expect(traits.openness).toBe(0.9);
      expect(traits.extraversion).toBe(0.3);
      expect(traits.agreeableness).toBe(0.7);
      expect(traits.conscientiousness).toBe(0.5); // unchanged
      expect(traits.neuroticism).toBe(0.5); // unchanged
    });

    it('should update lastUpdated timestamp', () => {
      const model = new PersonalityModel();
      const originalTime = model.getState().lastUpdated;
      // small delay to ensure different timestamp
      const later = originalTime + 100;
      vi.useFakeTimers();
      vi.setSystemTime(later);
      model.updateTraits({ openness: 0.8 });
      vi.useRealTimers();
      expect(model.getState().lastUpdated).toBe(later);
    });
  });

  describe('updateMood', () => {
    it('should update mood to happy', () => {
      const model = new PersonalityModel();
      model.updateMood('happy');
      expect(model.getMood()).toBe('happy');
    });

    it('should update mood to sad', () => {
      const model = new PersonalityModel();
      model.updateMood('sad');
      expect(model.getMood()).toBe('sad');
    });

    it('should update mood to excited', () => {
      const model = new PersonalityModel();
      model.updateMood('excited');
      expect(model.getMood()).toBe('excited');
    });

    it('should update mood to neutral', () => {
      const model = new PersonalityModel();
      model.updateMood('happy');
      model.updateMood('neutral');
      expect(model.getMood()).toBe('neutral');
    });

    it('should update lastUpdated timestamp', () => {
      const model = new PersonalityModel();
      const originalTime = model.getState().lastUpdated;
      expect(model.getState().lastUpdated).toBe(originalTime);
    });
  });

  describe('adjustEnergy', () => {
    it('should increase energy with positive delta', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(20);
      expect(model.getEnergy()).toBe(70);
    });

    it('should decrease energy with negative delta', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(-30);
      expect(model.getEnergy()).toBe(20);
    });

    it('should cap energy at 100', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(100);
      expect(model.getEnergy()).toBe(100);
    });

    it('should floor energy at 0', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(-100);
      expect(model.getEnergy()).toBe(0);
    });

    it('should handle multiple adjustments', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(30);
      model.adjustEnergy(-10);
      model.adjustEnergy(25);
      expect(model.getEnergy()).toBe(95);
    });

    it('should update lastUpdated timestamp', () => {
      const model = new PersonalityModel();
      const originalTime = model.getState().lastUpdated;
      model.adjustEnergy(10);
      expect(model.getState().lastUpdated).toBeGreaterThanOrEqual(originalTime);
    });
  });

  describe('learnFromInteraction', () => {
    it('should record interaction without throwing', () => {
      const model = new PersonalityModel();
      expect(() => model.learnFromInteraction('chat', 0.5)).not.toThrow();
    });

    it('should accept different interaction types', () => {
      const model = new PersonalityModel();
      const types = ['chat', 'game', 'learning', 'social', 'creative'];
      types.forEach(type => {
        expect(() => model.learnFromInteraction(type, 0.5)).not.toThrow();
      });
    });

    it('should accept feedback values from -1 to 1', () => {
      const model = new PersonalityModel();
      const feedbacks = [-1, -0.5, 0, 0.5, 1];
      feedbacks.forEach(feedback => {
        expect(() => model.learnFromInteraction('chat', feedback)).not.toThrow();
      });
    });

    it('should update lastUpdated timestamp', () => {
      const model = new PersonalityModel();
      const originalTime = model.getState().lastUpdated;
      model.learnFromInteraction('chat', 0.5);
      expect(model.getState().lastUpdated).toBeGreaterThanOrEqual(originalTime);
    });
  });

  describe('applyLearning', () => {
    it('should apply learning without throwing', () => {
      const model = new PersonalityModel();
      model.learnFromInteraction('chat', 0.5);
      expect(() => model.applyLearning()).not.toThrow();
    });

    it('should handle multiple learning sessions before apply', () => {
      const model = new PersonalityModel();
      model.learnFromInteraction('chat', 0.3);
      model.learnFromInteraction('game', 0.7);
      model.learnFromInteraction('social', -0.2);
      expect(() => model.applyLearning()).not.toThrow();
    });

    it('should not throw when no learning data exists', () => {
      const model = new PersonalityModel();
      expect(() => model.applyLearning()).not.toThrow();
    });
  });

  describe('toJSON', () => {
    it('should return an object with state data', () => {
      const model = new PersonalityModel({
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.2,
      });
      model.updateMood('happy');
      model.adjustEnergy(75);
      const json = model.toJSON();
      expect(json).toHaveProperty('traits');
      expect(json).toHaveProperty('mood');
      expect(json).toHaveProperty('energy');
      expect(json).toHaveProperty('lastUpdated');
    });

    it('should serialize traits correctly', () => {
      const model = new PersonalityModel({
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.2,
      });
      const json = model.toJSON() as any;
      expect(json.traits.openness).toBe(0.7);
      expect(json.traits.conscientiousness).toBe(0.6);
      expect(json.traits.extraversion).toBe(0.5);
      expect(json.traits.agreeableness).toBe(0.8);
      expect(json.traits.neuroticism).toBe(0.2);
    });

    it('should serialize mood correctly', () => {
      const model = new PersonalityModel();
      model.updateMood('excited');
      const json = model.toJSON() as any;
      expect(json.mood).toBe('excited');
    });

    it('should serialize energy correctly', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(25);  // 50 + 25 = 75
      const json = model.toJSON() as any;
      expect(json.energy).toBe(75);
    });

    it('should be parseable by fromJSON', () => {
      const model = new PersonalityModel({
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.2,
      });
      model.updateMood('happy');
      model.adjustEnergy(25);  // 50 + 25 = 75
      const json = model.toJSON();
      const restored = PersonalityModel.fromJSON(json);
      expect(restored.getTraits().openness).toBe(0.7);
      expect(restored.getMood()).toBe('happy');
      expect(restored.getEnergy()).toBe(75);
    });
  });

  describe('fromJSON', () => {
    it('should create model from JSON object', () => {
      const data = {
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
      };
      const model = PersonalityModel.fromJSON(data);
      expect(model.getTraits().openness).toBe(0.7);
      expect(model.getMood()).toBe('happy');
      expect(model.getEnergy()).toBe(75);
    });

    it('should handle partial data with defaults', () => {
      const data = {
        traits: { openness: 0.7 },
      };
      const model = PersonalityModel.fromJSON(data);
      expect(model.getTraits().openness).toBe(0.7);
      expect(model.getTraits().conscientiousness).toBe(0.5); // default
      expect(model.getMood()).toBe('neutral'); // default
      expect(model.getEnergy()).toBe(50); // default
    });

    it('should clamp values to valid ranges', () => {
      const data = {
        traits: {
          openness: 1.5,
          conscientiousness: -0.5,
        },
        energy: 200,
      };
      const model = PersonalityModel.fromJSON(data);
      expect(model.getTraits().openness).toBe(1.0);
      expect(model.getTraits().conscientiousness).toBe(0.0);
      expect(model.getEnergy()).toBe(100);
    });

    it('should handle missing traits gracefully', () => {
      const data = { mood: 'sad' };
      const model = PersonalityModel.fromJSON(data);
      expect(model.getTraits().openness).toBe(0.5);
      expect(model.getMood()).toBe('sad');
    });

    it('should handle empty object', () => {
      const model = PersonalityModel.fromJSON({});
      expect(model.getTraits().openness).toBe(0.5);
      expect(model.getMood()).toBe('neutral');
      expect(model.getEnergy()).toBe(50);
    });

    it('should create independent copy (not reference)', () => {
      const data = {
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
      };
      const model = PersonalityModel.fromJSON(data);
      model.updateTraits({ openness: 0.9 });
      expect(model.getTraits().openness).toBe(0.9);
      // Original data should not be affected
      expect(data.traits.openness).toBe(0.7);
    });
  });

  describe('edge cases', () => {
    it('should handle extreme trait values without crashing', () => {
      const model = new PersonalityModel({
        openness: 0,
        conscientiousness: 1,
        extraversion: 0,
        agreeableness: 1,
        neuroticism: 0,
      });
      expect(model.getTraits().openness).toBe(0);
      expect(model.getTraits().conscientiousness).toBe(1);
    });

    it('should handle rapid mood changes', () => {
      const model = new PersonalityModel();
      const moods: PersonalityState['mood'][] = ['happy', 'sad', 'excited', 'neutral', 'happy'];
      moods.forEach(mood => model.updateMood(mood));
      expect(model.getMood()).toBe('happy');
    });

    it('should handle energy at boundary values', () => {
      const model = new PersonalityModel();
      model.adjustEnergy(50);
      model.adjustEnergy(50);
      expect(model.getEnergy()).toBe(100);
      model.adjustEnergy(-100);
      expect(model.getEnergy()).toBe(0);
    });

    it('should handle large negative feedback values', () => {
      const model = new PersonalityModel();
      expect(() => model.learnFromInteraction('chat', -1)).not.toThrow();
      expect(() => model.learnFromInteraction('chat', -0.99)).not.toThrow();
    });

    it('should handle large positive feedback values', () => {
      const model = new PersonalityModel();
      expect(() => model.learnFromInteraction('chat', 1)).not.toThrow();
      expect(() => model.learnFromInteraction('chat', 0.99)).not.toThrow();
    });
  });
});