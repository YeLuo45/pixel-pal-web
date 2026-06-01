export interface QueuedAction {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
}

export class OfflineQueue {
  private queue: QueuedAction[] = [];

  enqueue(action: string, payload: any): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queuedAction: QueuedAction = {
      id,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };
    this.queue.push(queuedAction);
    return id;
  }

  dequeue(): QueuedAction | null {
    // Only return 'pending' items, skip 'processing' ones
    const pendingIndex = this.queue.findIndex(a => a.status === 'pending');
    if (pendingIndex === -1) return null;
    const action = this.queue[pendingIndex];
    action.status = 'processing';
    return action;
  }

  requeue(action: QueuedAction): void {
    const existingIndex = this.queue.findIndex(a => a.id === action.id);
    if (existingIndex !== -1) {
      this.queue[existingIndex].status = 'pending';
      this.queue[existingIndex].retryCount = 1; // Reset to 1 after requeue
    } else {
      action.status = 'pending';
      action.retryCount = 1;
      this.queue.push(action);
    }
  }

  getPending(): QueuedAction[] {
    return this.queue.filter(a => a.status !== 'processing');
  }

  markProcessing(actionId: string): void {
    const action = this.queue.find(a => a.id === actionId);
    if (action) {
      action.status = 'processing';
    }
  }

  markFailed(actionId: string): void {
    const action = this.queue.find(a => a.id === actionId);
    if (action) {
      action.status = 'failed';
      action.retryCount += 1;
    }
  }

  getStats(): { pending: number; processing: number; failed: number } {
    return {
      pending: this.queue.filter(a => a.status === 'pending').length,
      processing: this.queue.filter(a => a.status === 'processing').length,
      failed: this.queue.filter(a => a.status === 'failed').length,
    };
  }
}