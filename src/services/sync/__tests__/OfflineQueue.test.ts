import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineQueue, QueuedAction } from '../OfflineQueue';

describe('OfflineQueue', () => {
  let queue: OfflineQueue;

  beforeEach(() => {
    queue = new OfflineQueue();
  });

  describe('Basic Operations', () => {
    it('should create an empty queue', () => {
      expect(queue.getPending()).toHaveLength(0);
    });

    it('should enqueue an action and return an id', () => {
      const actionId = queue.enqueue('CREATE_USER', { name: 'Test' });
      expect(actionId).toBeDefined();
      expect(typeof actionId).toBe('string');
    });

    it('should dequeue an action', () => {
      queue.enqueue('CREATE_USER', { name: 'Test' });
      const action = queue.dequeue();
      expect(action).toBeDefined();
      expect(action?.action).toBe('CREATE_USER');
      expect(action?.payload).toEqual({ name: 'Test' });
    });

    it('should return null when dequeuing empty queue', () => {
      const action = queue.dequeue();
      expect(action).toBeNull();
    });
  });

  describe('Queue State Management', () => {
    it('should skip processing actions and return pending ones', () => {
      const id1 = queue.enqueue('ACTION_1', {});
      const id2 = queue.enqueue('ACTION_2', {});
      queue.markProcessing(id1);  // Mark first as processing
      const action = queue.dequeue();  // Should return the second one (pending)
      expect(action?.id).toBe(id2);
      expect(action?.status).toBe('processing');
    });

    it('should mark an action as failed', () => {
      const actionId = queue.enqueue('CREATE_USER', { name: 'Test' });
      queue.markFailed(actionId);
      const pending = queue.getPending();
      const failedAction = pending.find(a => a.id === actionId);
      expect(failedAction?.status).toBe('failed');
    });

    it('should requeue a failed action', () => {
      const actionId = queue.enqueue('CREATE_USER', { name: 'Test' });
      queue.markFailed(actionId);
      const failedAction = queue.getPending().find(a => a.id === actionId);
      queue.requeue(failedAction!);
      const pending = queue.getPending();
      expect(pending.find(a => a.id === actionId)?.status).toBe('pending');
    });
  });

  describe('Stats', () => {
    it('should return correct stats for empty queue', () => {
      const stats = queue.getStats();
      expect(stats.pending).toBe(0);
      expect(stats.processing).toBe(0);
      expect(stats.failed).toBe(0);
    });

    it('should return correct stats after enqueuing', () => {
      queue.enqueue('CREATE_USER', { name: 'Test1' });
      queue.enqueue('UPDATE_USER', { name: 'Test2' });
      const stats = queue.getStats();
      expect(stats.pending).toBe(2);
    });

    it('should return correct stats with mixed statuses', () => {
      const id1 = queue.enqueue('CREATE_USER', { name: 'Test1' });
      const id2 = queue.enqueue('UPDATE_USER', { name: 'Test2' });
      queue.markProcessing(id1);
      queue.markFailed(id2);
      const stats = queue.getStats();
      expect(stats.pending).toBe(0);
      expect(stats.processing).toBe(1);
      expect(stats.failed).toBe(1);
    });
  });

  describe('Action Properties', () => {
    it('should assign correct id on enqueue', () => {
      const id1 = queue.enqueue('ACTION_1', {});
      const id2 = queue.enqueue('ACTION_2', {});
      expect(id1).not.toBe(id2);
    });

    it('should assign timestamp on enqueue', () => {
      const before = Date.now();
      const id = queue.enqueue('TEST', {});
      const after = Date.now();
      const action = queue.getPending().find(a => a.id === id);
      expect(action!.timestamp).toBeGreaterThanOrEqual(before);
      expect(action!.timestamp).toBeLessThanOrEqual(after);
    });

    it('should initialize retry count to 0', () => {
      const id = queue.enqueue('TEST', {});
      const action = queue.getPending().find(a => a.id === id);
      expect(action!.retryCount).toBe(0);
    });

    it('should set initial status to pending', () => {
      const id = queue.enqueue('TEST', {});
      const action = queue.getPending().find(a => a.id === id);
      expect(action!.status).toBe('pending');
    });
  });

  describe('Complex Operations', () => {
    it('should handle multiple enqueue and dequeue cycles', () => {
      queue.enqueue('ACTION_1', { data: 1 });
      queue.enqueue('ACTION_2', { data: 2 });
      expect(queue.dequeue()?.payload.data).toBe(1);
      expect(queue.dequeue()?.payload.data).toBe(2);
      expect(queue.dequeue()).toBeNull();
    });

    it('should preserve action order (FIFO)', () => {
      const id1 = queue.enqueue('FIRST', {});
      const id2 = queue.enqueue('SECOND', {});
      const id3 = queue.enqueue('THIRD', {});
      const first = queue.dequeue();
      const second = queue.dequeue();
      const third = queue.dequeue();
      expect(first?.id).toBe(id1);
      expect(second?.id).toBe(id2);
      expect(third?.id).toBe(id3);
    });

    it('should handle requeue in correct order', () => {
      const firstId = queue.enqueue('FIRST', {});
      const secondId = queue.enqueue('SECOND', {});
      queue.markFailed(secondId);
      const second = queue.getPending().find(a => a.id === secondId);
      queue.requeue(second!);
      expect(queue.dequeue()?.id).toBe(firstId);
      expect(queue.dequeue()?.id).toBe(secondId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty action string', () => {
      const id = queue.enqueue('', {});
      expect(id).toBeDefined();
      expect(queue.getPending()[0].action).toBe('');
    });

    it('should handle null payload', () => {
      const id = queue.enqueue('TEST', null);
      expect(queue.getPending()[0].payload).toBeNull();
    });

    it('should handle complex nested payload', () => {
      const complexPayload = {
        user: { name: 'Test', address: { city: 'NYC', zip: '10001' } },
        tags: ['a', 'b', 'c'],
        nested: { arr: [{ id: 1 }, { id: 2 }] },
      };
      queue.enqueue('COMPLEX', complexPayload);
      const action = queue.getPending()[0];
      expect(action.payload).toEqual(complexPayload);
    });

    it('should handle markProcessing for non-existent id', () => {
      expect(() => queue.markProcessing('non-existent')).not.toThrow();
    });

    it('should handle markFailed for non-existent id', () => {
      expect(() => queue.markFailed('non-existent')).not.toThrow();
    });

    it('should handle requeue with non-existent action', () => {
      const fakeAction: QueuedAction = {
        id: 'fake',
        action: 'FAKE',
        payload: {},
        timestamp: Date.now(),
        retryCount: 0,
        status: 'failed',
      };
      expect(() => queue.requeue(fakeAction)).not.toThrow();
    });

    it('should handle getStats with empty pending list but processing/failed items', () => {
      const id1 = queue.enqueue('TEST1', {});
      const id2 = queue.enqueue('TEST2', {});
      queue.markProcessing(id1);
      queue.markFailed(id2);
      const stats = queue.getStats();
      expect(stats.processing).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(0);
    });
  });

  describe('Queue Limits', () => {
    it('should handle large number of queued items', () => {
      const count = 100;
      for (let i = 0; i < count; i++) {
        queue.enqueue(`ACTION_${i}`, { index: i });
      }
      expect(queue.getStats().pending).toBe(count);
    });

    it('should handle rapid enqueue operations', () => {
      const count = 50;
      for (let i = 0; i < count; i++) {
        queue.enqueue(`ACTION_${i}`, {});
      }
      let dequeued = 0;
      while (queue.dequeue()) dequeued++;
      expect(dequeued).toBe(count);
    });
  });

  describe('Action Modification', () => {
    it('should update retry count on requeue', () => {
      const id = queue.enqueue('TEST', {});
      queue.markFailed(id);
      const action = queue.getPending().find(a => a.id === id)!;
      expect(action.retryCount).toBe(1);
    });

    it('should allow multiple failed/requeue cycles', () => {
      const id = queue.enqueue('TEST', {});
      const action = queue.getPending().find(a => a.id === id)!;
      
      queue.markFailed(id);
      let updatedAction = queue.getPending().find(a => a.id === id)!;
      expect(updatedAction.retryCount).toBe(1);
      
      queue.requeue(updatedAction);
      queue.markFailed(id);
      updatedAction = queue.getPending().find(a => a.id === id)!;
      expect(updatedAction.retryCount).toBe(2);
    });
  });
});