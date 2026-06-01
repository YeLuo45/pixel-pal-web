/**
 * V178: EvolutionAnalytics Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  evolutionAnalytics,
  PerformanceAnalysis,
  ImprovementSuggestion,
  ImprovementResult 
} from '../analytics/EvolutionAnalytics';

describe('EvolutionAnalytics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('PerformanceAnalysis Interface', () => {
    it('should have correct PerformanceAnalysis structure', () => {
      const analysis: PerformanceAnalysis = {
        highValueMemories: [],
        lowValueMemories: [],
        accessPattern: 'frequent',
        avgMemoryAge: 1000,
        memoryEfficiency: 75,
        recommendations: ['Test recommendation'],
      };
      expect(analysis.accessPattern).toBe('frequent');
      expect(analysis.memoryEfficiency).toBe(75);
    });

    it('should accept all access pattern types', () => {
      const patterns: PerformanceAnalysis['accessPattern'][] = ['frequent', 'sporadic', 'declining'];
      patterns.forEach(p => {
        const analysis: PerformanceAnalysis = {
          highValueMemories: [],
          lowValueMemories: [],
          accessPattern: p,
          avgMemoryAge: 0,
          memoryEfficiency: 0,
          recommendations: [],
        };
        expect(analysis.accessPattern).toBe(p);
      });
    });
  });

  describe('ImprovementSuggestion Interface', () => {
    it('should have correct ImprovementSuggestion structure', () => {
      const suggestion: ImprovementSuggestion = {
        id: 'test-1',
        type: 'promotion',
        targetId: 'memory-1',
        description: 'Test description',
        expectedImpact: 15,
        priority: 'high',
      };
      expect(suggestion.type).toBe('promotion');
      expect(suggestion.priority).toBe('high');
    });

    it('should accept all improvement types', () => {
      const types: ImprovementSuggestion['type'][] = ['promotion', 'demotion', 'consolidation', 'pruning'];
      types.forEach(t => {
        const suggestion: ImprovementSuggestion = {
          id: `test-${t}`,
          type: t,
          targetId: 'memory-1',
          description: 'Test',
          expectedImpact: 10,
          priority: 'medium',
        };
        expect(suggestion.type).toBe(t);
      });
    });

    it('should accept all priority levels', () => {
      const priorities: ImprovementSuggestion['priority'][] = ['high', 'medium', 'low'];
      priorities.forEach(p => {
        const suggestion: ImprovementSuggestion = {
          id: `test-${p}`,
          type: 'promotion',
          targetId: 'memory-1',
          description: 'Test',
          expectedImpact: 10,
          priority: p,
        };
        expect(suggestion.priority).toBe(p);
      });
    });
  });

  describe('ImprovementResult Interface', () => {
    it('should have correct ImprovementResult structure', () => {
      const result: ImprovementResult = {
        applied: true,
        suggestionId: 'test-1',
        result: 'success',
        details: 'Test details',
      };
      expect(result.applied).toBe(true);
      expect(result.result).toBe('success');
    });

    it('should accept all result types', () => {
      const results: ImprovementResult['result'][] = ['success', 'skipped', 'failed'];
      results.forEach(r => {
        const result: ImprovementResult = {
          applied: false,
          suggestionId: 'test-1',
          result: r,
          details: 'Test',
        };
        expect(result.result).toBe(r);
      });
    });
  });

  describe('analyzePerformance', () => {
    it('should return PerformanceAnalysis structure', async () => {
      const analysis = await evolutionAnalytics.analyzePerformance();
      expect(analysis).toHaveProperty('highValueMemories');
      expect(analysis).toHaveProperty('lowValueMemories');
      expect(analysis).toHaveProperty('accessPattern');
      expect(analysis).toHaveProperty('avgMemoryAge');
      expect(analysis).toHaveProperty('memoryEfficiency');
      expect(analysis).toHaveProperty('recommendations');
    });

    it('should return empty arrays when no memories', async () => {
      const analysis = await evolutionAnalytics.analyzePerformance();
      expect(analysis.highValueMemories).toEqual([]);
      expect(analysis.lowValueMemories).toEqual([]);
    });

    it('should return recommendation for empty state', async () => {
      const analysis = await evolutionAnalytics.analyzePerformance();
      expect(analysis.recommendations).toContain('No memories to analyze');
    });
  });

  describe('generateImprovement', () => {
    it('should return array of improvement suggestions', async () => {
      const suggestions = await evolutionAnalytics.generateImprovement();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should include recommendations when memory efficiency is low', async () => {
      const suggestions = await evolutionAnalytics.generateImprovement();
      const consolidation = suggestions.find(s => s.type === 'consolidation');
      expect(consolidation).toBeDefined();
    });

    it('should sort suggestions by priority', async () => {
      const suggestions = await evolutionAnalytics.generateImprovement();
      const priorities = suggestions.map(s => s.priority);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < priorities.length; i++) {
        expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(priorityOrder[priorities[i-1]]);
      }
    });
  });

  describe('applyImprovement', () => {
    it('should handle promotion type', async () => {
      const suggestion: ImprovementSuggestion = {
        id: 'promote-test',
        type: 'promotion',
        targetId: 'non-existent-memory',
        description: 'Test promotion',
        expectedImpact: 15,
        priority: 'high',
      };
      const result = await evolutionAnalytics.applyImprovement(suggestion);
      expect(result).toHaveProperty('applied');
      expect(result).toHaveProperty('suggestionId');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('details');
    });

    it('should handle demotion type', async () => {
      const suggestion: ImprovementSuggestion = {
        id: 'demote-test',
        type: 'demotion',
        targetId: 'non-existent-memory',
        description: 'Test demotion',
        expectedImpact: 5,
        priority: 'medium',
      };
      const result = await evolutionAnalytics.applyImprovement(suggestion);
      expect(result.suggestionId).toBe('demote-test');
    });

    it('should handle pruning type', async () => {
      const suggestion: ImprovementSuggestion = {
        id: 'prune-test',
        type: 'pruning',
        targetId: 'non-existent-memory',
        description: 'Test pruning',
        expectedImpact: 5,
        priority: 'low',
      };
      const result = await evolutionAnalytics.applyImprovement(suggestion);
      expect(result.suggestionId).toBe('prune-test');
    });

    it('should handle consolidation type', async () => {
      const suggestion: ImprovementSuggestion = {
        id: 'consolidate-test',
        type: 'consolidation',
        targetId: 'memory-system',
        description: 'Test consolidation',
        expectedImpact: 10,
        priority: 'medium',
      };
      const result = await evolutionAnalytics.applyImprovement(suggestion);
      expect(result.applied).toBe(true);
      expect(result.result).toBe('success');
    });

    it('should handle unknown type with failed result', async () => {
      const suggestion = {
        id: 'unknown-test',
        type: 'unknown' as ImprovementSuggestion['type'],
        targetId: 'memory-1',
        description: 'Test unknown',
        expectedImpact: 0,
        priority: 'low' as const,
      };
      const result = await evolutionAnalytics.applyImprovement(suggestion);
      expect(result.result).toBe('failed');
    });
  });

  describe('evolutionAnalytics singleton', () => {
    it('should export singleton instance', () => {
      expect(evolutionAnalytics).toBeDefined();
      expect(typeof evolutionAnalytics).toBe('object');
    });
  });

  describe('calculateValueScore', () => {
    it('should consider access count in score', () => {
      const memory = {
        id: 'test_memory',
        content: 'test content',
        layer: 'hot' as const,
        access_count: 10,
        created_at: Date.now() - 86400000, // 1 day ago
        last_access: Date.now(),
        importance_score: 50,
      };
      const score = evolutionAnalytics.calculateValueScore(memory);
      expect(score).toBeGreaterThan(0);
    });
  });
});