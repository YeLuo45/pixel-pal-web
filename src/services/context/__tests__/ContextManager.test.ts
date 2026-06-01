import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../ContextManager';
import { WindowConfig } from '../ContextWindow';

describe('ContextManager', () => {
  let manager: ContextManager;

  const defaultWindowConfig: WindowConfig = {
    maxItems: 10,
    maxTokens: 4000,
    importanceThreshold: 0.3,
    autoPrune: true,
  };

  describe('constructor', () => {
    it('should create with default configs', () => {
      manager = new ContextManager();
      expect(manager).toBeDefined();
    });

    it('should create with custom window config', () => {
      manager = new ContextManager({ maxItems: 5, maxTokens: 2000 });
      expect(manager).toBeDefined();
    });

    it('should create with custom token budget', () => {
      manager = new ContextManager(undefined, 5000);
      expect(manager).toBeDefined();
    });

    it('should create with both custom configs', () => {
      manager = new ContextManager({ maxItems: 5, maxTokens: 2000 }, 5000);
      expect(manager).toBeDefined();
    });

    it('should allow partial window config', () => {
      manager = new ContextManager({ maxItems: 3 });
      expect(manager).toBeDefined();
    });
  });

  describe('addContext', () => {
    beforeEach(() => {
      manager = new ContextManager(defaultWindowConfig, 4000);
    });

    it('should add context and return item', () => {
      const item = manager.addContext('Test content', 'work');
      
      expect(item).toBeDefined();
      expect(item.content).toBe('Test content');
      expect(item.category).toBe('work');
      expect(item.id).toBeDefined();
    });

    it('should auto-generate id and timestamp', () => {
      const item = manager.addContext('Test', 'category');
      
      expect(item.id).toBeDefined();
      expect(item.timestamp).toBeDefined();
    });

    it('should use default importance of 0.5', () => {
      const item = manager.addContext('Test', 'category');
      
      expect(item.importance).toBe(0.5);
    });

    it('should accept custom importance', () => {
      const item = manager.addContext('Test', 'category', 0.9);
      
      expect(item.importance).toBe(0.9);
    });

    it('should handle special characters in content', () => {
      const content = 'Hello 世界! 🌍🎉 <script>alert("xss")</script>';
      const item = manager.addContext(content, 'test');
      
      expect(item.content).toBe(content);
    });

    it('should handle empty string content', () => {
      const item = manager.addContext('', 'test');
      
      expect(item.content).toBe('');
    });

    it('should handle very long content', () => {
      const content = 'a'.repeat(10000);
      const item = manager.addContext(content, 'test');
      
      expect(item.content.length).toBe(10000);
    });

    it('should add multiple contexts with different categories', () => {
      manager.addContext('Work item 1', 'work');
      manager.addContext('Work item 2', 'work');
      manager.addContext('Personal item', 'personal');
      
      const workItems = manager.getContextByCategory('work');
      const personalItems = manager.getContextByCategory('personal');
      
      expect(workItems.length).toBe(2);
      expect(personalItems.length).toBe(1);
    });

    it('should track importance values correctly', () => {
      manager.addContext('High priority', 'urgent', 0.9);
      manager.addContext('Low priority', 'tasks', 0.2);
      manager.addContext('Medium priority', 'tasks', 0.5);
      
      const active = manager.getActiveContext();
      const highPriority = active.filter(i => i.importance >= 0.7);
      
      expect(highPriority.length).toBe(1);
      expect(highPriority[0].content).toBe('High priority');
    });
  });

  describe('removeContext', () => {
    beforeEach(() => {
      manager = new ContextManager(defaultWindowConfig, 4000);
    });

    it('should remove existing context', () => {
      const item = manager.addContext('Test', 'category');
      
      const result = manager.removeContext(item.id);
      
      expect(result).toBe(true);
    });

    it('should return false for non-existent id', () => {
      const result = manager.removeContext('non-existent-id');
      
      expect(result).toBe(false);
    });

    it('should remove only specified item', () => {
      const item1 = manager.addContext('Item 1', 'work');
      const item2 = manager.addContext('Item 2', 'work');
      
      manager.removeContext(item1.id);
      
      const items = manager.getActiveContext();
      expect(items.find(i => i.id === item2.id)).toBeDefined();
      expect(items.find(i => i.id === item1.id)).toBeUndefined();
    });

    it('should handle removing from multiple categories', () => {
      const item1 = manager.addContext('Work item', 'work');
      const item2 = manager.addContext('Personal item', 'personal');
      
      manager.removeContext(item1.id);
      
      expect(manager.getContextByCategory('work').length).toBe(0);
      expect(manager.getContextByCategory('personal').length).toBe(1);
    });
  });

  describe('getActiveContext', () => {
    beforeEach(() => {
      manager = new ContextManager(defaultWindowConfig, 4000);
    });

    it('should return all active contexts', () => {
      manager.addContext('Item 1', 'category');
      manager.addContext('Item 2', 'category');
      manager.addContext('Item 3', 'category');
      
      const active = manager.getActiveContext();
      
      expect(active.length).toBe(3);
    });

    it('should return empty array when no contexts', () => {
      const active = manager.getActiveContext();
      
      expect(active).toEqual([]);
    });

    it('should return items in insertion order', () => {
      manager.addContext('First', 'category');
      manager.addContext('Second', 'category');
      manager.addContext('Third', 'category');
      
      const active = manager.getActiveContext();
      
      expect(active[0].content).toBe('First');
      expect(active[1].content).toBe('Second');
      expect(active[2].content).toBe('Third');
    });

    it('should return current items after removals', () => {
      const item1 = manager.addContext('Item 1', 'category');
      manager.addContext('Item 2', 'category');
      
      manager.removeContext(item1.id);
      
      const active = manager.getActiveContext();
      expect(active.length).toBe(1);
      expect(active[0].content).toBe('Item 2');
    });
  });

  describe('getContextByCategory', () => {
    beforeEach(() => {
      manager = new ContextManager(defaultWindowConfig, 4000);
    });

    it('should return items in specific category', () => {
      manager.addContext('Work 1', 'work');
      manager.addContext('Work 2', 'work');
      manager.addContext('Personal 1', 'personal');
      
      const workItems = manager.getContextByCategory('work');
      
      expect(workItems.length).toBe(2);
      expect(workItems.every(i => i.category === 'work')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      manager.addContext('Work item', 'work');
      
      const items = manager.getContextByCategory('xyz');
      
      expect(items).toEqual([]);
    });

    it('should return empty array when no items', () => {
      const items = manager.getContextByCategory('any');
      
      expect(items).toEqual([]);
    });

    it('should handle items with different categories', () => {
      manager.addContext('Item 1', 'cat1');
      manager.addContext('Item 2', 'cat2');
      manager.addContext('Item 3', 'cat3');
      
      expect(manager.getContextByCategory('cat1').length).toBe(1);
      expect(manager.getContextByCategory('cat2').length).toBe(1);
      expect(manager.getContextByCategory('cat3').length).toBe(1);
    });
  });

  describe('getSummarizableContext', () => {
    beforeEach(() => {
      manager = new ContextManager({
        maxItems: 10,
        maxTokens: 4000,
        importanceThreshold: 0.3,
        autoPrune: false,
      }, 4000);
    });

    it('should return context items', () => {
      manager.addContext('Important item', 'work', 0.8);
      
      const summarizable = manager.getSummarizableContext();
      
      expect(summarizable.length).toBe(1);
      expect(summarizable[0].content).toBe('Important item');
    });

    it('should exclude items below importance threshold', () => {
      manager.addContext('High importance', 'work', 0.9);
      manager.addContext('Low importance', 'work', 0.1);
      manager.addContext('Medium importance', 'work', 0.2);
      
      const summarizable = manager.getSummarizableContext();
      
      expect(summarizable.length).toBe(1);
      expect(summarizable[0].content).toBe('High importance');
    });

    it('should return empty array when all items below threshold', () => {
      manager.addContext('Low 1', 'work', 0.1);
      manager.addContext('Low 2', 'work', 0.2);
      
      const summarizable = manager.getSummarizableContext();
      
      expect(summarizable).toEqual([]);
    });

    it('should return empty array when no items', () => {
      const summarizable = manager.getSummarizableContext();
      
      expect(summarizable).toEqual([]);
    });

    it('should handle threshold boundary at exactly threshold', () => {
      manager.addContext('Exactly threshold', 'work', 0.3);
      
      const summarizable = manager.getSummarizableContext();
      
      // Items at exactly threshold should be included
      expect(summarizable.length).toBe(1);
    });
  });

  describe('optimize', () => {
    it('should prune low importance items', () => {
      manager = new ContextManager({
        maxItems: 5,
        maxTokens: 4000,
        importanceThreshold: 0.5,
        autoPrune: false,
      }, 4000);
      
      manager.addContext('High 1', 'work', 0.9);
      manager.addContext('High 2', 'work', 0.8);
      manager.addContext('Low 1', 'work', 0.2);
      manager.addContext('Low 2', 'work', 0.1);
      manager.addContext('Low 3', 'work', 0.3);
      
      manager.optimize();
      
      const active = manager.getActiveContext();
      expect(active.every(i => i.importance >= 0.5)).toBe(true);
    });

    it('should handle empty context', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      manager.optimize();
      
      expect(manager.getActiveContext()).toEqual([]);
    });

    it('should not remove high importance items', () => {
      manager = new ContextManager({
        maxItems: 3,
        maxTokens: 4000,
        importanceThreshold: 0.6,
        autoPrune: true,
      }, 4000);
      
      manager.addContext('Keep 1', 'work', 0.9);
      manager.addContext('Keep 2', 'work', 0.8);
      manager.addContext('Keep 3', 'work', 0.7);
      
      manager.optimize();
      
      const active = manager.getActiveContext();
      expect(active.length).toBe(3);
    });

    it('should handle already optimized context', () => {
      manager = new ContextManager({
        maxItems: 10,
        maxTokens: 4000,
        importanceThreshold: 0.3,
        autoPrune: false,
      }, 4000);
      
      manager.addContext('Good item', 'work', 0.8);
      
      manager.optimize();
      manager.optimize();
      
      expect(manager.getActiveContext().length).toBe(1);
    });
  });

  describe('summarize', () => {
    beforeEach(() => {
      manager = new ContextManager({
        maxItems: 10,
        maxTokens: 4000,
        importanceThreshold: 0.3,
        autoPrune: false,
      }, 4000);
    });

    it('should return string', () => {
      manager.addContext('Test item', 'work', 0.5);
      
      const summary = manager.summarize();
      
      expect(typeof summary).toBe('string');
    });

    it('should handle empty context', () => {
      const summary = manager.summarize();
      
      expect(summary).toBe('');
    });

    it('should include content in summary', () => {
      manager.addContext('Important message', 'work', 0.8);
      
      const summary = manager.summarize();
      
      expect(summary).toContain('Important message');
    });

    it('should handle multiple items', () => {
      manager.addContext('Item 1', 'work', 0.8);
      manager.addContext('Item 2', 'work', 0.7);
      
      const summary = manager.summarize();
      
      expect(summary).toContain('Item 1');
      expect(summary).toContain('Item 2');
    });

    it('should handle special characters', () => {
      manager.addContext('Hello 世界! 🌍', 'test', 0.8);
      
      const summary = manager.summarize();
      
      expect(summary).toContain('Hello 世界! 🌍');
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(5000);
      manager.addContext(longContent, 'test', 0.8);
      
      const summary = manager.summarize();
      
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      manager = new ContextManager(defaultWindowConfig, 4000);
    });

    it('should return object with context count', () => {
      manager.addContext('Item 1', 'work');
      manager.addContext('Item 2', 'work');
      
      const stats = manager.getStats();
      
      expect(stats.count).toBe(2);
    });

    it('should return object with category breakdown', () => {
      manager.addContext('Work 1', 'work');
      manager.addContext('Work 2', 'work');
      manager.addContext('Personal 1', 'personal');
      
      const stats = manager.getStats();
      
      expect(stats.categories.work).toBe(2);
      expect(stats.categories.personal).toBe(1);
    });

    it('should return object with token budget info', () => {
      manager.addContext('Item 1', 'work');
      manager.addContext('Item 2', 'personal');
      
      const stats = manager.getStats();
      
      expect(stats.totalBudget).toBeDefined();
      expect(stats.usedBudget).toBeDefined();
      expect(stats.availableBudget).toBeDefined();
    });

    it('should handle empty context', () => {
      const stats = manager.getStats();
      
      expect(stats.count).toBe(0);
      expect(stats.categories).toEqual({});
    });

    it('should include importance distribution', () => {
      manager.addContext('High', 'work', 0.9);
      manager.addContext('Low', 'work', 0.2);
      manager.addContext('Medium', 'work', 0.5);
      
      const stats = manager.getStats();
      
      expect(stats.highImportanceCount).toBe(1);
      expect(stats.mediumImportanceCount).toBe(1);
      expect(stats.lowImportanceCount).toBe(1);
    });

    it('should reflect budget allocations', () => {
      manager.addContext('Item 1', 'work', 0.8);
      
      const stats = manager.getStats();
      
      expect(stats.totalBudget).toBe(4000);
    });

    it('should return all relevant stats fields', () => {
      manager.addContext('Test', 'work', 0.7);
      
      const stats = manager.getStats();
      
      expect(stats).toHaveProperty('count');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('totalBudget');
      expect(stats).toHaveProperty('usedBudget');
      expect(stats).toHaveProperty('availableBudget');
      expect(stats).toHaveProperty('estimatedTokens');
    });
  });

  describe('integration scenarios', () => {
    it('should handle add, remove, and query operations', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      const item1 = manager.addContext('Work task', 'work', 0.8);
      manager.addContext('Personal note', 'personal', 0.6);
      manager.addContext('Low priority', 'tasks', 0.2);
      
      expect(manager.getActiveContext().length).toBe(3);
      expect(manager.getContextByCategory('work').length).toBe(1);
      
      manager.removeContext(item1.id);
      
      expect(manager.getActiveContext().length).toBe(2);
      expect(manager.getContextByCategory('work').length).toBe(0);
    });

    it('should maintain data integrity through multiple operations', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      const items: any[] = [];
      for (let i = 0; i < 10; i++) {
        items.push(manager.addContext(`Item ${i}`, 'category', i / 10));
      }
      
      for (let i = 0; i < 5; i++) {
        manager.removeContext(items[i].id);
      }
      
      const stats = manager.getStats();
      expect(stats.count).toBe(5);
      
      const remaining = manager.getActiveContext();
      expect(remaining.every(i => i.importance >= 0.5)).toBe(true);
    });

    it('should handle rapid context additions', () => {
      manager = new ContextManager({ maxItems: 100, maxTokens: 100000, importanceThreshold: 0, autoPrune: false }, 100000);
      
      for (let i = 0; i < 50; i++) {
        manager.addContext(`Rapid item ${i}`, 'test', 0.5);
      }
      
      expect(manager.getActiveContext().length).toBe(50);
    });

    it('should handle optimization after many additions', () => {
      manager = new ContextManager({
        maxItems: 10,
        maxTokens: 4000,
        importanceThreshold: 0.5,
        autoPrune: true,
      }, 4000);
      
      for (let i = 0; i < 20; i++) {
        manager.addContext(`Item ${i}`, 'test', i / 20);
      }
      
      manager.optimize();
      
      const stats = manager.getStats();
      expect(stats.count).toBeLessThanOrEqual(10);
    });

    it('should handle category-based filtering with various importance levels', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      manager.addContext('Work high', 'work', 0.9);
      manager.addContext('Work low', 'work', 0.2);
      manager.addContext('Personal medium', 'personal', 0.6);
      manager.addContext('Personal high', 'personal', 0.8);
      
      const highImportanceWork = manager.getContextByCategory('work').filter(i => i.importance >= 0.7);
      expect(highImportanceWork.length).toBe(1);
      expect(highImportanceWork[0].content).toBe('Work high');
    });

    it('should handle budget tracking across categories', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      manager.addContext('Item 1', 'category1', 0.8);
      manager.addContext('Item 2', 'category2', 0.7);
      
      const stats = manager.getStats();
      
      expect(stats.totalBudget).toBe(4000);
      expect(stats.count).toBe(2);  // Context items tracked separately from budget tokens
    });
  });

  describe('edge cases', () => {
    it('should handle removing all items one by one', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      const items = [
        manager.addContext('Item 1', 'work'),
        manager.addContext('Item 2', 'work'),
        manager.addContext('Item 3', 'work'),
      ];
      
      items.forEach(item => manager.removeContext(item.id));
      
      expect(manager.getActiveContext()).toEqual([]);
    });

    it('should handle empty category name', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      manager.addContext('Empty category item', '', 0.5);
      
      const items = manager.getContextByCategory('');
      expect(items.length).toBe(1);
    });

    it('should handle maximum importance value', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      const item = manager.addContext('Max importance', 'test', 1.0);
      
      expect(item.importance).toBe(1.0);
      
      const active = manager.getActiveContext();
      expect(active[0].importance).toBe(1.0);
    });

    it('should handle minimum importance value', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      const item = manager.addContext('Min importance', 'test', 0.0);
      
      expect(item.importance).toBe(0.0);
      
      const active = manager.getActiveContext();
      expect(active[0].importance).toBe(0.0);
    });

    it('should handle context with unicode content', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      const item = manager.addContext('日本語テスト 🚀', 'test', 0.8);
      
      expect(item.content).toBe('日本語テスト 🚀');
    });

    it('should handle context with json-like content', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      const jsonContent = '{"key": "value", "nested": {"data": 123}}';
      const item = manager.addContext(jsonContent, 'test', 0.8);
      
      expect(item.content).toBe(jsonContent);
    });

    it('should handle simultaneous add and remove operations', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      const item1 = manager.addContext('Item 1', 'work');
      const item2 = manager.addContext('Item 2', 'work');
      
      manager.removeContext(item1.id);
      manager.addContext('Item 3', 'work');
      
      const stats = manager.getStats();
      expect(stats.count).toBe(2);
    });

    it('should handle summarize with all importance levels', () => {
      manager = new ContextManager(defaultWindowConfig, 4000);
      
      manager.addContext('High', 'test', 0.95);
      manager.addContext('Medium', 'test', 0.5);
      manager.addContext('Low', 'test', 0.1);
      
      const summary = manager.summarize();
      
      expect(summary.length).toBeGreaterThan(0);
    });
  });
});