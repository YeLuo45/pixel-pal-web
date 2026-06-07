/**
 * PerceptionEngine Tests
 * generic-agent-design Perception Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PerceptionEngine } from '../PerceptionEngine';

describe('PerceptionEngine', () => {
  let pce: PerceptionEngine;

  beforeEach(() => {
    pce = new PerceptionEngine();
  });

  afterEach(() => {
    pce.clearAll();
  });

  describe('sense / perceive / forget / remove', () => {
    it('should sense', () => {
      expect(pce.sense('visual', 'red', 5)).toMatch(/^pce-/);
    });

    it('should default perceived to false', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.isPerceived(pce.getAllSensations()[0].id)).toBe(false);
    });

    it('should mark as active', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.isActive(pce.getAllSensations()[0].id)).toBe(true);
    });

    it('should clamp intensity to 0-10', () => {
      const id = pce.sense('visual', 'red', 20);
      expect(pce.getIntensity(id)).toBe(10);
    });

    it('should perceive', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.perceive(id)).toBe(true);
    });

    it('should mark as perceived', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.isPerceived(id)).toBe(true);
    });

    it('should not perceive inactive', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.setActive(id, false);
      expect(pce.perceive(id)).toBe(false);
    });

    it('should return false for unknown perceive', () => {
      expect(pce.perceive('unknown')).toBe(false);
    });

    it('should forget', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.forget(id)).toBe(true);
    });

    it('should mark as inactive after forget', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.forget(id);
      expect(pce.isActive(id)).toBe(false);
    });

    it('should return false for unknown forget', () => {
      expect(pce.forget('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getStats().sensations).toBe(1);
    });

    it('should count total sensed', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getStats().totalSensed).toBe(1);
    });

    it('should count total perceived', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.getStats().totalPerceived).toBe(1);
    });

    it('should count total forgotten', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.forget(id);
      expect(pce.getStats().totalForgotten).toBe(1);
    });

    it('should count visual', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getStats().visual).toBe(1);
    });

    it('should count audio', () => {
      pce.sense('audio', 'loud', 5);
      expect(pce.getStats().audio).toBe(1);
    });

    it('should count touch', () => {
      pce.sense('touch', 'soft', 5);
      expect(pce.getStats().touch).toBe(1);
    });

    it('should count taste', () => {
      pce.sense('taste', 'sweet', 5);
      expect(pce.getStats().taste).toBe(1);
    });

    it('should count smell', () => {
      pce.sense('smell', 'flower', 5);
      expect(pce.getStats().smell).toBe(1);
    });

    it('should count active', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.setActive(id, false);
      expect(pce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.getStats().totalHits).toBe(1);
    });

    it('should count total intensity', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getStats().totalIntensity).toBe(5);
    });

    it('should count perceived', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.getStats().totalPerceived2).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get sensation', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.getSensation(id)?.stimulus).toBe('red');
    });

    it('should get all', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getAllSensations()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.hasSensation(id)).toBe(true);
    });

    it('should count', () => {
      expect(pce.getCount()).toBe(0);
      pce.sense('visual', 'red', 5);
      expect(pce.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get stimulus', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.getStimulus(id)).toBe('red');
    });

    it('should get hits', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.getHits(id)).toBe(1);
    });

    it('should check visual', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.isVisual(pce.getAllSensations()[0].id)).toBe(true);
    });

    it('should check audio', () => {
      pce.sense('audio', 'loud', 5);
      expect(pce.isAudio(pce.getAllSensations()[0].id)).toBe(true);
    });

    it('should check touch', () => {
      pce.sense('touch', 'soft', 5);
      expect(pce.isTouch(pce.getAllSensations()[0].id)).toBe(true);
    });

    it('should check taste', () => {
      pce.sense('taste', 'sweet', 5);
      expect(pce.isTaste(pce.getAllSensations()[0].id)).toBe(true);
    });

    it('should check smell', () => {
      pce.sense('smell', 'flower', 5);
      expect(pce.isSmell(pce.getAllSensations()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.setActive(id, false)).toBe(true);
    });

    it('should set stimulus', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.setStimulus(id, 'blue')).toBe(true);
    });

    it('should set intensity', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.setIntensity(id, 7)).toBe(true);
    });

    it('should clamp intensity to 0-10', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.setIntensity(id, 20);
      expect(pce.getIntensity(id)).toBe(10);
    });

    it('should set type', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.setType(id, 'audio')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pce.setActive('unknown', false)).toBe(false);
      expect(pce.setStimulus('unknown', 's')).toBe(false);
      expect(pce.setIntensity('unknown', 1)).toBe(false);
      expect(pce.setType('unknown', 'visual')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      pce.setActive(id, false);
      pce.resetAll();
      expect(pce.isPerceived(id)).toBe(false);
      expect(pce.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getByType('visual')).toHaveLength(1);
    });

    it('should get active', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getActiveSensations()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.setActive(id, false);
      expect(pce.getInactiveSensations()).toHaveLength(1);
    });

    it('should get perceived', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.getPerceivedSensations()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getNewest()?.stimulus).toBe('red');
    });

    it('should return null for empty newest', () => {
      expect(pce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getOldest()?.stimulus).toBe('red');
    });

    it('should return null for empty oldest', () => {
      expect(pce.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = pce.sense('visual', 'red', 5);
      expect(pce.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total sensed', () => {
      pce.sense('visual', 'red', 5);
      expect(pce.getTotalSensed()).toBe(1);
    });

    it('should get total perceived', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.perceive(id);
      expect(pce.getTotalPerceived()).toBe(1);
    });

    it('should get total forgotten', () => {
      const id = pce.sense('visual', 'red', 5);
      pce.forget(id);
      expect(pce.getTotalForgotten()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many sensations', () => {
      for (let i = 0; i < 50; i++) {
        pce.sense('visual', `s${i}`, 5);
      }
      expect(pce.getCount()).toBe(50);
    });
  });
});