/**
 * V168: MemoryQueryEngine Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryQueryEngine } from '../MemoryQueryEngine';
import type { QueryOptions } from '../MemoryQueryEngine';
import { DreamMemory } from '../../DreamMemory';

describe('MemoryQueryEngine', () => {
  let mqe: MemoryQueryEngine;
  let dm: DreamMemory;

  beforeEach(() => {
    dm = new DreamMemory();
    mqe = new MemoryQueryEngine(dm);
  });

  afterEach(() => {
    dm.destroy();
  });

  describe('query', () => {
    it('should return empty result when no memories', () => {
      const result = mqe.query('test');
      expect(result.entries).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should find memories by content text', () => {
      dm.store({ layer: 'L4', content: 'user likes coffee', importance: 70, tags: ['preference'] });
      
      const result = mqe.query('coffee');
      expect(result.total).toBeGreaterThan(0);
      expect(result.entries[0].content).toContain('coffee');
    });

    it('should filter by layers option', () => {
      dm.store({ layer: 'L4', content: 'L4 memory', importance: 50, tags: ['test'] });
      
      const result = mqe.query('memory', { layers: ['L4'] });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].layer).toBe('L4');
    });

    it('should respect limit option', () => {
      for (let i = 0; i < 10; i++) {
        dm.store({ layer: 'L4', content: `memory ${i}`, importance: 50, tags: ['test'] });
      }
      
      const result = mqe.query('memory', { limit: 3 });
      expect(result.entries.length).toBeLessThanOrEqual(3);
    });

    it('should filter by minImportance', () => {
      dm.store({ layer: 'L4', content: 'low importance', importance: 30, tags: ['test'] });
      dm.store({ layer: 'L4', content: 'high importance', importance: 80, tags: ['test'] });
      
      const result = mqe.query('importance', { minImportance: 70 });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].importance).toBeGreaterThanOrEqual(70);
    });

    it('should filter by tags', () => {
      dm.store({ layer: 'L4', content: 'coffee drink', importance: 70, tags: ['coffee', 'drink'] });
      dm.store({ layer: 'L4', content: 'tea drink', importance: 60, tags: ['tea', 'drink'] });
      
      const result = mqe.query('drink', { tags: ['coffee'] });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].tags).toContain('coffee');
    });

    it('should sort by importance descending', () => {
      dm.store({ layer: 'L4', content: 'low priority', importance: 30, tags: ['test'] });
      dm.store({ layer: 'L4', content: 'high priority', importance: 90, tags: ['test'] });
      dm.store({ layer: 'L4', content: 'medium priority', importance: 60, tags: ['test'] });
      
      const result = mqe.query('priority');
      expect(result.entries[0].importance).toBe(90);
      expect(result.entries[1].importance).toBe(60);
      expect(result.entries[2].importance).toBe(30);
    });

    it('should provide layer breakdown', () => {
      dm.store({ layer: 'L4', content: 'L4 memory', importance: 50, tags: ['test'] });
      
      const result = mqe.query('memory');
      expect(result.layerBreakdown.L4).toBe(1);
    });

    it('should search across all specified layers', () => {
      dm.store({ layer: 'L4', content: 'L4 content here', importance: 50, tags: ['test'] });
      dm.store({ layer: 'L0', content: 'L0 content here', importance: 50, tags: ['test'] });
      
      const result = mqe.query('here', { layers: ['L4', 'L0'] });
      expect(result.entries.length).toBe(2);
    });
  });

  describe('explain', () => {
    it('should include query text', () => {
      const explanation = mqe.explain('coffee');
      expect(explanation).toContain('Query: "coffee"');
    });

    it('should list layers', () => {
      const explanation = mqe.explain('test', { layers: ['L4'] });
      expect(explanation).toContain('Layers: L4');
    });

    it('should show limit', () => {
      const explanation = mqe.explain('test', { limit: 5 });
      expect(explanation).toContain('Limit: 5');
    });

    it('should show minImportance when set', () => {
      const explanation = mqe.explain('test', { minImportance: 70 });
      expect(explanation).toContain('Min Importance: 70');
    });

    it('should show tags when set', () => {
      const explanation = mqe.explain('test', { tags: ['coffee', 'tea'] });
      expect(explanation).toContain('Tags: coffee, tea');
    });

    it('should include total matches', () => {
      dm.store({ layer: 'L4', content: 'test memory', importance: 50, tags: ['test'] });
      
      const explanation = mqe.explain('test');
      expect(explanation).toContain('Total matches:');
    });

    it('should include layer breakdown', () => {
      dm.store({ layer: 'L4', content: 'test', importance: 50, tags: ['test'] });
      
      const explanation = mqe.explain('test');
      expect(explanation).toContain('Layer breakdown');
    });
  });

  describe('getLayerStats', () => {
    it('should return stats for all layers', () => {
      const stats = mqe.getLayerStats();
      expect(stats.L0).toBeDefined();
      expect(stats.L1).toBeDefined();
      expect(stats.L2).toBeDefined();
      expect(stats.L3).toBeDefined();
      expect(stats.L4).toBeDefined();
    });

    it('should show count of 0 for empty layers', () => {
      const stats = mqe.getLayerStats();
      expect(stats.L0.count).toBe(0);
      expect(stats.L1.count).toBe(0);
      expect(stats.L4.count).toBe(0);
    });

    it('should count memories per layer', () => {
      dm.store({ layer: 'L0', content: 'L0 memory', importance: 50, tags: ['test'] });
      dm.store({ layer: 'L1', content: 'L1 memory', importance: 50, tags: ['test'] });
      dm.store({ layer: 'L4', content: 'L4 memory', importance: 50, tags: ['test'] });
      
      const stats = mqe.getLayerStats();
      expect(stats.L0.count).toBe(1);
      expect(stats.L1.count).toBe(1);
      expect(stats.L4.count).toBe(1);
    });

    it('should calculate average importance per layer', () => {
      dm.store({ layer: 'L4', content: 'memory 1', importance: 60, tags: ['test'] });
      dm.store({ layer: 'L4', content: 'memory 2', importance: 80, tags: ['test'] });
      
      const stats = mqe.getLayerStats();
      expect(stats.L4.avgImportance).toBe(70);
    });

    it('should return 0 avgImportance for empty layer', () => {
      const stats = mqe.getLayerStats();
      expect(stats.L1.avgImportance).toBe(0);
    });
  });

  describe('query with multiple filters', () => {
    it('should combine layer and importance filters', () => {
      dm.store({ layer: 'L4', content: 'test', importance: 30, tags: ['coffee'] });
      dm.store({ layer: 'L4', content: 'test', importance: 80, tags: ['coffee'] });
      dm.store({ layer: 'L0', content: 'test', importance: 80, tags: ['coffee'] });
      
      const result = mqe.query('test', { 
        layers: ['L4'], 
        minImportance: 70 
      });
      
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].importance).toBe(80);
    });

    it('should combine layer and tags filters', () => {
      dm.store({ layer: 'L4', content: 'drink', importance: 70, tags: ['coffee'] });
      dm.store({ layer: 'L4', content: 'drink', importance: 60, tags: ['tea'] });
      dm.store({ layer: 'L0', content: 'drink', importance: 70, tags: ['coffee'] });
      
      const result = mqe.query('drink', { 
        layers: ['L4'], 
        tags: ['coffee'] 
      });
      
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].layer).toBe('L4');
    });

    it('should find by tag match', () => {
      dm.store({ layer: 'L4', content: 'something about coffee', importance: 70, tags: ['coffee'] });
      
      const result = mqe.query('uniqueTag123');
      expect(result.total).toBe(0);
    });
  });
});
