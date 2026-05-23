/**
 * V139: useOrchestration hook
 */
import { useState, useCallback } from 'react';
import { OrchestrationEngine, type Pipeline, type PipelineRun } from '../services/orchestration/OrchestrationEngine';
import { savePipeline, listPipelines } from '../services/orchestration/PipelineStore';

export function useOrchestration() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [running, setRunning] = useState(false);
  const engine = new OrchestrationEngine();

  const loadPipelines = useCallback(async () => {
    setPipelines(await listPipelines());
  }, []);

  const createPipeline = useCallback(async (p: Pipeline) => {
    await savePipeline(p);
    await loadPipelines();
  }, [loadPipelines]);

  const runPipeline = useCallback(async (pipeline: Pipeline, initialInput: Record<string, unknown>) => {
    setRunning(true);
    try {
      const run = await engine.runPipeline(pipeline, initialInput);
      setRuns(prev => [...prev, run]);
      return run;
    } finally {
      setRunning(false);
    }
  }, []);

  return { pipelines, runs, running, loadPipelines, createPipeline, runPipeline };
}