/**
 * Saga Executor
 * thunderbolt-design Saga Executor - Define + Execute + Compensate + Track
 */

export type SagaStatus = 'pending' | 'running' | 'completed' | 'compensated' | 'failed';

export interface SagaStep {
  name: string;
  execute: () => Promise<boolean>;
  compensate: () => Promise<void>;
}

export interface SagaInstance {
  id: string;
  name: string;
  steps: SagaStep[];
  currentStep: number;
  status: SagaStatus;
  executedSteps: string[];
  created: number;
  updated: number;
}

export class SagaExecutor {
  private sagas: Map<string, SagaInstance> = new Map();
  private counter = 0;

  define(name: string, steps: SagaStep[]): string {
    const id = `saga-${++this.counter}`;
    this.sagas.set(id, {
      id,
      name,
      steps: [...steps],
      currentStep: 0,
      status: 'pending',
      executedSteps: [],
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
        const success = await step.execute();
        if (!success) {
          saga.status = 'failed';
          await this.compensate(id);
          return false;
        }
        saga.executedSteps.push(step.name);
      } catch {
        saga.status = 'failed';
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

    const executedCopy = [...saga.executedSteps];
    for (let i = executedCopy.length - 1; i >= 0; i--) {
      const stepName = executedCopy[i];
      const step = saga.steps.find(s => s.name === stepName);
      if (step) {
        try {
          await step.compensate();
        } catch {
          // ignore compensation errors
        }
      }
    }
    saga.status = 'compensated';
    saga.updated = Date.now();
    return true;
  }

  getStatus(id: string): SagaStatus | null {
    return this.sagas.get(id)?.status ?? null;
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

  getCurrentStep(id: string): number {
    return this.sagas.get(id)?.currentStep ?? -1;
  }

  getExecutedSteps(id: string): string[] {
    return [...(this.sagas.get(id)?.executedSteps ?? [])];
  }

  getStepCount(id: string): number {
    return this.sagas.get(id)?.steps.length ?? 0;
  }

  getStepNames(id: string): string[] {
    return (this.sagas.get(id)?.steps ?? []).map(s => s.name);
  }

  getCompletedSagas(): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'completed');
  }

  getFailedSagas(): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'failed');
  }

  getCompensatedSagas(): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'compensated');
  }

  getRunningSagas(): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'running');
  }

  getPendingSagas(): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'pending');
  }

  getByStatus(status: SagaStatus): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.status === status);
  }

  getSuccessRate(): number {
    const all = Array.from(this.sagas.values());
    if (all.length === 0) return 0;
    const completed = all.filter(s => s.status === 'completed').length;
    return Math.round((completed / all.length) * 100) / 100;
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

export default SagaExecutor;