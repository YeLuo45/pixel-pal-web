/**
 * Saga Orchestrator
 * thunderbolt-design Saga Orchestrator - Define + Compensate + Execute + Track
 */

export type SagaStatus = 'pending' | 'running' | 'completed' | 'compensated' | 'failed';

export interface SagaStep {
  name: string;
  action: () => Promise<boolean>;
  compensation: () => Promise<void>;
}

export interface SagaDefinition {
  id: string;
  name: string;
  steps: SagaStep[];
  status: SagaStatus;
  currentStep: number;
  executedSteps: string[];
  created: number;
}

export class SagaOrchestrator {
  private sagas: Map<string, SagaDefinition> = new Map();
  private counter = 0;

  defineSaga(name: string, steps: SagaStep[]): string {
    const id = `saga-${++this.counter}`;
    this.sagas.set(id, {
      id,
      name,
      steps: steps.map(s => ({ ...s })),
      status: 'pending',
      currentStep: 0,
      executedSteps: [],
      created: Date.now(),
    });
    return id;
  }

  async execute(sagaId: string): Promise<boolean> {
    const saga = this.sagas.get(sagaId);
    if (!saga) return false;

    saga.status = 'running';
    for (let i = 0; i < saga.steps.length; i++) {
      saga.currentStep = i;
      const step = saga.steps[i];
      saga.executedSteps.push(step.name); // Mark as attempted for compensation
      try {
        const success = await step.action();
        if (!success) {
          saga.status = 'failed';
          await this.compensate(sagaId);
          return false;
        }
      } catch {
        saga.status = 'failed';
        await this.compensate(sagaId);
        return false;
      }
    }
    saga.status = 'completed';
    return true;
  }

  async compensate(sagaId: string): Promise<void> {
    const saga = this.sagas.get(sagaId);
    if (!saga) return;

    for (let i = saga.executedSteps.length - 1; i >= 0; i--) {
      const step = saga.steps.find(s => s.name === saga.executedSteps[i]);
      if (step) {
        try {
          await step.compensation();
        } catch {
          // Ignore compensation errors
        }
      }
    }
    saga.status = 'compensated';
  }

  getStatus(sagaId: string): SagaStatus | null {
    return this.sagas.get(sagaId)?.status ?? null;
  }

  getSaga(sagaId: string): SagaDefinition | undefined {
    return this.sagas.get(sagaId);
  }

  getAllSagas(): SagaDefinition[] {
    return Array.from(this.sagas.values());
  }

  removeSaga(sagaId: string): boolean {
    return this.sagas.delete(sagaId);
  }

  hasSaga(sagaId: string): boolean {
    return this.sagas.has(sagaId);
  }

  getSagaCount(): number {
    return this.sagas.size;
  }

  getExecutedSteps(sagaId: string): string[] {
    return [...(this.sagas.get(sagaId)?.executedSteps ?? [])];
  }

  getStepCount(sagaId: string): number {
    return this.sagas.get(sagaId)?.steps.length ?? 0;
  }

  getCurrentStep(sagaId: string): number {
    return this.sagas.get(sagaId)?.currentStep ?? -1;
  }

  getProgress(sagaId: string): number {
    const saga = this.sagas.get(sagaId);
    if (!saga || saga.steps.length === 0) return 0;
    return Math.round((saga.executedSteps.length / saga.steps.length) * 100) / 100;
  }

  getCompletedSagas(): SagaDefinition[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'completed');
  }

  getFailedSagas(): SagaDefinition[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'failed');
  }

  getCompensatedSagas(): SagaDefinition[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'compensated');
  }

  getPendingSagas(): SagaDefinition[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'pending');
  }

  getRunningSagas(): SagaDefinition[] {
    return Array.from(this.sagas.values()).filter(s => s.status === 'running');
  }

  isCompleted(sagaId: string): boolean {
    return this.sagas.get(sagaId)?.status === 'completed';
  }

  isFailed(sagaId: string): boolean {
    return this.sagas.get(sagaId)?.status === 'failed';
  }

  isCompensated(sagaId: string): boolean {
    return this.sagas.get(sagaId)?.status === 'compensated';
  }

  getSuccessRate(): number {
    if (this.sagas.size === 0) return 0;
    return Math.round((this.getCompletedSagas().length / this.sagas.size) * 100) / 100;
  }

  clearAll(): void {
    this.sagas.clear();
    this.counter = 0;
  }
}

export default SagaOrchestrator;