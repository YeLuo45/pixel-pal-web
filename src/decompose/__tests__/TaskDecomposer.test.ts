/**
 * TaskDecomposer Tests
 * chatdev-design Task Decomposer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskDecomposer } from '../TaskDecomposer';

describe('TaskDecomposer', () => {
  let decomposer: TaskDecomposer;

  beforeEach(() => {
    decomposer = new TaskDecomposer();
  });

  afterEach(() => {
    decomposer.clearAll();
  });

  // ============================================================
  // defineTask
  // ============================================================
  describe('defineTask', () => {
    it('should define task', () => {
      const id = decomposer.defineTask('test');
      expect(id).toBe('task-1');
    });
  });

  // ============================================================
  // decompose
  // ============================================================
  describe('decompose', () => {
    it('should decompose', () => {
      const id = decomposer.defineTask('parent');
      const subs = decomposer.decompose(id, ['a', 'b', 'c']);
      expect(subs).toHaveLength(3);
    });

    it('should return empty for unknown', () => {
      expect(decomposer.decompose('unknown', ['a'])).toHaveLength(0);
    });
  });

  // ============================================================
  // addDependency
  // ============================================================
  describe('addDependency', () => {
    it('should add dependency', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a', 'b']);
      expect(decomposer.addDependency(subs[1], subs[0])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(decomposer.addDependency('unknown', 'other')).toBe(false);
    });

    it('should return false for unknown dependency', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a']);
      expect(decomposer.addDependency(subs[0], 'unknown')).toBe(false);
    });
  });

  // ============================================================
  // getOrder
  // ============================================================
  describe('getOrder', () => {
    it('should get subtasks in order', () => {
      const parent = decomposer.defineTask('parent');
      decomposer.decompose(parent, ['a', 'b', 'c']);
      const order = decomposer.getOrder(parent);
      expect(order).toHaveLength(3);
      expect(order[0].name).toBe('a');
    });

    it('should return empty for unknown', () => {
      expect(decomposer.getOrder('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get subtask', () => {
      decomposer.defineTask('test');
      expect(decomposer.getSubtask('task-1')?.name).toBe('test');
    });

    it('should get all', () => {
      decomposer.defineTask('a');
      expect(decomposer.getAllSubtasks()).toHaveLength(1);
    });

    it('should remove root', () => {
      const id = decomposer.defineTask('test');
      expect(decomposer.removeSubtask(id)).toBe(true);
    });

    it('should check existence', () => {
      decomposer.defineTask('test');
      expect(decomposer.hasSubtask('task-1')).toBe(true);
    });

    it('should count', () => {
      expect(decomposer.getCount()).toBe(0);
      decomposer.defineTask('a');
      expect(decomposer.getCount()).toBe(1);
    });
  });

  // ============================================================
  // markComplete / markIncomplete
  // ============================================================
  describe('markComplete / markIncomplete', () => {
    it('should mark complete', () => {
      const id = decomposer.defineTask('test');
      expect(decomposer.markComplete(id)).toBe(true);
    });

    it('should mark incomplete', () => {
      const id = decomposer.defineTask('test');
      decomposer.markComplete(id);
      expect(decomposer.markIncomplete(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(decomposer.markComplete('unknown')).toBe(false);
    });

    it('should check isComplete', () => {
      const id = decomposer.defineTask('test');
      decomposer.markComplete(id);
      expect(decomposer.isComplete(id)).toBe(true);
    });
  });

  // ============================================================
  // dependencies
  // ============================================================
  describe('dependencies', () => {
    it('should get dependencies', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a', 'b']);
      decomposer.addDependency(subs[1], subs[0]);
      expect(decomposer.getDependencies(subs[1])).toEqual([subs[0]]);
    });

    it('should check hasDependency', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a', 'b']);
      decomposer.addDependency(subs[1], subs[0]);
      expect(decomposer.hasDependency(subs[1], subs[0])).toBe(true);
    });

    it('should get dependents', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a', 'b']);
      decomposer.addDependency(subs[1], subs[0]);
      expect(decomposer.getDependents(subs[0])).toHaveLength(1);
    });
  });

  // ============================================================
  // children / roots
  // ============================================================
  describe('children / roots', () => {
    it('should get children', () => {
      const parent = decomposer.defineTask('parent');
      decomposer.decompose(parent, ['a', 'b']);
      expect(decomposer.getChildren(parent)).toHaveLength(2);
    });

    it('should get roots', () => {
      decomposer.defineTask('a');
      decomposer.defineTask('b');
      expect(decomposer.getRoots()).toHaveLength(2);
    });

    it('should count roots', () => {
      decomposer.defineTask('a');
      expect(decomposer.getRootsCount()).toBe(1);
    });
  });

  // ============================================================
  // completion
  // ============================================================
  describe('completion', () => {
    it('should count completed', () => {
      const id = decomposer.defineTask('test');
      decomposer.markComplete(id);
      expect(decomposer.getCompletedCount()).toBe(1);
    });

    it('should count pending', () => {
      decomposer.defineTask('test');
      expect(decomposer.getPendingCount()).toBe(1);
    });

    it('should calculate completion rate', () => {
      const id = decomposer.defineTask('test');
      decomposer.markComplete(id);
      expect(decomposer.getCompletionRate()).toBe(1);
    });

    it('should return 0 for empty', () => {
      expect(decomposer.getCompletionRate()).toBe(0);
    });
  });

  // ============================================================
  // ready to execute
  // ============================================================
  describe('ready to execute', () => {
    it('should be ready when no dependencies', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a']);
      expect(decomposer.isReadyToExecute(subs[0])).toBe(true);
    });

    it('should not be ready when dependency not complete', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a', 'b']);
      decomposer.addDependency(subs[1], subs[0]);
      expect(decomposer.isReadyToExecute(subs[1])).toBe(false);
    });

    it('should be ready when dependency complete', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a', 'b']);
      decomposer.addDependency(subs[1], subs[0]);
      decomposer.markComplete(subs[0]);
      expect(decomposer.isReadyToExecute(subs[1])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(decomposer.isReadyToExecute('unknown')).toBe(false);
    });

    it('should not be ready when already complete', () => {
      const parent = decomposer.defineTask('parent');
      const subs = decomposer.decompose(parent, ['a']);
      decomposer.markComplete(subs[0]);
      expect(decomposer.isReadyToExecute(subs[0])).toBe(false);
    });

    it('should get ready subtasks', () => {
      const parent = decomposer.defineTask('parent');
      decomposer.decompose(parent, ['a', 'b']);
      // 3 ready: 1 parent + 2 subtasks (all have no incomplete deps)
      expect(decomposer.getReadySubtasks().length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================================
  // byParent / rename / name
  // ============================================================
  describe('byParent / rename / name', () => {
    it('should get by parent', () => {
      const parent = decomposer.defineTask('parent');
      decomposer.decompose(parent, ['a']);
      expect(decomposer.getByParent(parent)).toHaveLength(1);
    });

    it('should rename', () => {
      const id = decomposer.defineTask('test');
      expect(decomposer.renameSubtask(id, 'renamed')).toBe(true);
    });

    it('should get name', () => {
      decomposer.defineTask('test');
      expect(decomposer.getName('task-1')).toBe('test');
    });
  });

  // ============================================================
  // created
  // ============================================================
  describe('created', () => {
    it('should get created at', () => {
      decomposer.defineTask('test');
      expect(decomposer.getCreatedAt('task-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        decomposer.defineTask(`t${i}`);
      }
      expect(decomposer.getCount()).toBe(50);
    });
  });
});