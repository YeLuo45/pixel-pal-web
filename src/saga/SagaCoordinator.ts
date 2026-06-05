/**
 * Saga Coordinator
 * thunderbolt-design Saga Coordinator - Define + Execute + Compensate + Stats
 */

export interface SagaStep {
  name: string;
  action: () => Promise<boolean>;
  compensate: () => Promise<void>;
}

export interface SagaInstance {
  id: string;
  steps: SagaStep[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensated';
  currentStep: number;
  created: number;
  updated: number;
}

export interface SagaStats {
  sagas: number;
  completed: number;
  failed: number;
  compensated: number;
}

export class SagaCoordinator {
  private sagas: Map<string, SagaInstance> = new Map();
  private counter = 0;

  define(steps: SagaStep[]): string {
    const id = `saga-${++this.counter}`;
    this.sagas.set(id, {
      id,
      steps,
      status: 'pending',
      currentStep: 0,
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  async execute(id: string): Promise<boolean> {
    const saga = this.sagas.get(id);
    if (!saga) return false;
    saga.status = 'running';
    saga.updated = Date.now();
    for (let i = 0; i < saga.steps.length; i++) {
      saga.currentStep = i;
      const step = saga.steps[i];
      try {
        const result = await step.action();
        if (!result) {
          saga.status = 'failed';
          saga.updated = Date.now();
          await this.compensate(id);
          return false;
        }
      } catch {
        saga.status = 'failed';
        saga.updated = Date.now();
        await this.compensate(id);
        return false;
      }
    }
    saga.status = 'completed';
    saga.updated = Date.now();
    return true;
  }

  async compensate(id: string): Promise<boolean> {
    const saga = this.sagas.get(id);
    if (!saga) return false;
    for (let i = saga.currentStep; i >= 0; i--) {
      try {
        await saga.steps[i].compensate();
      } catch {
        // Ignore compensation errors
      }
    }
    saga.status = 'compensated';
    saga.updated = Date.now();
    return true;
  }

  getStats(): SagaStats {
    const all = Array.from(this.sagas.values());
    return {
      sagas: all.length,
      completed: all.filter(s => s.status === 'completed').length,
      failed: all.filter(s => s.status === 'failed').length,
      compensated: all.filter(s => s.status === 'compensated').length,
    };
  }

  getSaga(id: string): SagaInstance | undefined {
    return this.sagas.get(id);
  }

  getAllSagas(): SagaInstance[] {
    return Array.from(this.sagas.values());
  }

  removeSaga(id: string): boolean {
    return this.sagas.delete(id);
  }

  hasSaga(id: string): boolean {
    return this.sagas.has(id);
  }

  getCount(): number {
    return this.sagas.size;
  }

  getStatus(id: string): SagaInstance['status'] | undefined {
    return this.sagas.get(id)?.status;
  }

  getCurrentStep(id: string): number {
    return this.sagas.get(id)?.currentStep ?? 0;
  }

  getStepCount(id: string): number {
    return this.sagas.get(id)?.steps.length ?? 0;
  }

  isCompleted(id: string): boolean {
    return this.sagas.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.sagas.get(id)?.status === 'failed';
  }

  isCompensated(id: string): boolean {
    return this.sagas.get(id)?.status === 'compensated';
  }

  isRunning(id: string): boolean {
    return this.sagas.get(id)?.status === 'running';
  }

  isPending(id: string): boolean {
    return this.sagas.get(id)?.status === 'pending';
  }

  getByStatus(status: SagaInstance['status']): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.status === status);
  }

  getCompletedSagas(): SagaInstance[] { return this.getByStatus('completed'); }
  getFailedSagas(): SagaInstance[] { return this.getByStatus('failed'); }
  getCompensatedSagas(): SagaInstance[] { return this.getByStatus('compensated'); }
  getRunningSagas(): SagaInstance[] { return this.getByStatus('running'); }
  getPendingSagas(): SagaInstance[] { return this.getByStatus('pending'); }

  getCreatedAt(id: string): number {
    return this.sagas.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.sagas.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.sagas.clear();
    this.counter = 0;
  }
}

export default SagaCoordinator;