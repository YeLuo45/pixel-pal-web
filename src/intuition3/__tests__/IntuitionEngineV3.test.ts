/**
 * IntuitionEngineV3 Tests
 * generic-agent-design Intuition Engine v3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntuitionEngineV3 } from '../IntuitionEngineV3';

describe('IntuitionEngineV3', () => {
  let ie: IntuitionEngineV3;

  beforeEach(() => {
    ie = new IntuitionEngineV3();
  });

  afterEach(() => {
    ie.clearAll();
  });

  // ============================================================
  // define / trigger / calibrate
  // ============================================================
  describe('define / trigger / calibrate', () => {
    it('should define', () => {
      expect(ie.define('sig1', 0.5)).toBe('ie-1');
    });

    it('should clamp confidence to 0-1', () => {
      const id = ie.define('sig1', 1.5);
      expect(ie.getConfidence(id)).toBe(1);
    });

    it('should clamp confidence to 0', () => {
      const id = ie.define('sig1', -0.5);
      expect(ie.getConfidence(id)).toBe(0);
    });

    it('should trigger', () => {
      const id = ie.define('sig1', 0.5);
      expect(ie.trigger(id)).toBe(true);
    });

    it('should not trigger inactive', () => {
      const id = ie.define('sig1', 0.5);
      ie.setActive(id, false);
      expect(ie.trigger(id)).toBe(false);
    });

    it('should return false for unknown trigger', () => {
      expect(ie.trigger('unknown')).toBe(false);
    });

    it('should calibrate', () => {
      const id = ie.define('sig1', 0.5);
      expect(ie.calibrate(id, 0.2)).toBe(true);
    });

    it('should clamp calibrated confidence', () => {
      const id = ie.define('sig1', 0.9);
      ie.calibrate(id, 0.5);
      expect(ie.getConfidence(id)).toBe(1);
    });

    it('should return false for unknown calibrate', () => {
      expect(ie.calibrate('unknown', 0.1)).toBe(false);
    });

    it('should increment triggers on trigger', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      expect(ie.getTriggers(id)).toBe(1);
    });

    it('should increment calibrations on calibrate', () => {
      const id = ie.define('sig1', 0.5);
      ie.calibrate(id, 0.1);
      expect(ie.getCalibrations(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ie.define('sig1', 0.5);
      const stats = ie.getStats();
      expect(stats.intuitions).toBe(1);
    });

    it('should count total triggers', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      expect(ie.getStats().totalTriggers).toBe(1);
    });

    it('should compute avg confidence', () => {
      ie.define('sig1', 0.5);
      expect(ie.getStats().avgConfidence).toBe(0.5);
    });

    it('should count active', () => {
      ie.define('sig1', 0.5);
      expect(ie.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ie.define('sig1', 0.5);
      ie.setActive(id, false);
      expect(ie.getStats().inactive).toBe(1);
    });

    it('should count total calibrations', () => {
      const id = ie.define('sig1', 0.5);
      ie.calibrate(id, 0.1);
      expect(ie.getStats().totalCalibrations).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get intuition', () => {
      ie.define('sig1', 0.5);
      expect(ie.getIntuition('ie-1')?.signal).toBe('sig1');
    });

    it('should get all', () => {
      ie.define('sig1', 0.5);
      expect(ie.getAllIntuitions()).toHaveLength(1);
    });

    it('should remove', () => {
      ie.define('sig1', 0.5);
      expect(ie.removeIntuition('ie-1')).toBe(true);
    });

    it('should check existence', () => {
      ie.define('sig1', 0.5);
      expect(ie.hasIntuition('ie-1')).toBe(true);
    });

    it('should count', () => {
      expect(ie.getCount()).toBe(0);
      ie.define('sig1', 0.5);
      expect(ie.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get signal', () => {
      ie.define('sig1', 0.5);
      expect(ie.getSignal('ie-1')).toBe('sig1');
    });

    it('should get confidence', () => {
      ie.define('sig1', 0.5);
      expect(ie.getConfidence('ie-1')).toBe(0.5);
    });

    it('should get triggers', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      expect(ie.getTriggers(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      expect(ie.getHits(id)).toBe(1);
    });

    it('should get calibrations', () => {
      const id = ie.define('sig1', 0.5);
      ie.calibrate(id, 0.1);
      expect(ie.getCalibrations(id)).toBe(1);
    });

    it('should check isActive', () => {
      ie.define('sig1', 0.5);
      expect(ie.isActive('ie-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = ie.define('sig1', 0.5);
      expect(ie.setActive(id, false)).toBe(true);
    });

    it('should set signal', () => {
      const id = ie.define('sig1', 0.5);
      expect(ie.setSignal(id, 'sig2')).toBe(true);
    });

    it('should set confidence', () => {
      const id = ie.define('sig1', 0.5);
      expect(ie.setConfidence(id, 0.8)).toBe(true);
    });

    it('should clamp set confidence', () => {
      const id = ie.define('sig1', 0.5);
      ie.setConfidence(id, 1.5);
      expect(ie.getConfidence(id)).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(ie.setActive('unknown', false)).toBe(false);
      expect(ie.setSignal('unknown', 's')).toBe(false);
      expect(ie.setConfidence('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      ie.resetHits();
      expect(ie.getHits(id)).toBe(0);
    });

    it('should reset triggers', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      ie.resetTriggers();
      expect(ie.getTriggers(id)).toBe(0);
    });

    it('should reset calibrations', () => {
      const id = ie.define('sig1', 0.5);
      ie.calibrate(id, 0.1);
      ie.resetCalibrations();
      expect(ie.getCalibrations(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      ie.calibrate(id, 0.1);
      ie.setActive(id, false);
      ie.resetAll();
      expect(ie.getTriggers(id)).toBe(0);
      expect(ie.getCalibrations(id)).toBe(0);
      expect(ie.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by signal / state
  // ============================================================
  describe('by signal / state', () => {
    it('should get by signal', () => {
      ie.define('sig1', 0.5);
      expect(ie.getBySignal('sig1')).toHaveLength(1);
    });

    it('should get active', () => {
      ie.define('sig1', 0.5);
      expect(ie.getActiveIntuitions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ie.define('sig1', 0.5);
      ie.setActive(id, false);
      expect(ie.getInactiveIntuitions()).toHaveLength(1);
    });

    it('should get by min confidence', () => {
      ie.define('sig1', 0.5);
      expect(ie.getByMinConfidence(0.3)).toHaveLength(1);
    });

    it('should get all signals', () => {
      ie.define('sig1', 0.5);
      ie.define('sig2', 0.5);
      expect(ie.getAllSignals()).toHaveLength(2);
    });

    it('should get signal count', () => {
      ie.define('sig1', 0.5);
      expect(ie.getSignalCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most triggered', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      expect(ie.getMostTriggered()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ie.getMostTriggered()).toBeNull();
    });

    it('should get highest confidence', () => {
      ie.define('sig1', 0.5);
      expect(ie.getHighestConfidence()?.id).toBe('ie-1');
    });

    it('should return null for empty highest', () => {
      expect(ie.getHighestConfidence()).toBeNull();
    });

    it('should get newest', () => {
      ie.define('sig1', 0.5);
      expect(ie.getNewest()?.id).toBe('ie-1');
    });

    it('should return null for empty newest', () => {
      expect(ie.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ie.define('sig1', 0.5);
      expect(ie.getOldest()?.id).toBe('ie-1');
    });

    it('should return null for empty oldest', () => {
      expect(ie.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ie.define('sig1', 0.5);
      expect(ie.getCreatedAt('ie-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ie.define('sig1', 0.5);
      ie.trigger(id);
      expect(ie.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many intuitions', () => {
      for (let i = 0; i < 50; i++) {
        ie.define(`sig${i}`, 0.5);
      }
      expect(ie.getCount()).toBe(50);
    });
  });
});