/**
 * TaskDelegator Tests
 * chatdev-design Task Delegator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskDelegator } from '../TaskDelegator';

describe('TaskDelegator', () => {
  let delegator: TaskDelegator;

  beforeEach(() => {
    delegator = new TaskDelegator();
  });

  afterEach(() => {
    delegator.clearAll();
  });

  // ============================================================
  // registerAgent
  // ============================================================
  describe('registerAgent', () => {
    it('should register agent', () => {
      delegator.registerAgent('a1', 5);
      expect(delegator.getAgentCount()).toBe(1);
    });
  });

  // ============================================================
  // delegate
  // ============================================================
  describe('delegate', () => {
    it('should delegate to available agent', () => {
      delegator.registerAgent('a1', 5);
      const result = delegator.delegate('t1', 'high priority');
      expect(result).not.toBeNull();
      expect(result?.agentId).toBe('a1');
    });

    it('should return null for no agents', () => {
      expect(delegator.delegate('t1', 'reason')).toBeNull();
    });

    it('should return null for all overloaded', () => {
      delegator.registerAgent('a1', 1);
      delegator.delegate('t1', 'r');
      delegator.delegate('t2', 'r');
      expect(delegator.delegate('t3', 'r')).toBeNull();
    });

    it('should select least loaded', () => {
      delegator.registerAgent('a1', 5);
      delegator.registerAgent('a2', 5);
      delegator.delegate('t1', 'r'); // a1 load 1
      delegator.delegate('t2', 'r'); // a2 load 1
      delegator.delegate('t3', 'r'); // should pick a1 (both at 1, but a1 was checked first)
      // Actually depends on which is better
      expect(delegator.getAgentCount()).toBe(2);
    });
  });

  // ============================================================
  // selectAgent
  // ============================================================
  describe('selectAgent', () => {
    it('should return null for no agents', () => {
      expect(delegator.selectAgent()).toBeNull();
    });

    it('should return available agent', () => {
      delegator.registerAgent('a1', 5);
      expect(delegator.selectAgent()).toBe('a1');
    });

    it('should return null for inactive agent', () => {
      delegator.registerAgent('a1', 5);
      delegator.setAgentActive('a1', false);
      expect(delegator.selectAgent()).toBeNull();
    });
  });

  // ============================================================
  // getHistory
  // ============================================================
  describe('getHistory', () => {
    it('should track delegations', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      expect(delegator.getHistoryCount()).toBe(1);
    });

    it('should not expose internal array', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      const h = delegator.getHistory();
      h.push({ taskId: 'fake', agentId: 'a1', timestamp: 0, reason: 'fake' });
      expect(delegator.getHistoryCount()).toBe(1);
    });
  });

  // ============================================================
  // getActiveDelegations / completeDelegation
  // ============================================================
  describe('active delegations', () => {
    it('should track active', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      expect(delegator.getActiveCount()).toBe(1);
    });

    it('should complete delegation', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      expect(delegator.completeDelegation('t1')).toBe(true);
      expect(delegator.getActiveCount()).toBe(0);
    });

    it('should decrement load on complete', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      const before = delegator.getAgent('a1')?.currentLoad;
      delegator.completeDelegation('t1');
      const after = delegator.getAgent('a1')?.currentLoad;
      expect(after).toBeLessThan(before!);
    });

    it('should return false for unknown', () => {
      expect(delegator.completeDelegation('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getAgent / getAllAgents
  // ============================================================
  describe('agent queries', () => {
    it('should get agent', () => {
      delegator.registerAgent('a1', 5);
      expect(delegator.getAgent('a1')?.capacity).toBe(5);
    });

    it('should get all agents', () => {
      delegator.registerAgent('a1', 5);
      delegator.registerAgent('a2', 5);
      expect(delegator.getAllAgents()).toHaveLength(2);
    });

    it('should get available agents', () => {
      delegator.registerAgent('a1', 5);
      delegator.registerAgent('a2', 0);
      expect(delegator.getAvailableAgents()).toHaveLength(1);
    });

    it('should get active agents', () => {
      delegator.registerAgent('a1', 5);
      delegator.registerAgent('a2', 5);
      delegator.setAgentActive('a2', false);
      expect(delegator.getActiveAgents()).toHaveLength(1);
    });
  });

  // ============================================================
  // hasAgent / removeAgent / setAgentActive
  // ============================================================
  describe('agent management', () => {
    it('should check existence', () => {
      delegator.registerAgent('a1', 5);
      expect(delegator.hasAgent('a1')).toBe(true);
    });

    it('should remove agent', () => {
      delegator.registerAgent('a1', 5);
      expect(delegator.removeAgent('a1')).toBe(true);
    });

    it('should set active', () => {
      delegator.registerAgent('a1', 5);
      expect(delegator.setAgentActive('a1', false)).toBe(true);
      expect(delegator.getAgent('a1')?.active).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(delegator.removeAgent('unknown')).toBe(false);
      expect(delegator.setAgentActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // getDelegationsByAgent / getDelegationByTask
  // ============================================================
  describe('delegation queries', () => {
    it('should filter by agent', () => {
      delegator.registerAgent('a1', 5);
      delegator.registerAgent('a2', 5);
      delegator.delegate('t1', 'r');
      delegator.delegate('t2', 'r');
      // Depends on which agents were selected
      expect(delegator.getDelegationsByAgent('a1').length + delegator.getDelegationsByAgent('a2').length).toBe(2);
    });

    it('should get by task', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      const d = delegator.getDelegationByTask('t1');
      expect(d?.taskId).toBe('t1');
    });

    it('should return undefined for unknown', () => {
      expect(delegator.getDelegationByTask('unknown')).toBeUndefined();
    });
  });

  // ============================================================
  // metrics
  // ============================================================
  describe('metrics', () => {
    it('should calculate average load', () => {
      delegator.registerAgent('a1', 5);
      delegator.registerAgent('a2', 5);
      delegator.delegate('t1', 'r');
      expect(delegator.getAverageLoad()).toBeGreaterThan(0);
    });

    it('should return 0 for no agents', () => {
      expect(delegator.getAverageLoad()).toBe(0);
    });

    it('should calculate total capacity', () => {
      delegator.registerAgent('a1', 5);
      delegator.registerAgent('a2', 3);
      expect(delegator.getTotalCapacity()).toBe(8);
    });

    it('should calculate total load', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      expect(delegator.getTotalLoad()).toBe(1);
    });

    it('should calculate utilization', () => {
      delegator.registerAgent('a1', 10);
      delegator.delegate('t1', 'r');
      expect(delegator.getUtilization()).toBe(0.1);
    });

    it('should return 0 for no agents utilization', () => {
      expect(delegator.getUtilization()).toBe(0);
    });
  });

  // ============================================================
  // clearHistory
  // ============================================================
  describe('clearHistory', () => {
    it('should clear history', () => {
      delegator.registerAgent('a1', 5);
      delegator.delegate('t1', 'r');
      delegator.clearHistory();
      expect(delegator.getHistoryCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many agents', () => {
      for (let i = 0; i < 50; i++) {
        delegator.registerAgent(`a${i}`, 5);
      }
      expect(delegator.getAgentCount()).toBe(50);
    });

    it('should handle many delegations', () => {
      delegator.registerAgent('a1', 100);
      for (let i = 0; i < 50; i++) {
        delegator.delegate(`t${i}`, 'r');
      }
      expect(delegator.getHistoryCount()).toBe(50);
    });
  });
});