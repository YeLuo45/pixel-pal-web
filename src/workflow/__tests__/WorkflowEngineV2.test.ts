/**
 * WorkflowEngineV2 Tests
 * thunderbolt-design Workflow Engine v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkflowEngineV2 } from '../WorkflowEngineV2';

describe('WorkflowEngineV2', () => {
  let engine: WorkflowEngineV2;

  beforeEach(() => {
    engine = new WorkflowEngineV2();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // addState
  // ============================================================
  describe('addState', () => {
    it('should add state', () => {
      engine.addState('start', true);
      expect(engine.getStateCount()).toBe(1);
    });

    it('should set initial state', () => {
      engine.addState('start', true);
      expect(engine.getCurrentState()).toBe('start');
    });
  });

  // ============================================================
  // addTransition
  // ============================================================
  describe('addTransition', () => {
    it('should add transition', () => {
      engine.addState('a');
      engine.addState('b');
      expect(engine.addTransition({ from: 'a', to: 'b', event: 'go' })).toBe(true);
    });

    it('should return false for unknown state', () => {
      expect(engine.addTransition({ from: 'unknown', to: 'b', event: 'go' })).toBe(false);
    });
  });

  // ============================================================
  // fire
  // ============================================================
  describe('fire', () => {
    beforeEach(() => {
      engine.addState('a', true);
      engine.addState('b');
      engine.addState('c');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.addTransition({ from: 'b', to: 'c', event: 'next' });
    });

    it('should fire event', () => {
      expect(engine.fire('go')).toBe(true);
      expect(engine.getCurrentState()).toBe('b');
    });

    it('should chain events', () => {
      engine.fire('go');
      engine.fire('next');
      expect(engine.getCurrentState()).toBe('c');
    });

    it('should return false for unknown event', () => {
      expect(engine.fire('unknown')).toBe(false);
    });

    it('should return false for no current state', () => {
      engine.clearAll();
      expect(engine.fire('go')).toBe(false);
    });
  });

  // ============================================================
  // history
  // ============================================================
  describe('history', () => {
    it('should track history', () => {
      engine.addState('a', true);
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.fire('go');
      expect(engine.getHistory()).toHaveLength(1);
    });

    it('should get event history', () => {
      engine.addState('a', true);
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.fire('go');
      expect(engine.getEventHistory()).toHaveLength(1);
    });

    it('should return empty for no events', () => {
      expect(engine.getHistory()).toHaveLength(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get all states', () => {
      engine.addState('a');
      engine.addState('b');
      expect(engine.getAllStates()).toHaveLength(2);
    });

    it('should get all transitions', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(engine.getAllTransitions()).toHaveLength(1);
    });

    it('should check state existence', () => {
      engine.addState('a');
      expect(engine.hasState('a')).toBe(true);
    });

    it('should count', () => {
      expect(engine.getStateCount()).toBe(0);
      engine.addState('a');
      expect(engine.getStateCount()).toBe(1);
    });
  });

  // ============================================================
  // transitions queries
  // ============================================================
  describe('transition queries', () => {
    it('should get transitions from', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addState('c');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.addTransition({ from: 'a', to: 'c', event: 'skip' });
      expect(engine.getTransitionsFrom('a')).toHaveLength(2);
    });

    it('should get transitions to', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addState('c');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.addTransition({ from: 'c', to: 'b', event: 'go' });
      expect(engine.getTransitionsTo('b')).toHaveLength(2);
    });

    it('should get events for state', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addState('c');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.addTransition({ from: 'a', to: 'c', event: 'skip' });
      expect(engine.getEventsForState('a')).toEqual(['go', 'skip']);
    });
  });

  // ============================================================
  // canFire / getNextState
  // ============================================================
  describe('canFire / getNextState', () => {
    it('should check canFire', () => {
      engine.addState('a', true);
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(engine.canFire('go')).toBe(true);
    });

    it('should return false for non-fireable', () => {
      engine.addState('a', true);
      expect(engine.canFire('go')).toBe(false);
    });

    it('should get next state', () => {
      engine.addState('a', true);
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(engine.getNextState('go')).toBe('b');
    });

    it('should return null for unknown event', () => {
      engine.addState('a', true);
      expect(engine.getNextState('unknown')).toBeNull();
    });

    it('should return null for no current state', () => {
      expect(engine.getNextState('go')).toBeNull();
    });
  });

  // ============================================================
  // final states
  // ============================================================
  describe('final states', () => {
    it('should check isFinalState', () => {
      engine.addState('a');
      expect(engine.isFinalState('a')).toBe(true);
    });

    it('should not be final with outgoing', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(engine.isFinalState('a')).toBe(false);
    });

    it('should get final states', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(engine.getFinalStates()).toContain('b');
    });

    it('should check isInFinalState', () => {
      engine.addState('a', true);
      expect(engine.isInFinalState()).toBe(true);
    });

    it('should return false for no current state', () => {
      expect(engine.isInFinalState()).toBe(false);
    });
  });

  // ============================================================
  // reset / setInitial
  // ============================================================
  describe('reset / setInitial', () => {
    it('should reset', () => {
      engine.addState('a', true);
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.fire('go');
      engine.reset();
      expect(engine.getCurrentState()).toBe('a');
    });

    it('should set initial state', () => {
      engine.addState('a');
      engine.addState('b');
      expect(engine.setInitialState('b')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(engine.setInitialState('unknown')).toBe(false);
    });

    it('should get initial state', () => {
      engine.addState('a', true);
      expect(engine.getInitialState()).toBe('a');
    });
  });

  // ============================================================
  // remove
  // ============================================================
  describe('remove', () => {
    it('should remove state', () => {
      engine.addState('a');
      expect(engine.removeState('a')).toBe(true);
    });

    it('should remove transitions when state removed', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.removeState('a');
      expect(engine.getTransitionCount()).toBe(0);
    });

    it('should remove transition', () => {
      engine.addState('a');
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(engine.removeTransition('a', 'go')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(engine.removeTransition('unknown', 'go')).toBe(false);
    });
  });

  // ============================================================
  // event count
  // ============================================================
  describe('event count', () => {
    it('should return 0 for no events', () => {
      expect(engine.getEventCount()).toBe(0);
    });

    it('should count events', () => {
      engine.addState('a', true);
      engine.addState('b');
      engine.addTransition({ from: 'a', to: 'b', event: 'go' });
      engine.fire('go');
      expect(engine.getEventCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many states', () => {
      for (let i = 0; i < 50; i++) {
        engine.addState(`s${i}`);
      }
      expect(engine.getStateCount()).toBe(50);
    });
  });
});