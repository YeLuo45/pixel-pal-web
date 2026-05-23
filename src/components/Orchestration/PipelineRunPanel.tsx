import React from 'react';
import type { PipelineRun } from '../../services/orchestration/OrchestrationEngine';

/**
 * V139: PipelineRunPanel — runtime monitoring of pipeline execution
 */
interface Props {
  run: PipelineRun | null;
}

export function PipelineRunPanel({ run }: Props) {
  if (!run) return <div className="pipeline-run-panel muted">No run data. Execute a pipeline to see results.</div>;

  return (
    <div className="pipeline-run-panel">
      <div className={`run-status run-${run.status}`}>
        Status: {run.status.toUpperCase()} · Started: {run.startedAt.slice(0, 16)}
      </div>
      <div className="step-results">
        <h5>Step Results</h5>
        {Object.entries(run.stepResults).map(([stepId, result]) => (
          <div key={stepId} className={`step-result step-${result.status}`}>
            <span className="step-result-id">{stepId}</span>
            <span className="step-status">{result.status}</span>
            <span className="step-duration">{result.duration_ms}ms</span>
            {result.error && <span className="step-error">Error: {result.error}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}