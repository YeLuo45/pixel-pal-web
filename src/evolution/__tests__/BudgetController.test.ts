/**
 * V178: BudgetController Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BudgetController, BudgetConfig } from '../BudgetController';

describe('BudgetController', () => {
  let controller: BudgetController;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    controller = new BudgetController();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default config', () => {
      const config = controller.getConfig();
      expect(config.maxTokensPerDay).toBe(100000);
      expect(config.maxCallsPerDay).toBe(100);
    });

    it('should initialize with zero usage', () => {
      const remaining = controller.getRemainingBudget();
      expect(remaining.tokens).toBe(100000);
      expect(remaining.calls).toBe(100);
    });
  });

  describe('canMakeCall', () => {
    it('should return true when under limits', () => {
      expect(controller.canMakeCall()).toBe(true);
    });

    it('should return false when call limit reached', () => {
      for (let i = 0; i < 100; i++) {
        controller.recordCall(100);
      }
      expect(controller.canMakeCall()).toBe(false);
    });

    it('should return false when token limit reached', () => {
      controller.recordCall(100000);
      expect(controller.canMakeCall()).toBe(false);
    });

    it('should respect custom maxCallsPerDay', () => {
      // Use the beforeEach controller with updateConfig instead of creating new one
      controller.updateConfig({ maxCallsPerDay: 5, maxTokensPerDay: 100000 });
      expect(controller.canMakeCall()).toBe(true);
      controller.recordCall(1);
      expect(controller.canMakeCall()).toBe(true); // 1 < 5
      controller.recordCall(1);
      controller.recordCall(1);
      controller.recordCall(1);
      controller.recordCall(1);
      // 5 < 5 is false, so should be false
      expect(controller.canMakeCall()).toBe(false);
    });
  });

  describe('canUseTokens', () => {
    it('should return true when tokens available', () => {
      expect(controller.canUseTokens(1000)).toBe(true);
    });

    it('should return false when estimated exceeds remaining', () => {
      expect(controller.canUseTokens(100001)).toBe(false);
    });

    it('should account for already used tokens', () => {
      controller.recordCall(50000);
      expect(controller.canUseTokens(50001)).toBe(false);
      expect(controller.canUseTokens(50000)).toBe(true);
    });
  });

  describe('recordCall', () => {
    it('should increment call usage', () => {
      controller.recordCall(100);
      expect(controller.getRemainingBudget().calls).toBe(99);
    });

    it('should add to token usage', () => {
      controller.recordCall(500);
      expect(controller.getRemainingBudget().tokens).toBe(99500);
    });

    it('should track multiple calls', () => {
      controller.recordCall(100);
      controller.recordCall(200);
      controller.recordCall(300);
      expect(controller.getRemainingBudget().calls).toBe(97);
      expect(controller.getRemainingBudget().tokens).toBe(99400);
    });
  });

  describe('getRemainingBudget', () => {
    it('should return correct remaining tokens and calls', () => {
      controller.recordCall(1000);
      const remaining = controller.getRemainingBudget();
      expect(remaining.tokens).toBe(99000);
      expect(remaining.calls).toBe(99);
    });

    it('should not return negative values', () => {
      controller.recordCall(200000);
      const remaining = controller.getRemainingBudget();
      expect(remaining.tokens).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('should return complete status object', () => {
      const status = controller.getStatus();
      expect(status.tokensRemaining).toBeDefined();
      expect(status.callsRemaining).toBeDefined();
      expect(status.tokenUsagePercent).toBeDefined();
      expect(status.callUsagePercent).toBeDefined();
      expect(status.isExhausted).toBeDefined();
    });

    it('should calculate usage percentages correctly', () => {
      controller.recordCall(10000);
      const status = controller.getStatus();
      expect(status.tokenUsagePercent).toBe(10);
      expect(status.callUsagePercent).toBe(1);
    });
  });

  describe('resetIfNeeded', () => {
    it('should reset after midnight', () => {
      controller.recordCall(50000);
      vi.setSystemTime(new Date('2026-06-02T00:00:01Z'));
      controller.resetIfNeeded();
      expect(controller.getRemainingBudget().tokens).toBe(100000);
      expect(controller.getRemainingBudget().calls).toBe(100);
    });
  });

  describe('reset', () => {
    it('should manually reset all usage', () => {
      controller.recordCall(50000);
      controller.reset();
      expect(controller.getRemainingBudget().tokens).toBe(100000);
      expect(controller.getRemainingBudget().calls).toBe(100);
    });
  });

  describe('updateConfig', () => {
    it('should update maxTokensPerDay', () => {
      controller.updateConfig({ maxTokensPerDay: 200000 });
      expect(controller.getConfig().maxTokensPerDay).toBe(200000);
    });

    it('should update maxCallsPerDay', () => {
      controller.updateConfig({ maxCallsPerDay: 200 });
      expect(controller.getConfig().maxCallsPerDay).toBe(200);
    });
  });

  describe('isApproachingLimit', () => {
    it('should return true when over 80% usage', () => {
      controller.recordCall(85000);
      expect(controller.isApproachingLimit()).toBe(true);
    });

    it('should return false when under 80% usage', () => {
      controller.recordCall(10000);
      expect(controller.isApproachingLimit()).toBe(false);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return time until next midnight', () => {
      const timeUntil = controller.getTimeUntilReset();
      expect(timeUntil).toBe(12 * 60 * 60 * 1000);
    });
  });

  describe('estimateRemainingCalls', () => {
    it('should estimate remaining calls correctly', () => {
      expect(controller.estimateRemainingCalls()).toBe(100);
      controller.recordCall(100);
      expect(controller.estimateRemainingCalls()).toBe(99);
    });
  });

  describe('estimateRemainingTokens', () => {
    it('should estimate remaining tokens correctly', () => {
      expect(controller.estimateRemainingTokens()).toBe(100000);
      controller.recordCall(10000);
      expect(controller.estimateRemainingTokens()).toBe(90000);
    });
  });
});
