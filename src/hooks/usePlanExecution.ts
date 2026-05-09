/**
 * usePlanExecution hook - stub to unblock build
 * Full implementation pending V66+
 */
import { useCallback } from 'react';

interface UsePlanExecutionOptions {
  onStepComplete?: (index: number, step: unknown, result: string) => void;
  onPlanComplete?: (plan: unknown) => void;
  onPlanFailed?: (plan: unknown, error: string) => void;
}

export function usePlanExecution(_options?: UsePlanExecutionOptions) {
  return {
    executePlan: useCallback(async () => {}, []),
    startExecution: useCallback(async () => {}, []),
    abortExecution: useCallback(() => {}, []),
  };
}
