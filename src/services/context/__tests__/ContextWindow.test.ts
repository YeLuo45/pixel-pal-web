import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContextWindow, ContextItem, WindowConfig } from '../ContextWindow';

describe('ContextWindow', () => {
  let window: ContextWindow;

  const defaultConfig: WindowConfig = {
    maxItems: 10,
    maxTokens: 4000,
    importanceThreshold: 0.3,
    autoPrune: true,
  };

  const createItem = (overrides: Partial<ContextItem> = {}): Omit<ContextItem, 'id' | 'timestamp'> => ({
    content: 'Test content',
    importance: 0.5,
    category: 'test',
    ...overrides,
  });

  describe('constructor', () => {
    it('should create with default config', () => {
      window = new ContextWindow();
      expect(window).toBeDefined();
    });

    it('should create with custom config', () => {
      window = new ContextWindow({ maxItems: 5, maxTokens: 2000 });
      expect(window).toBeDefined();
    });

    it('should handle partial config overrides', () => {
      window = new ContextWindow({ maxItems: 3 });
      expect(window).toBeDefined();
    });
  });

  describe('add', () => {
    beforeEach(() => {
      window = new ContextWindow(defaultConfig);
    });

    it('should add item and return with id and timestamp', () => {
      const item = createItem();
      const result = window.add(item);
      
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.content).toBe('Test content');
    });

    it('should generate unique ids', () => {
      const item = createItem();
      const result1 = window.add(item);
      const result2 = window.add(item);
      
      expect(result1.id).not.toBe(result2.id);
    });

    it('should add items with different importance values', () => {
      const item1 = createItem({ importance: 0.9 });
      const item2 = createItem({ importance: 0.3 });
      const item3 = createItem({ importance: 0.1 });
      
      const result1 = window.add(item1);
      const result2 = window.add(item2);
      const result3 = window.add(item3);
      
      expect(result1.importance).toBe(0.9);
      expect(result2.importance).toBe(0.3);
      expect(result3.importance).toBe(0.1);
    });

    it('should add items with different categories', () => {
      const item1 = createItem({ category: 'work' });
      const item2 = createItem({ category: 'personal' });
      const item3 = createItem({ category: 'urgent' });
      
      const result1 = window.add(item1);
      const result2 = window.add(item2);
      const result3 = window.add(item3);
      
      expect(result1.category).toBe('work');
      expect(result2.category).toBe('personal');
      expect(result3.category).toBe('urgent');
    });

    it('should store metadata when provided', () => {
      const meta = { key: 'value', nested: { data: true } };
      const item = createItem({ metadata: meta });
      
      const result = window.add(item);
      
      expect(result.metadata).toEqual(meta);
    });

    it('should handle empty string content', () => {
      const item = createItem({ content: '' });
      const result = window.add(item);
      
      expect(result.content).toBe('');
    });

    it('should handle very long content', () => {
      const item = createItem({ content: 'a'.repeat(10000) });
      const result = window.add(item);
      
      expect(result.content.length).toBe(10000);
    });

    it('should handle special characters in content', () => {
      const item = createItem({ content: '你好世界 🌍 🎉 <script>alert("xss")</script>' });
      const result = window.add(item);
      
      expect(result.content).toBe('你好世界 🌍 🎉 <script>alert("xss")</script>');
    });

    it('should auto-prune when exceeding maxItems if autoPrune is true', () => {
      const smallWindow = new ContextWindow({ maxItems: 3, autoPrune: true });
      
      smallWindow.add(createItem({ content: 'Item 1', importance: 0.5 }));
      smallWindow.add(createItem({ content: 'Item 2', importance: 0.7 }));
      smallWindow.add(createItem({ content: 'Item 3', importance: 0.3 }));
      smallWindow.add(createItem({ content: 'Item 4', importance: 0.8 }));
      smallWindow.add(createItem({ content: 'Item 5', importance: 0.6 }));
      
      const items = smallWindow.getItems();
      expect(items.length).toBeLessThanOrEqual(3);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      window = new ContextWindow(defaultConfig);
    });

    it('should remove existing item and return true', () => {
      const item = window.add(createItem());
      const result = window.remove(item.id);
      
      expect(result).toBe(true);
    });

    it('should return false for non-existent id', () => {
      const result = window.remove('non-existent-id');
      
      expect(result).toBe(false);
    });

    it('should successfully remove multiple items', () => {
      const item1 = window.add(createItem({ content: 'Item 1' }));
      const item2 = window.add(createItem({ content: 'Item 2' }));
      const item3 = window.add(createItem({ content: 'Item 3' }));
      
      expect(window.remove(item1.id)).toBe(true);
      expect(window.remove(item2.id)).toBe(true);
      expect(window.remove(item3.id)).toBe(true);
    });

    it('should not affect other items when one is removed', () => {
      const item1 = window.add(createItem({ content: 'Item 1' }));
      const item2 = window.add(createItem({ content: 'Item 2' }));
      
      window.remove(item1.id);
      
      const items = window.getItems();
      expect(items.find(i => i.id === item2.id)).toBeDefined();
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      window = new ContextWindow(defaultConfig);
      window.add(createItem({ content: 'Item 1' }));
      window.add(createItem({ content: 'Item 2' }));
      window.add(createItem({ content: 'Item 3' }));
      
      window.clear();
      
      expect(window.getItems().length).toBe(0);
    });

    it('should handle clearing empty window', () => {
      window = new ContextWindow(defaultConfig);
      window.clear();
      
      expect(window.getItems().length).toBe(0);
    });
  });

  describe('getItems', () => {
    beforeEach(() => {
      window = new ContextWindow(defaultConfig);
    });

    it('should return all items', () => {
      window.add(createItem({ content: 'Item 1' }));
      window.add(createItem({ content: 'Item 2' }));
      window.add(createItem({ content: 'Item 3' }));
      
      const items = window.getItems();
      
      expect(items.length).toBe(3);
    });

    it('should return empty array when no items', () => {
      const items = window.getItems();
      
      expect(items).toEqual([]);
    });

    it('should return items in insertion order', () => {
      window.add(createItem({ content: 'First' }));
      window.add(createItem({ content: 'Second' }));
      window.add(createItem({ content: 'Third' }));
      
      const items = window.getItems();
      
      expect(items[0].content).toBe('First');
      expect(items[1].content).toBe('Second');
      expect(items[2].content).toBe('Third');
    });
  });

  describe('getByCategory', () => {
    beforeEach(() => {
      window = new ContextWindow(defaultConfig);
    });

    it('should return items in specific category', () => {
      window.add(createItem({ category: 'work', content: 'Work 1' }));
      window.add(createItem({ category: 'personal', content: 'Personal 1' }));
      window.add(createItem({ category: 'work', content: 'Work 2' }));
      
      const items = window.getByCategory('work');
      
      expect(items.length).toBe(2);
      expect(items.every(i => i.category === 'work')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      window.add(createItem({ category: 'work', content: 'Work 1' }));
      
      const items = window.getByCategory('non-existent');
      
      expect(items).toEqual([]);
    });

    it('should return empty array when window is empty', () => {
      const items = window.getByCategory('work');
      
      expect(items).toEqual([]);
    });
  });

  describe('getRecent', () => {
    beforeEach(() => {
      window = new ContextWindow(defaultConfig);
    });

    it('should return most recent items', () => {
      window.add(createItem({ content: 'Item 1' }));
      window.add(createItem({ content: 'Item 2' }));
      window.add(createItem({ content: 'Item 3' }));
      
      const recent = window.getRecent(2);
      
      expect(recent.length).toBe(2);
      expect(recent[0].content).toBe('Item 3');
      expect(recent[1].content).toBe('Item 2');
    });

    it('should return all items if limit exceeds count', () => {
      window.add(createItem({ content: 'Item 1' }));
      window.add(createItem({ content: 'Item 2' }));
      
      const recent = window.getRecent(10);
      
      expect(recent.length).toBe(2);
    });

    it('should return empty array for zero limit', () => {
      window.add(createItem({ content: 'Item 1' }));
      
      const recent = window.getRecent(0);
      
      expect(recent).toEqual([]);
    });

    it('should return empty array when window is empty', () => {
      const recent = window.getRecent(5);
      
      expect(recent).toEqual([]);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      window = new ContextWindow(defaultConfig);
    });

    it('should find items by content substring', () => {
      window.add(createItem({ content: 'Hello world' }));
      window.add(createItem({ content: 'Goodbye world' }));
      window.add(createItem({ content: 'Hello there' }));
      
      const results = window.search('Hello');
      
      expect(results.length).toBe(2);
    });

    it('should be case insensitive', () => {
      window.add(createItem({ content: 'Hello World' }));
      window.add(createItem({ content: 'hello world' }));
      window.add(createItem({ content: 'HELLO WORLD' }));
      
      const results = window.search('hello');
      
      expect(results.length).toBe(3);
    });

    it('should return empty array for no matches', () => {
      window.add(createItem({ content: 'Hello world' }));
      
      const results = window.search('xyz');
      
      expect(results).toEqual([]);
    });

    it('should return empty array when window is empty', () => {
      const results = window.search('anything');
      
      expect(results).toEqual([]);
    });

    it('should handle special characters in search query', () => {
      window.add(createItem({ content: 'Test (special) content' }));
      window.add(createItem({ content: 'Another test' }));
      
      const results = window.search('(special)');
      
      expect(results.length).toBe(1);
    });

    it('should handle empty search query', () => {
      window.add(createItem({ content: 'Test content' }));
      
      const results = window.search('');
      
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('prune', () => {
    it('should prune items below importance threshold', () => {
      window = new ContextWindow({ 
        maxItems: 10, 
        maxTokens: 4000, 
        importanceThreshold: 0.5, 
        autoPrune: false 
      });
      
      window.add(createItem({ importance: 0.9 }));
      window.add(createItem({ importance: 0.3 }));
      window.add(createItem({ importance: 0.7 }));
      window.add(createItem({ importance: 0.1 }));
      
      const prunedCount = window.prune();
      
      expect(prunedCount).toBe(2);
      const items = window.getItems();
      expect(items.every(i => i.importance >= 0.5)).toBe(true);
    });

    it('should return 0 when no items to prune', () => {
      window = new ContextWindow({ 
        maxItems: 10, 
        maxTokens: 4000, 
        importanceThreshold: 0.5, 
        autoPrune: false 
      });
      
      window.add(createItem({ importance: 0.9 }));
      window.add(createItem({ importance: 0.7 }));
      
      const prunedCount = window.prune();
      
      expect(prunedCount).toBe(0);
    });

    it('should return 0 when window is empty', () => {
      window = new ContextWindow(defaultConfig);
      
      const prunedCount = window.prune();
      
      expect(prunedCount).toBe(0);
    });

    it('should remove items in order of lowest importance first', () => {
      window = new ContextWindow({ 
        maxItems: 10, 
        maxTokens: 4000, 
        importanceThreshold: 0.6, 
        autoPrune: false 
      });
      
      window.add(createItem({ importance: 0.9, content: 'High' }));
      window.add(createItem({ importance: 0.2, content: 'Low1' }));
      window.add(createItem({ importance: 0.3, content: 'Low2' }));
      window.add(createItem({ importance: 0.8, content: 'High2' }));
      
      window.prune();
      
      const items = window.getItems();
      expect(items.find(i => i.content === 'High')).toBeDefined();
      expect(items.find(i => i.content === 'High2')).toBeDefined();
      expect(items.find(i => i.content === 'Low1')).toBeUndefined();
      expect(items.find(i => i.content === 'Low2')).toBeUndefined();
    });
  });

  describe('resize', () => {
    it('should reduce maxItems and prune excess items', () => {
      window = new ContextWindow({ 
        maxItems: 10, 
        maxTokens: 4000, 
        importanceThreshold: 0, 
        autoPrune: false 
      });
      
      for (let i = 0; i < 8; i++) {
        window.add(createItem({ content: `Item ${i}`, importance: i / 10 }));
      }
      
      window.resize(5);
      
      const items = window.getItems();
      expect(items.length).toBeLessThanOrEqual(5);
    });

    it('should allow increasing maxItems', () => {
      window = new ContextWindow({ maxItems: 3, maxTokens: 4000, importanceThreshold: 0, autoPrune: false });
      
      window.add(createItem({ content: 'Item 1' }));
      window.add(createItem({ content: 'Item 2' }));
      window.resize(10);
      window.add(createItem({ content: 'Item 3' }));
      
      expect(window.getItems().length).toBe(3);
    });

    it('should handle resize to same size', () => {
      window = new ContextWindow({ maxItems: 5, maxTokens: 4000, importanceThreshold: 0, autoPrune: false });
      
      window.add(createItem({ content: 'Item 1' }));
      window.resize(5);
      
      expect(window.getItems().length).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return correct count', () => {
      window = new ContextWindow(defaultConfig);
      window.add(createItem());
      window.add(createItem());
      window.add(createItem());
      
      const stats = window.getStats();
      
      expect(stats.count).toBe(3);
    });

    it('should return correct estimated tokens', () => {
      window = new ContextWindow(defaultConfig);
      window.add(createItem({ content: 'Short' }));
      window.add(createItem({ content: 'Medium length content' }));
      window.add(createItem({ content: 'A'.repeat(100) }));
      
      const stats = window.getStats();
      
      expect(stats.estimatedTokens).toBeGreaterThan(0);
    });

    it('should return correct category breakdown', () => {
      window = new ContextWindow(defaultConfig);
      window.add(createItem({ category: 'work' }));
      window.add(createItem({ category: 'work' }));
      window.add(createItem({ category: 'personal' }));
      
      const stats = window.getStats();
      
      expect(stats.byCategory.work).toBe(2);
      expect(stats.byCategory.personal).toBe(1);
    });

    it('should return empty categories when window is empty', () => {
      window = new ContextWindow(defaultConfig);
      
      const stats = window.getStats();
      
      expect(stats.count).toBe(0);
      expect(stats.estimatedTokens).toBe(0);
      expect(Object.keys(stats.byCategory).length).toBe(0);
    });

    it('should handle items with no category', () => {
      window = new ContextWindow(defaultConfig);
      window.add(createItem({ category: '' }));
      
      const stats = window.getStats();
      
      expect(stats.byCategory['']).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle items with zero importance', () => {
      window = new ContextWindow(defaultConfig);
      const item = window.add(createItem({ importance: 0 }));
      
      expect(item.importance).toBe(0);
    });

    it('should handle items with importance of 1', () => {
      window = new ContextWindow(defaultConfig);
      const item = window.add(createItem({ importance: 1 }));
      
      expect(item.importance).toBe(1);
    });

    it('should handle adding many items rapidly', () => {
      window = new ContextWindow({ maxItems: 100, maxTokens: 100000, importanceThreshold: 0, autoPrune: false });
      
      for (let i = 0; i < 50; i++) {
        window.add(createItem({ content: `Item ${i}` }));
      }
      
      expect(window.getItems().length).toBe(50);
    });

    it('should preserve data integrity after multiple operations', () => {
      window = new ContextWindow(defaultConfig);
      
      const items: ContextItem[] = [];
      for (let i = 0; i < 5; i++) {
        items.push(window.add(createItem({ content: `Item ${i}` })));
      }
      
      window.remove(items[1].id);
      window.add(createItem({ content: 'New Item' }));
      window.add(createItem({ content: 'Another Item' }));
      
      const stats = window.getStats();
      expect(stats.count).toBe(6);
    });
  });
});