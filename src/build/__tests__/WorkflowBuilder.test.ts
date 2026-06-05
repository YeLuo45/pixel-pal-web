/**
 * WorkflowBuilder Tests
 * chatdev-design Workflow Builder
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkflowBuilder } from '../WorkflowBuilder';

describe('WorkflowBuilder', () => {
  let builder: WorkflowBuilder;

  beforeEach(() => {
    builder = new WorkflowBuilder();
  });

  afterEach(() => {
    builder.clearAll();
  });

  // ============================================================
  // addStep
  // ============================================================
  describe('addStep', () => {
    it('should add step', () => {
      expect(builder.addStep({ id: 's1', name: 'test', action: 'do' })).toBe(true);
    });

    it('should reject duplicate', () => {
      builder.addStep({ id: 's1', name: 'test', action: 'do' });
      expect(builder.addStep({ id: 's1', name: 'test', action: 'do' })).toBe(false);
    });
  });

  // ============================================================
  // connect
  // ============================================================
  describe('connect', () => {
    it('should connect', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      expect(builder.connect('s1', 's2')).toBe(true);
    });

    it('should return false for unknown from', () => {
      expect(builder.connect('unknown', 's2')).toBe(false);
    });

    it('should return false for unknown to', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.connect('s1', 'unknown')).toBe(false);
    });

    it('should not add duplicate', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      builder.connect('s1', 's2');
      builder.connect('s1', 's2');
      expect(builder.getNext('s1')).toEqual(['s2']);
    });
  });

  // ============================================================
  // validate
  // ============================================================
  describe('validate', () => {
    it('should validate valid workflow', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      builder.connect('s1', 's2');
      const def = builder.build();
      expect(builder.validate(def)).toBe(true);
    });

    it('should reject missing start', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      const def = { steps: builder.getAllSteps(), start: 'unknown', end: ['s1'] };
      expect(builder.validate(def)).toBe(false);
    });

    it('should reject missing end', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      const def = { steps: builder.getAllSteps(), start: 's1', end: ['unknown'] };
      expect(builder.validate(def)).toBe(false);
    });

    it('should reject missing next target', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      const def = { steps: [{ id: 's1', name: 'a', action: 'do', next: ['unknown'] }], start: 's1', end: ['s1'] };
      expect(builder.validate(def)).toBe(false);
    });
  });

  // ============================================================
  // compile
  // ============================================================
  describe('compile', () => {
    it('should compile', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      const def = builder.build();
      const result = builder.compile(def);
      expect(result).toContain('workflow');
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get step', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.getStep('s1')?.name).toBe('a');
    });

    it('should get all', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.getAllSteps()).toHaveLength(1);
    });

    it('should remove', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.removeStep('s1')).toBe(true);
    });

    it('should check existence', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.hasStep('s1')).toBe(true);
    });

    it('should count', () => {
      expect(builder.getCount()).toBe(0);
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.getName('s1')).toBe('a');
    });

    it('should get action', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'doSomething' });
      expect(builder.getAction('s1')).toBe('doSomething');
    });

    it('should get next', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      builder.connect('s1', 's2');
      expect(builder.getNext('s1')).toEqual(['s2']);
    });

    it('should get next count', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.getNextCount('s1')).toBe(0);
    });
  });

  // ============================================================
  // hasConnection / disconnect
  // ============================================================
  describe('hasConnection / disconnect', () => {
    it('should check hasConnection', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      builder.connect('s1', 's2');
      expect(builder.hasConnection('s1', 's2')).toBe(true);
    });

    it('should disconnect', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      builder.connect('s1', 's2');
      expect(builder.disconnect('s1', 's2')).toBe(true);
    });

    it('should return false for unknown disconnect', () => {
      expect(builder.disconnect('unknown', 's2')).toBe(false);
    });
  });

  // ============================================================
  // incoming
  // ============================================================
  describe('incoming', () => {
    it('should get incoming', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      builder.connect('s1', 's2');
      expect(builder.getIncoming('s2')).toEqual(['s1']);
    });

    it('should get incoming count', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      builder.addStep({ id: 's2', name: 'b', action: 'do' });
      builder.connect('s1', 's2');
      expect(builder.getIncomingCount('s2')).toBe(1);
    });
  });

  // ============================================================
  // roots / leaves
  // ============================================================
  describe('roots / leaves', () => {
    it('should get roots', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.getRoots()).toContain('s1');
    });

    it('should get leaves', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.getLeaves()).toContain('s1');
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set action', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.setAction('s1', 'new')).toBe(true);
    });

    it('should set name', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.setName('s1', 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(builder.setAction('unknown', 'a')).toBe(false);
      expect(builder.setName('unknown', 'n')).toBe(false);
    });
  });

  // ============================================================
  // build / export
  // ============================================================
  describe('build / export', () => {
    it('should build', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      const def = builder.build();
      expect(def.steps).toHaveLength(1);
    });

    it('should export', () => {
      builder.addStep({ id: 's1', name: 'a', action: 'do' });
      expect(builder.export()).toContain('workflow');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many steps', () => {
      for (let i = 0; i < 50; i++) {
        builder.addStep({ id: `s${i}`, name: `s${i}`, action: 'do' });
      }
      expect(builder.getCount()).toBe(50);
    });
  });
});