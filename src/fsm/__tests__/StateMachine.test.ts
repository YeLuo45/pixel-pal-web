/**
 * StateMachine Tests
 * thunderbolt-design State Machine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateMachine } from '../StateMachine';

describe('StateMachine', () => {
  let fsm: StateMachine;

  beforeEach(() => {
    fsm = new StateMachine();
  });

  afterEach(() => {
    fsm.clearAll();
  });

  // ============================================================
  // addState
  // ============================================================
  describe('addState', () => {
    it('should add state', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.getStateCount()).toBe(1);
    });

    it('should set initial state', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.getCurrentState()).toBe('a');
    });

    it('should set final state', () => {
      fsm.addState('end', { final: true });
      expect(fsm.isFinal('end')).toBe(true);
    });
  });

  // ============================================================
  // addTransition
  // ============================================================
  describe('addTransition', () => {
    it('should add transition', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      expect(fsm.addTransition({ from: 'a', to: 'b', event: 'go' })).toBe(true);
    });

    it('should return false for unknown state', () => {
      expect(fsm.addTransition({ from: 'unknown', to: 'b', event: 'go' })).toBe(false);
    });
  });

  // ============================================================
  // fire
  // ============================================================
  describe('fire', () => {
    it('should fire event', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(fsm.fire('go')).toBe(true);
    });

    it('should track history', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      fsm.fire('go');
      expect(fsm.getHistoryCount()).toBe(1);
    });

    it('should return false for unknown event', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.fire('unknown')).toBe(false);
    });

    it('should respect guard', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go', guard: () => false });
      expect(fsm.fire('go')).toBe(false);
    });

    it('should return false for no current state', () => {
      expect(fsm.fire('go')).toBe(false);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get state', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.getState('a')?.isInitial).toBe(true);
    });

    it('should get all states', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      expect(fsm.getAllStates()).toHaveLength(2);
    });

    it('should get all transitions', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(fsm.getAllTransitions()).toHaveLength(1);
    });

    it('should check existence', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.hasState('a')).toBe(true);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isInitial', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.isInitial('a')).toBe(true);
    });

    it('should check isFinal', () => {
      fsm.addState('end', { final: true });
      expect(fsm.isFinal('end')).toBe(true);
    });

    it('should check isInFinalState', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('end', { final: true });
      fsm.addTransition({ from: 'a', to: 'end', event: 'go' });
      fsm.fire('go');
      expect(fsm.isInFinalState()).toBe(true);
    });

    it('should return false for no current', () => {
      expect(fsm.isInFinalState()).toBe(false);
    });
  });

  // ============================================================
  // transition queries
  // ============================================================
  describe('transition queries', () => {
    it('should check canFire', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(fsm.canFire('go')).toBe(true);
    });

    it('should get next state', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(fsm.getNextState('go')).toBe('b');
    });

    it('should return null for unknown', () => {
      expect(fsm.getNextState('unknown')).toBeNull();
    });

    it('should get transitions from', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addState('c');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      fsm.addTransition({ from: 'a', to: 'c', event: 'skip' });
      expect(fsm.getTransitionsFrom('a')).toHaveLength(2);
    });

    it('should get transitions to', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addState('c');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      fsm.addTransition({ from: 'c', to: 'b', event: 'go' });
      expect(fsm.getTransitionsTo('b')).toHaveLength(2);
    });

    it('should get events for state', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(fsm.getEventsForState('a')).toEqual(['go']);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      fsm.fire('go');
      fsm.reset();
      expect(fsm.getCurrentState()).toBe('a');
    });
  });

  // ============================================================
  // setInitial / getInitial
  // ============================================================
  describe('setInitial / getInitial', () => {
    it('should set initial state', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      expect(fsm.setInitialState('b')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fsm.setInitialState('unknown')).toBe(false);
    });

    it('should get initial state', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.getInitialState()).toBe('a');
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should get state count', () => {
      expect(fsm.getStateCount()).toBe(0);
      fsm.addState('a', { initial: true });
      expect(fsm.getStateCount()).toBe(1);
    });

    it('should get transition count', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(fsm.getTransitionCount()).toBe(1);
    });
  });

  // ============================================================
  // final/initial states
  // ============================================================
  describe('final/initial states', () => {
    it('should get final states', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('end', { final: true });
      expect(fsm.getFinalStates()).toContain('end');
    });

    it('should get initial states', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.getInitialStates()).toContain('a');
    });
  });

  // ============================================================
  // remove
  // ============================================================
  describe('remove', () => {
    it('should remove state', () => {
      fsm.addState('a', { initial: true });
      expect(fsm.removeState('a')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fsm.removeState('unknown')).toBe(false);
    });

    it('should remove transition', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      expect(fsm.removeTransition('a', 'go')).toBe(true);
    });

    it('should return false for unknown transition', () => {
      expect(fsm.removeTransition('unknown', 'go')).toBe(false);
    });
  });

  // ============================================================
  // history filters
  // ============================================================
  describe('history filters', () => {
    it('should get by event', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      fsm.fire('go');
      expect(fsm.getHistoryByEvent('go')).toHaveLength(1);
    });

    it('should get visited states', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      fsm.fire('go');
      expect(fsm.getVisitedStates()).toContain('b');
    });

    it('should get transition frequency', () => {
      fsm.addState('a', { initial: true });
      fsm.addState('b');
      fsm.addTransition({ from: 'a', to: 'b', event: 'go' });
      fsm.fire('go');
      expect(fsm.getTransitionFrequency('a', 'b')).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many states', () => {
      for (let i = 0; i < 50; i++) {
        fsm.addState(`s${i}`, { initial: i === 0 });
      }
      expect(fsm.getStateCount()).toBe(50);
    });
  });
});