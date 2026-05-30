/**
 * ToolAnalytics Tests
 * V166: Tests for usage analytics and recommendations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  recordToolCall,
  getToolStats,
  getMostUsedTools,
  getRecommendedTools,
  clearStats,
  getTrackedTools,
  getToolSuccessRate,
  getToolAvgLatency,
  getTotalCallCount,
  getTotalFailureCount,
  getOverallSuccessRate,
  recordToolCalls,
  ToolUsageStats,
} from '../ToolAnalytics';

describe('ToolAnalytics', () => {
  beforeEach(() => {
    clearStats();
  });

  afterEach(() => {
    clearStats();
  });

  describe('recordToolCall', () => {
    it('should record a successful tool call', () => {
      recordToolCall('testTool', 100, true);

      const stats = getToolStats('testTool');
      expect(stats).toBeDefined();
      expect(stats?.callCount).toBe(1);
      expect(stats?.successCount).toBe(1);
      expect(stats?.failureCount).toBe(0);
    });

    it('should record a failed tool call', () => {
      recordToolCall('failTool', 50, false);

      const stats = getToolStats('failTool');
      expect(stats?.callCount).toBe(1);
      expect(stats?.successCount).toBe(0);
      expect(stats?.failureCount).toBe(1);
    });

    it('should accumulate call counts', () => {
      recordToolCall('countTool', 100, true);
      recordToolCall('countTool', 100, true);
      recordToolCall('countTool', 100, false);

      const stats = getToolStats('countTool');
      expect(stats?.callCount).toBe(3);
      expect(stats?.successCount).toBe(2);
      expect(stats?.failureCount).toBe(1);
    });

    it('should calculate average latency', () => {
      recordToolCall('latencyTool', 100, true);
      recordToolCall('latencyTool', 200, true);
      recordToolCall('latencyTool', 300, true);

      const stats = getToolStats('latencyTool');
      expect(stats?.avgLatencyMs).toBe(200);
    });

    it('should update lastCalledAt timestamp', () => {
      const beforeCall = new Date().toISOString();
      recordToolCall('timestampTool', 100, true);
      const afterCall = new Date().toISOString();

      const stats = getToolStats('timestampTool');
      expect(stats?.lastCalledAt).toBeDefined();
      expect(stats?.lastCalledAt >= beforeCall).toBe(true);
      expect(stats?.lastCalledAt <= afterCall).toBe(true);
    });

    it('should update lastSuccessAt only on success', () => {
      recordToolCall('successTimeTool', 100, false);
      recordToolCall('successTimeTool', 100, true);

      const stats = getToolStats('successTimeTool');
      expect(stats?.lastSuccessAt).toBeDefined();
      expect(stats?.lastSuccessAt).not.toBe('');
    });
  });

  describe('getToolStats', () => {
    it('should return undefined for non-existent tool', () => {
      expect(getToolStats('nonExistent')).toBeUndefined();
    });

    it('should return complete stats structure', () => {
      recordToolCall('completeTool', 100, true);

      const stats = getToolStats('completeTool');
      expect(stats).toEqual({
        toolName: 'completeTool',
        callCount: 1,
        successCount: 1,
        failureCount: 0,
        avgLatencyMs: 100,
        lastCalledAt: expect.any(String),
        lastSuccessAt: expect.any(String),
      });
    });
  });

  describe('getMostUsedTools', () => {
    it('should return empty array when no tools recorded', () => {
      expect(getMostUsedTools()).toEqual([]);
    });

    it('should return tools sorted by call count', () => {
      recordToolCall('lowTool', 100, true);
      recordToolCall('highTool', 100, true);
      recordToolCall('highTool', 100, true);
      recordToolCall('highTool', 100, true);
      recordToolCall('mediumTool', 100, true);
      recordToolCall('mediumTool', 100, true);

      const mostUsed = getMostUsedTools();
      expect(mostUsed[0].toolName).toBe('highTool');
      expect(mostUsed[1].toolName).toBe('mediumTool');
      expect(mostUsed[2].toolName).toBe('lowTool');
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        recordToolCall(`tool${i}`, 100, true);
      }

      const mostUsed = getMostUsedTools(3);
      expect(mostUsed.length).toBe(3);
    });

    it('should include latency and success data', () => {
      recordToolCall('dataTool', 100, true);
      recordToolCall('dataTool', 200, true);
      recordToolCall('dataTool', 100, false);

      const mostUsed = getMostUsedTools(1);
      expect(mostUsed[0].avgLatencyMs).toBeCloseTo(133.33, 1);
      expect(mostUsed[0].callCount).toBe(3);
      expect(mostUsed[0].successCount).toBe(2);
      expect(mostUsed[0].failureCount).toBe(1);
    });
  });

  describe('getRecommendedTools', () => {
    it('should return tools for admin role', () => {
      const recommended = getRecommendedTools('admin');
      expect(recommended).toContain('toolManagement');
      expect(recommended).toContain('userManagement');
    });

    it('should return tools for agent role', () => {
      const recommended = getRecommendedTools('agent');
      expect(recommended).toContain('dataQuery');
      expect(recommended).toContain('fileOperation');
    });

    it('should return tools for user role', () => {
      const recommended = getRecommendedTools('user');
      expect(recommended).toContain('documentRead');
      expect(recommended).toContain('imageGeneration');
    });

    it('should return empty array for unknown role', () => {
      const recommended = getRecommendedTools('unknownRole');
      expect(recommended).toEqual([]);
    });
  });

  describe('clearStats', () => {
    it('should clear all statistics', () => {
      recordToolCall('clearTool1', 100, true);
      recordToolCall('clearTool2', 100, true);

      clearStats();

      expect(getTrackedTools()).toEqual([]);
      expect(getToolStats('clearTool1')).toBeUndefined();
      expect(getToolStats('clearTool2')).toBeUndefined();
    });
  });

  describe('getTrackedTools', () => {
    it('should return empty array when no tools tracked', () => {
      expect(getTrackedTools()).toEqual([]);
    });

    it('should return list of tracked tool names', () => {
      recordToolCall('track1', 100, true);
      recordToolCall('track2', 100, true);

      const tracked = getTrackedTools();
      expect(tracked).toContain('track1');
      expect(tracked).toContain('track2');
    });

    it('should not include tools with zero calls after clearing', () => {
      recordToolCall('trackTool', 100, true);
      clearStats();
      recordToolCall('newTool', 100, true);

      const tracked = getTrackedTools();
      expect(tracked).toContain('newTool');
      expect(tracked).not.toContain('trackTool');
    });
  });

  describe('getToolSuccessRate', () => {
    it('should return undefined for non-existent tool', () => {
      expect(getToolSuccessRate('nonExistent')).toBeUndefined();
    });

    it('should return 100% for all successful calls', () => {
      recordToolCall('allSuccess', 100, true);
      recordToolCall('allSuccess', 100, true);
      recordToolCall('allSuccess', 100, true);

      expect(getToolSuccessRate('allSuccess')).toBe(100);
    });

    it('should return 0% for all failed calls', () => {
      recordToolCall('allFail', 100, false);
      recordToolCall('allFail', 100, false);

      expect(getToolSuccessRate('allFail')).toBe(0);
    });

    it('should return correct percentage for mixed results', () => {
      recordToolCall('mixedTool', 100, true);
      recordToolCall('mixedTool', 100, true);
      recordToolCall('mixedTool', 100, false);
      recordToolCall('mixedTool', 100, false);

      expect(getToolSuccessRate('mixedTool')).toBe(50);
    });
  });

  describe('getToolAvgLatency', () => {
    it('should return undefined for non-existent tool', () => {
      expect(getToolAvgLatency('nonExistent')).toBeUndefined();
    });

    it('should return 0 for tool with no calls', () => {
      // This case is covered by non-existent, since we don't track tools until first call
    });

    it('should return correct average latency', () => {
      recordToolCall('latencyAvg', 100, true);
      recordToolCall('latencyAvg', 200, true);
      recordToolCall('latencyAvg', 300, true);

      expect(getToolAvgLatency('latencyAvg')).toBe(200);
    });
  });

  describe('getTotalCallCount', () => {
    it('should return 0 when no calls recorded', () => {
      expect(getTotalCallCount()).toBe(0);
    });

    it('should sum all call counts', () => {
      recordToolCall('total1', 100, true);
      recordToolCall('total2', 100, true);
      recordToolCall('total2', 100, true);
      recordToolCall('total3', 100, true);

      expect(getTotalCallCount()).toBe(4);
    });
  });

  describe('getTotalFailureCount', () => {
    it('should return 0 when no failures', () => {
      expect(getTotalFailureCount()).toBe(0);
    });

    it('should sum all failure counts', () => {
      recordToolCall('fail1', 100, false);
      recordToolCall('fail2', 100, false);
      recordToolCall('fail2', 100, false);
      recordToolCall('success', 100, true);

      expect(getTotalFailureCount()).toBe(3);
    });
  });

  describe('getOverallSuccessRate', () => {
    it('should return 100 when no calls', () => {
      expect(getOverallSuccessRate()).toBe(100);
    });

    it('should return 100% for all successful calls', () => {
      recordToolCall('overall1', 100, true);
      recordToolCall('overall2', 100, true);

      expect(getOverallSuccessRate()).toBe(100);
    });

    it('should return correct percentage for mixed results', () => {
      recordToolCall('mixed1', 100, true);
      recordToolCall('mixed2', 100, true);
      recordToolCall('mixed3', 100, false);
      recordToolCall('mixed4', 100, false);

      expect(getOverallSuccessRate()).toBe(50);
    });
  });

  describe('recordToolCalls', () => {
    it('should record multiple calls at once', () => {
      recordToolCalls([
        { tool: 'batch1', latencyMs: 100, success: true },
        { tool: 'batch2', latencyMs: 200, success: true },
        { tool: 'batch1', latencyMs: 150, success: false },
      ]);

      const stats1 = getToolStats('batch1');
      const stats2 = getToolStats('batch2');

      expect(stats1?.callCount).toBe(2);
      expect(stats1?.successCount).toBe(1);
      expect(stats1?.failureCount).toBe(1);
      expect(stats2?.callCount).toBe(1);
    });

    it('should handle empty array', () => {
      recordToolCalls([]);
      expect(getTotalCallCount()).toBe(0);
    });
  });
});