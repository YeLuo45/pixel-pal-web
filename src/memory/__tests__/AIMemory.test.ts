/**
 * V176: AIMemory L0-L4 Architecture Unit Tests
 * 
 * Tests for Dream Memory L0-L4 tier system with crystallization support.
 * Coverage target: 99%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIMemoryManager, AIMemory, MemoryTier, DreamManager } from '../AIMemory';

// Mock database and dependencies
const mockDb = {
  getSQL: () => {
    const statements: string[] = [];
    const SQL = (strings: TemplateStringsArray, ...values: unknown[]) => {
      const query = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `?(${values[i]})` : ''), '');
      statements.push(query);
      return {
        toArray: () => [],
        toObject: () => ({}),
      };
    };
    SQL.__mock = true;
    (SQL as any).statements = statements;
    return SQL;
  },
};

vi.mock('../../db/index', () => ({
  getDatabase: () => mockDb,
  generateChangeId: () => 'mock-change-id-' + Date.now(),
  now: () => Date.now(),
}));

vi.mock('../../db/syncLog', () => ({
  addChangeLogEntry: vi.fn(),
}));

describe('MemoryTier Enum', () => {
  it('should have all five tiers defined', () => {
    expect(MemoryTier.L0_META).toBe('l0_meta');
    expect(MemoryTier.L1_INSIGHT).toBe('l1_insight');
    expect(MemoryTier.L2_WORKING).toBe('l2_working');
    expect(MemoryTier.L3_EPISODIC).toBe('l3_episodic');
    expect(MemoryTier.L4_SEMANTIC).toBe('l4_semantic');
  });

  it('should have correct string values', () => {
    expect(MemoryTier.L0_META).toMatch(/^l0_/);
    expect(MemoryTier.L1_INSIGHT).toMatch(/^l1_/);
    expect(MemoryTier.L2_WORKING).toMatch(/^l2_/);
    expect(MemoryTier.L3_EPISODIC).toMatch(/^l3_/);
    expect(MemoryTier.L4_SEMANTIC).toMatch(/^l4_/);
  });
});

describe('AIMemory Interface', () => {
  it('should have required properties', () => {
    const memory: AIMemory = {
      id: 'test-id',
      tier: MemoryTier.L4_SEMANTIC,
      content: 'Test content',
      importance_score: 75,
      crystallized: false,
      created_at: Date.now(),
      last_access: null,
      access_count: 0,
      tags: ['test'],
    };

    expect(memory.id).toBeDefined();
    expect(memory.tier).toBeDefined();
    expect(memory.content).toBeDefined();
    expect(memory.importance_score).toBeGreaterThanOrEqual(0);
    expect(memory.importance_score).toBeLessThanOrEqual(100);
    expect(typeof memory.crystallized).toBe('boolean');
    expect(memory.created_at).toBeDefined();
    expect(Array.isArray(memory.tags)).toBe(true);
  });

  it('should allow optional last_access as null', () => {
    const memory: AIMemory = {
      id: 'test-id',
      tier: MemoryTier.L2_WORKING,
      content: 'Test',
      importance_score: 50,
      crystallized: false,
      created_at: Date.now(),
      last_access: null,
      access_count: 0,
      tags: [],
    };

    expect(memory.last_access).toBeNull();
  });

  it('should allow numeric last_access', () => {
    const timestamp = Date.now();
    const memory: AIMemory = {
      id: 'test-id',
      tier: MemoryTier.L3_EPISODIC,
      content: 'Test',
      importance_score: 50,
      crystallized: false,
      created_at: timestamp,
      last_access: timestamp,
      access_count: 5,
      tags: [],
    };

    expect(memory.last_access).toBe(timestamp);
  });
});

describe('AIMemoryManager - Constructor', () => {
  it('should create instance successfully', () => {
    const manager = new AIMemoryManager();
    expect(manager).toBeInstanceOf(AIMemoryManager);
  });

  it('should initialize with empty layers', () => {
    const manager = new AIMemoryManager();
    const stats = manager.getStats();
    
    expect(stats.l0).toBe(0);
    expect(stats.l1).toBe(0);
    expect(stats.l2).toBe(0);
    expect(stats.l3).toBe(0);
    expect(stats.l4).toBe(0);
    expect(stats.total).toBe(0);
  });
});

describe('AIMemoryManager - L0 Meta Layer CRUD', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should create L0 meta memory', () => {
    const memory = manager.create({
      content: 'Meta info: access pattern data',
      tier: MemoryTier.L0_META,
      importance_score: 30,
      tags: ['meta', 'stats'],
    });

    expect(memory).toBeDefined();
    expect(memory?.tier).toBe(MemoryTier.L0_META);
    expect(memory?.id).toBeDefined();
    expect(memory?.content).toBe('Meta info: access pattern data');
  });

  it('should get L0 memory by id', () => {
    const created = manager.create({
      content: 'Meta content',
      tier: MemoryTier.L0_META,
      importance_score: 20,
    });

    const retrieved = manager.get(created!.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created?.id);
  });

  it('should update L0 memory', () => {
    const created = manager.create({
      content: 'Original meta',
      tier: MemoryTier.L0_META,
      importance_score: 10,
    });

    const updated = manager.update(created!.id, {
      content: 'Updated meta',
      importance_score: 50,
    });

    expect(updated).not.toBeNull();
    expect(updated?.content).toBe('Updated meta');
    expect(updated?.importance_score).toBe(50);
  });

  it('should delete L0 memory', () => {
    const created = manager.create({
      content: 'To be deleted',
      tier: MemoryTier.L0_META,
      importance_score: 5,
    });

    const result = manager.delete(created!.id);
    expect(result).toBe(true);

    const retrieved = manager.get(created!.id);
    expect(retrieved).toBeNull();
  });

  it('should return null when getting non-existent L0', () => {
    const result = manager.get('non-existent-l0');
    expect(result).toBeNull();
  });

  it('should update L0 with partial data', () => {
    const created = manager.create({
      content: 'Original',
      tier: MemoryTier.L0_META,
      importance_score: 50,
      tags: ['original'],
    });

    const updated = manager.update(created!.id, { importance_score: 75 });
    expect(updated?.importance_score).toBe(75);
    expect(updated?.content).toBe('Original');
    expect(updated?.tags).toEqual(['original']);
  });
});

describe('AIMemoryManager - L1 Insight Layer CRUD', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should create L1 insight memory with tags', () => {
    const memory = manager.create({
      content: 'Insight about user preferences',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 60,
      tags: ['preference', 'insight'],
    });

    expect(memory).toBeDefined();
    expect(memory?.tier).toBe(MemoryTier.L1_INSIGHT);
    expect(memory?.tags).toContain('insight');
  });

  it('should get L1 memory by id', () => {
    const created = manager.create({
      content: 'L1 insight content',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 40,
    });

    const retrieved = manager.get(created!.id);
    expect(retrieved?.tier).toBe(MemoryTier.L1_INSIGHT);
  });

  it('should update L1 memory tags', () => {
    const created = manager.create({
      content: 'Insight content',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 50,
      tags: ['old-tag'],
    });

    const updated = manager.update(created!.id, {
      tags: ['new-tag', 'updated'],
    });

    expect(updated?.tags).toContain('new-tag');
    expect(updated?.tags).toContain('updated');
  });

  it('should delete L1 memory', () => {
    const created = manager.create({
      content: 'L1 to delete',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 30,
    });

    expect(manager.delete(created!.id)).toBe(true);
    expect(manager.get(created!.id)).toBeNull();
  });
});

describe('AIMemoryManager - L2 Working Layer CRUD', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should create L2 working memory', () => {
    const memory = manager.create({
      content: 'Current conversation context',
      tier: MemoryTier.L2_WORKING,
      importance_score: 80,
    });

    expect(memory).toBeDefined();
    expect(memory?.tier).toBe(MemoryTier.L2_WORKING);
    expect(memory?.importance_score).toBe(80);
  });

  it('should get L2 memory by id', () => {
    const created = manager.create({
      content: 'Working memory',
      tier: MemoryTier.L2_WORKING,
      importance_score: 70,
    });

    const retrieved = manager.get(created!.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.tier).toBe(MemoryTier.L2_WORKING);
  });

  it('should update L2 memory content', () => {
    const created = manager.create({
      content: 'Original working content',
      tier: MemoryTier.L2_WORKING,
      importance_score: 65,
    });

    const updated = manager.update(created!.id, {
      content: 'Updated working content',
    });

    expect(updated?.content).toBe('Updated working content');
  });

  it('should delete L2 memory', () => {
    const created = manager.create({
      content: 'L2 delete test',
      tier: MemoryTier.L2_WORKING,
      importance_score: 55,
    });

    expect(manager.delete(created!.id)).toBe(true);
  });
});

describe('AIMemoryManager - L3 Episodic Layer CRUD', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should create L3 episodic memory', () => {
    const memory = manager.create({
      content: 'Yesterday conversation about movies',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 55,
    });

    expect(memory).toBeDefined();
    expect(memory?.tier).toBe(MemoryTier.L3_EPISODIC);
  });

  it('should get L3 memory by id', () => {
    const created = manager.create({
      content: 'Episodic memory',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 45,
    });

    const retrieved = manager.get(created!.id);
    expect(retrieved?.tier).toBe(MemoryTier.L3_EPISODIC);
  });

  it('should update L3 memory', () => {
    const created = manager.create({
      content: 'Original episodic',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 40,
    });

    const updated = manager.update(created!.id, {
      content: 'Updated episodic memory',
      importance_score: 60,
    });

    expect(updated?.content).toBe('Updated episodic memory');
    expect(updated?.importance_score).toBe(60);
  });

  it('should delete L3 memory', () => {
    const created = manager.create({
      content: 'L3 to delete',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 35,
    });

    expect(manager.delete(created!.id)).toBe(true);
  });
});

describe('AIMemoryManager - L4 Semantic Layer CRUD', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should create L4 semantic memory', () => {
    const memory = manager.create({
      content: 'Learned knowledge: sky is blue',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 90,
    });

    expect(memory).toBeDefined();
    expect(memory?.tier).toBe(MemoryTier.L4_SEMANTIC);
    expect(memory?.crystallized).toBe(false);
  });

  it('should get L4 memory by id', () => {
    const created = manager.create({
      content: 'Semantic knowledge',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 85,
    });

    const retrieved = manager.get(created!.id);
    expect(retrieved?.tier).toBe(MemoryTier.L4_SEMANTIC);
  });

  it('should update L4 memory', () => {
    const created = manager.create({
      content: 'Original semantic',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 75,
    });

    const updated = manager.update(created!.id, {
      content: 'Updated semantic knowledge',
    });

    expect(updated?.content).toBe('Updated semantic knowledge');
  });

  it('should delete L4 memory', () => {
    const created = manager.create({
      content: 'L4 to delete',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 70,
    });

    expect(manager.delete(created!.id)).toBe(true);
  });

  it('should track access_count on get', () => {
    const created = manager.create({
      content: 'Access tracking test',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 60,
    });

    manager.get(created!.id);
    manager.get(created!.id);
    manager.get(created!.id);

    const retrieved = manager.get(created!.id);
    expect(retrieved?.access_count).toBeGreaterThan(0);
  });
});

describe('AIMemoryManager - Promotions', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should promote L3 to L2', () => {
    const memory = manager.create({
      content: 'Promote me from L3 to L2',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 50,
    });

    const result = manager.promote(memory!.id);
    expect(result).toBe(true);

    const promoted = manager.get(memory!.id);
    expect(promoted?.tier).toBe(MemoryTier.L2_WORKING);
  });

  it('should promote L4 to L3', () => {
    const memory = manager.create({
      content: 'Promote me from L4 to L3',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 60,
    });

    const result = manager.promote(memory!.id);
    expect(result).toBe(true);

    const promoted = manager.get(memory!.id);
    expect(promoted?.tier).toBe(MemoryTier.L3_EPISODIC);
  });

  it('should not promote L0', () => {
    const memory = manager.create({
      content: 'L0 cannot be promoted',
      tier: MemoryTier.L0_META,
      importance_score: 30,
    });

    const result = manager.promote(memory!.id);
    expect(result).toBe(false);
  });

  it('should not promote L1', () => {
    const memory = manager.create({
      content: 'L1 cannot be promoted',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 40,
    });

    const result = manager.promote(memory!.id);
    expect(result).toBe(false);
  });

  it('should not promote L2 (already at target tier)', () => {
    const memory = manager.create({
      content: 'L2 cannot be promoted further',
      tier: MemoryTier.L2_WORKING,
      importance_score: 50,
    });

    const result = manager.promote(memory!.id);
    expect(result).toBe(false);
  });

  it('should return false for non-existent memory promotion', () => {
    const result = manager.promote('non-existent-id');
    expect(result).toBe(false);
  });

  it('should increment access_count on promotion', () => {
    const memory = manager.create({
      content: 'Promotion access test',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 45,
    });

    const accessBefore = memory!.access_count;
    manager.promote(memory!.id);
    const after = manager.get(memory!.id);
    expect(after!.access_count).toBeGreaterThan(accessBefore);
  });
});

describe('AIMemoryManager - Demotions', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should demote L2 to L3', () => {
    const memory = manager.create({
      content: 'Demote me from L2 to L3',
      tier: MemoryTier.L2_WORKING,
      importance_score: 50,
    });

    const result = manager.demote(memory!.id);
    expect(result).toBe(true);

    const demoted = manager.get(memory!.id);
    expect(demoted?.tier).toBe(MemoryTier.L3_EPISODIC);
  });

  it('should demote L3 to L4', () => {
    const memory = manager.create({
      content: 'Demote me from L3 to L4',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 40,
    });

    const result = manager.demote(memory!.id);
    expect(result).toBe(true);

    const demoted = manager.get(memory!.id);
    expect(demoted?.tier).toBe(MemoryTier.L4_SEMANTIC);
  });

  it('should not demote L4 (already at bottom)', () => {
    const memory = manager.create({
      content: 'L4 cannot be demoted',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 30,
    });

    const result = manager.demote(memory!.id);
    expect(result).toBe(false);
  });

  it('should not demote L0', () => {
    const memory = manager.create({
      content: 'L0 cannot be demoted',
      tier: MemoryTier.L0_META,
      importance_score: 20,
    });

    const result = manager.demote(memory!.id);
    expect(result).toBe(false);
  });

  it('should not demote L1', () => {
    const memory = manager.create({
      content: 'L1 cannot be demoted',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 25,
    });

    const result = manager.demote(memory!.id);
    expect(result).toBe(false);
  });

  it('should return false for non-existent memory demotion', () => {
    const result = manager.demote('non-existent-id');
    expect(result).toBe(false);
  });

  it('should increment access_count on demotion', () => {
    const memory = manager.create({
      content: 'Demotion access test',
      tier: MemoryTier.L2_WORKING,
      importance_score: 45,
    });

    const accessBefore = memory!.access_count;
    manager.demote(memory!.id);
    const after = manager.get(memory!.id);
    expect(after!.access_count).toBeGreaterThan(accessBefore);
  });
});

describe('AIMemoryManager - Crystallization', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should not crystallize L4 with less than 10 accesses', () => {
    const memory = manager.create({
      content: 'Not yet crystallized',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 50,
    });

    // Access 9 times
    for (let i = 0; i < 9; i++) {
      manager.get(memory!.id);
    }

    expect(manager.isCrystallized(memory!.id)).toBe(false);
  });

  it('should crystallize L4 after 10 or more accesses', () => {
    const memory = manager.create({
      content: 'Should be crystallized',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 60,
    });

    // Access 10 times
    for (let i = 0; i < 10; i++) {
      manager.get(memory!.id);
    }

    expect(manager.isCrystallized(memory!.id)).toBe(true);
  });

  it('should return false for non-existent memory crystallization check', () => {
    expect(manager.isCrystallized('non-existent')).toBe(false);
  });

  it('should return false for crystallize on non-existent memory', () => {
    expect(manager.crystallize('non-existent-id')).toBe(false);
  });

  it('should not crystallize L0', () => {
    const memory = manager.create({
      content: 'L0 cannot be crystallized',
      tier: MemoryTier.L0_META,
      importance_score: 30,
    });

    // Access many times
    for (let i = 0; i < 15; i++) {
      manager.get(memory!.id);
    }

    expect(manager.isCrystallized(memory!.id)).toBe(false);
  });

  it('should not crystallize L1', () => {
    const memory = manager.create({
      content: 'L1 cannot be crystallized',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 40,
    });

    for (let i = 0; i < 15; i++) {
      manager.get(memory!.id);
    }

    expect(manager.isCrystallized(memory!.id)).toBe(false);
  });

  it('should not crystallize L2', () => {
    const memory = manager.create({
      content: 'L2 cannot be crystallized',
      tier: MemoryTier.L2_WORKING,
      importance_score: 50,
    });

    for (let i = 0; i < 15; i++) {
      manager.get(memory!.id);
    }

    expect(manager.isCrystallized(memory!.id)).toBe(false);
  });

  it('should not crystallize L3', () => {
    const memory = manager.create({
      content: 'L3 cannot be crystallized',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 45,
    });

    for (let i = 0; i < 15; i++) {
      manager.get(memory!.id);
    }

    expect(manager.isCrystallized(memory!.id)).toBe(false);
  });
});

describe('AIMemoryManager - Cross-layer Recall', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should recall from all layers', () => {
    manager.create({
      content: 'The sky is blue',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 80,
    });
    manager.create({
      content: 'Yesterday we talked about sky',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 50,
    });
    manager.create({
      content: 'Current sky discussion',
      tier: MemoryTier.L2_WORKING,
      importance_score: 70,
    });

    const results = manager.recall('sky');
    expect(results.length).toBe(3);
  });

  it('should recall from specific layers', () => {
    manager.create({
      content: 'Blue sky semantic',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 85,
    });
    manager.create({
      content: 'Blue sky episodic',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 55,
    });
    manager.create({
      content: 'Blue sky working',
      tier: MemoryTier.L2_WORKING,
      importance_score: 65,
    });

    const results = manager.recall('blue', [MemoryTier.L4_SEMANTIC, MemoryTier.L3_EPISODIC]);
    expect(results.length).toBe(2);
    expect(results.every(r => r.tier === MemoryTier.L4_SEMANTIC || r.tier === MemoryTier.L3_EPISODIC)).toBe(true);
  });

  it('should return empty array when no matches', () => {
    manager.create({
      content: 'Unrelated content',
      tier: MemoryTier.L2_WORKING,
      importance_score: 50,
    });

    const results = manager.recall('nonexistentquery123');
    expect(results.length).toBe(0);
  });

  it('should recall from L0 meta', () => {
    manager.create({
      content: 'Meta memory about patterns',
      tier: MemoryTier.L0_META,
      importance_score: 30,
      tags: ['pattern'],
    });

    const results = manager.recall('patterns');
    expect(results.length).toBe(1);
  });

  it('should recall from L1 insight', () => {
    manager.create({
      content: 'User preference insight',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 60,
      tags: ['preference'],
    });

    const results = manager.recall('preference');
    expect(results.length).toBe(1);
  });

  it('should be case-insensitive', () => {
    manager.create({
      content: 'JavaScript Programming',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 75,
    });

    const results = manager.recall('javascript');
    expect(results.length).toBe(1);
  });

  it('should return empty array for empty query', () => {
    const results = manager.recall('');
    expect(Array.isArray(results)).toBe(true);
  });
});

describe('AIMemoryManager - Statistics', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should return correct stats for empty manager', () => {
    const stats = manager.getStats();
    
    expect(stats.l0).toBe(0);
    expect(stats.l1).toBe(0);
    expect(stats.l2).toBe(0);
    expect(stats.l3).toBe(0);
    expect(stats.l4).toBe(0);
    expect(stats.total).toBe(0);
  });

  it('should count L0 correctly', () => {
    manager.create({ content: 'L0-1', tier: MemoryTier.L0_META, importance_score: 10 });
    manager.create({ content: 'L0-2', tier: MemoryTier.L0_META, importance_score: 20 });

    const stats = manager.getStats();
    expect(stats.l0).toBe(2);
    expect(stats.total).toBe(2);
  });

  it('should count L1 correctly', () => {
    manager.create({ content: 'L1-1', tier: MemoryTier.L1_INSIGHT, importance_score: 30 });
    manager.create({ content: 'L1-2', tier: MemoryTier.L1_INSIGHT, importance_score: 40 });
    manager.create({ content: 'L1-3', tier: MemoryTier.L1_INSIGHT, importance_score: 50 });

    const stats = manager.getStats();
    expect(stats.l1).toBe(3);
    expect(stats.total).toBe(3);
  });

  it('should count L2 correctly', () => {
    manager.create({ content: 'L2-1', tier: MemoryTier.L2_WORKING, importance_score: 60 });
    manager.create({ content: 'L2-2', tier: MemoryTier.L2_WORKING, importance_score: 70 });

    const stats = manager.getStats();
    expect(stats.l2).toBe(2);
  });

  it('should count L3 correctly', () => {
    manager.create({ content: 'L3-1', tier: MemoryTier.L3_EPISODIC, importance_score: 50 });
    manager.create({ content: 'L3-2', tier: MemoryTier.L3_EPISODIC, importance_score: 60 });
    manager.create({ content: 'L3-3', tier: MemoryTier.L3_EPISODIC, importance_score: 70 });

    const stats = manager.getStats();
    expect(stats.l3).toBe(3);
  });

  it('should count L4 correctly', () => {
    manager.create({ content: 'L4-1', tier: MemoryTier.L4_SEMANTIC, importance_score: 80 });
    manager.create({ content: 'L4-2', tier: MemoryTier.L4_SEMANTIC, importance_score: 90 });

    const stats = manager.getStats();
    expect(stats.l4).toBe(2);
  });

  it('should calculate total correctly across all layers', () => {
    manager.create({ content: 'L0', tier: MemoryTier.L0_META, importance_score: 10 });
    manager.create({ content: 'L1', tier: MemoryTier.L1_INSIGHT, importance_score: 20 });
    manager.create({ content: 'L2', tier: MemoryTier.L2_WORKING, importance_score: 30 });
    manager.create({ content: 'L3', tier: MemoryTier.L3_EPISODIC, importance_score: 40 });
    manager.create({ content: 'L4', tier: MemoryTier.L4_SEMANTIC, importance_score: 50 });

    const stats = manager.getStats();
    expect(stats.total).toBe(5);
    expect(stats.l0 + stats.l1 + stats.l2 + stats.l3 + stats.l4).toBe(5);
  });
});

describe('AIMemoryManager - Update Edge Cases', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should return null when updating non-existent memory', () => {
    const result = manager.update('non-existent-id', { content: 'test' });
    expect(result).toBeNull();
  });

  it('should handle empty update', () => {
    const created = manager.create({
      content: 'Original',
      tier: MemoryTier.L2_WORKING,
      importance_score: 50,
    });

    const updated = manager.update(created!.id, {});
    expect(updated).not.toBeNull();
    expect(updated?.content).toBe('Original');
  });

  it('should preserve unchanged fields', () => {
    const created = manager.create({
      content: 'Original content',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 50,
      tags: ['original-tag'],
    });

    const updated = manager.update(created!.id, { importance_score: 80 });

    expect(updated?.importance_score).toBe(80);
    expect(updated?.content).toBe('Original content');
    expect(updated?.tags).toEqual(['original-tag']);
    expect(updated?.tier).toBe(MemoryTier.L3_EPISODIC);
  });
});

describe('AIMemoryManager - Delete Edge Cases', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should return false when deleting non-existent', () => {
    const result = manager.delete('non-existent-id');
    expect(result).toBe(false);
  });

  it('should not affect other memories when deleting', () => {
    const mem1 = manager.create({ content: 'Memory 1', tier: MemoryTier.L2_WORKING, importance_score: 60 });
    const mem2 = manager.create({ content: 'Memory 2', tier: MemoryTier.L2_WORKING, importance_score: 70 });

    manager.delete(mem1!.id);

    const stats = manager.getStats();
    expect(stats.l2).toBe(1);
    expect(manager.get(mem2!.id)).not.toBeNull();
  });
});

describe('DreamManager - Integration', () => {
  let dreamManager: DreamManager;

  beforeEach(() => {
    dreamManager = new DreamManager();
  });

  it('should create DreamManager instance', () => {
    expect(dreamManager).toBeInstanceOf(DreamManager);
  });

  it('should have crystallize method', () => {
    expect(typeof dreamManager.crystallize).toBe('function');
  });

  it('should have recall method', () => {
    expect(typeof dreamManager.recall).toBe('function');
  });

  it('should crystallize frequently accessed L4 memory', () => {
    const memory = dreamManager.storeMemory({
      content: 'Important knowledge',
      layer: 'cold',
      importance_score: 75,
    });

    // Access 10 times
    for (let i = 0; i < 10; i++) {
      dreamManager.getMemory(memory!.id);
    }

    const result = dreamManager.crystallize(memory!.id);
    expect(result).toBe(true);
  });

  it('should not crystallize infrequently accessed memory', () => {
    const memory = dreamManager.storeMemory({
      content: 'Less important',
      layer: 'cold',
      importance_score: 50,
    });

    // Access only 5 times
    for (let i = 0; i < 5; i++) {
      dreamManager.getMemory(memory!.id);
    }

    const result = dreamManager.crystallize(memory!.id);
    expect(result).toBe(false);
  });

  it('should recall memories by content query', () => {
    dreamManager.storeMemory({
      id: 'memory-1',
      content: 'JavaScript is a programming language',
      layer: 'cold',
      importance_score: 80,
    });

    dreamManager.storeMemory({
      id: 'memory-2',
      content: 'Python is also a programming language',
      layer: 'warm',
      importance_score: 70,
    });

    const results = dreamManager.recall('programming');
    expect(results.length).toBe(2);
  });

  it('should recall from specific layers', () => {
    dreamManager.storeMemory({
      id: 'hot-memory',
      content: 'Hot conversation about AI',
      layer: 'hot',
      importance_score: 85,
    });

    dreamManager.storeMemory({
      id: 'cold-memory',
      content: 'Cold archive about AI history',
      layer: 'cold',
      importance_score: 60,
    });

    const results = dreamManager.recall('AI', ['hot']);
    expect(results.length).toBe(1);
    expect(results[0].layer).toBe('hot');
  });

  it('should map hot layer to L2', () => {
    const memory = dreamManager.storeMemory({
      content: 'Hot memory mapped to L2',
      layer: 'hot',
      importance_score: 80,
    });

    const aiMemory = dreamManager.getAIMemory(memory!.id);
    expect(aiMemory?.tier).toBe(MemoryTier.L2_WORKING);
  });

  it('should map warm layer to L3', () => {
    const memory = dreamManager.storeMemory({
      content: 'Warm memory mapped to L3',
      layer: 'warm',
      importance_score: 60,
    });

    const aiMemory = dreamManager.getAIMemory(memory!.id);
    expect(aiMemory?.tier).toBe(MemoryTier.L3_EPISODIC);
  });

  it('should map cold layer to L4', () => {
    const memory = dreamManager.storeMemory({
      content: 'Cold memory mapped to L4',
      layer: 'cold',
      importance_score: 40,
    });

    const aiMemory = dreamManager.getAIMemory(memory!.id);
    expect(aiMemory?.tier).toBe(MemoryTier.L4_SEMANTIC);
  });
});

describe('DreamManager - Memory Store Operations', () => {
  let dreamManager: DreamManager;

  beforeEach(() => {
    dreamManager = new DreamManager();
  });

  it('should store memory with default layer', () => {
    const memory = dreamManager.storeMemory({
      content: 'Test memory',
      importance_score: 50,
    });

    expect(memory).toBeDefined();
    expect(memory?.layer).toBe('warm'); // default
  });

  it('should store memory with specific layer', () => {
    const memory = dreamManager.storeMemory({
      content: 'Hot memory',
      layer: 'hot',
      importance_score: 80,
    });

    expect(memory?.layer).toBe('hot');
  });

  it('should get stored memory', () => {
    const stored = dreamManager.storeMemory({
      id: 'get-test',
      content: 'Get this memory',
      importance_score: 60,
    });

    const retrieved = dreamManager.getMemory('get-test');
    expect(retrieved).toBeDefined();
    expect(retrieved?.content).toBe('Get this memory');
  });

  it('should update memory', () => {
    const stored = dreamManager.storeMemory({
      id: 'update-test',
      content: 'Original',
      importance_score: 50,
    });

    const updated = dreamManager.updateMemory('update-test', { content: 'Updated' });
    expect(updated?.content).toBe('Updated');
  });

  it('should delete memory', () => {
    const stored = dreamManager.storeMemory({
      id: 'delete-test',
      content: 'To delete',
      importance_score: 40,
    });

    const result = dreamManager.deleteMemory('delete-test');
    expect(result).toBe(true);
    expect(dreamManager.getMemory('delete-test')).toBeNull();
  });

  it('should get layer statistics', () => {
    dreamManager.storeMemory({ content: 'Hot 1', layer: 'hot', importance_score: 80 });
    dreamManager.storeMemory({ content: 'Hot 2', layer: 'hot', importance_score: 70 });
    dreamManager.storeMemory({ content: 'Warm 1', layer: 'warm', importance_score: 50 });

    const stats = dreamManager.getLayerStats();
    expect(stats.hot).toBe(2);
    expect(stats.warm).toBe(1);
  });
});

describe('AIMemoryManager - Importance Score Validation', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should accept importance_score 0', () => {
    const memory = manager.create({
      content: 'Zero importance',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 0,
    });
    expect(memory?.importance_score).toBe(0);
  });

  it('should accept importance_score 100', () => {
    const memory = manager.create({
      content: 'Max importance',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 100,
    });
    expect(memory?.importance_score).toBe(100);
  });

  it('should accept importance_score in middle', () => {
    const memory = manager.create({
      content: 'Medium importance',
      tier: MemoryTier.L2_WORKING,
      importance_score: 50,
    });
    expect(memory?.importance_score).toBe(50);
  });
});

describe('AIMemoryManager - Tags Management', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should create memory with empty tags', () => {
    const memory = manager.create({
      content: 'No tags',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 40,
    });
    expect(memory?.tags).toEqual([]);
  });

  it('should create memory with multiple tags', () => {
    const memory = manager.create({
      content: 'Multi tags',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 50,
      tags: ['tag1', 'tag2', 'tag3'],
    });
    expect(memory?.tags).toHaveLength(3);
    expect(memory?.tags).toContain('tag1');
    expect(memory?.tags).toContain('tag2');
    expect(memory?.tags).toContain('tag3');
  });

  it('should update tags', () => {
    const created = manager.create({
      content: 'Update tags test',
      tier: MemoryTier.L1_INSIGHT,
      importance_score: 45,
      tags: ['old'],
    });

    const updated = manager.update(created!.id, {
      tags: ['new', 'updated', 'tags'],
    });

    expect(updated?.tags).toHaveLength(3);
    expect(updated?.tags).toContain('new');
  });
});

describe('Cross-tier Operations', () => {
  let manager: AIMemoryManager;

  beforeEach(() => {
    manager = new AIMemoryManager();
  });

  it('should handle complex promotion path L4->L3->L2', () => {
    const memory = manager.create({
      content: 'Long journey memory',
      tier: MemoryTier.L4_SEMANTIC,
      importance_score: 60,
    });

    // Promote L4 -> L3
    manager.promote(memory!.id);
    expect(manager.get(memory!.id)?.tier).toBe(MemoryTier.L3_EPISODIC);

    // Promote L3 -> L2
    manager.promote(memory!.id);
    expect(manager.get(memory!.id)?.tier).toBe(MemoryTier.L2_WORKING);
  });

  it('should handle complex demotion path L2->L3->L4', () => {
    const memory = manager.create({
      content: 'Demotion journey',
      tier: MemoryTier.L2_WORKING,
      importance_score: 50,
    });

    // Demote L2 -> L3
    manager.demote(memory!.id);
    expect(manager.get(memory!.id)?.tier).toBe(MemoryTier.L3_EPISODIC);

    // Demote L3 -> L4
    manager.demote(memory!.id);
    expect(manager.get(memory!.id)?.tier).toBe(MemoryTier.L4_SEMANTIC);
  });

  it('should maintain data integrity through tier changes', () => {
    const created = manager.create({
      content: 'Data integrity test',
      tier: MemoryTier.L3_EPISODIC,
      importance_score: 70,
      tags: ['integrity'],
    });

    const id = created!.id;
    manager.promote(id);
    manager.demote(id);
    manager.promote(id);

    const final = manager.get(id);
    expect(final?.content).toBe('Data integrity test');
    expect(final?.tags).toEqual(['integrity']);
    expect(final?.importance_score).toBe(70);
  });
});