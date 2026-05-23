import React, { useState } from 'react';
import type { Pipeline, PipelineStep } from '../../services/orchestration/OrchestrationEngine';

/**
 * V139: PipelineBuilder — visual pipeline editor
 */
interface Props {
  pipeline?: Pipeline;
  onSave: (p: Pipeline) => void;
  onRun?: (p: Pipeline) => void;
}

export function PipelineBuilder({ pipeline, onSave, onRun }: Props) {
  const [name, setName] = useState(pipeline?.name ?? 'New Pipeline');
  const [steps, setSteps] = useState<PipelineStep[]>(pipeline?.steps ?? []);
  const [maxParallel, setMaxParallel] = useState(pipeline?.maxParallel ?? 2);

  const addStep = () => {
    setSteps(prev => [...prev, {
      id: `step_${Date.now()}`,
      skillId: '',
      input: {},
      depends_on: [],
      on_error: 'abort',
      retry_count: 0,
    }]);
  };

  const updateStep = (idx: number, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const handleSave = () => {
    const p: Pipeline = {
      id: pipeline?.id ?? `pipeline_${Date.now()}`,
      name,
      description: '',
      createdBy: 'user',
      createdAt: new Date().toISOString(),
      steps,
      maxParallel,
      retryOnFail: true,
      timeout_ms: 60000,
    };
    onSave(p);
  };

  return (
    <div className="pipeline-builder">
      <div className="builder-header">
        <input className="pipeline-name-input" value={name} onChange={e => setName(e.target.value)} placeholder="Pipeline name" />
        <div className="builder-actions">
          <button onClick={addStep}>+ Add Step</button>
          <button onClick={handleSave}>Save</button>
          {onRun && <button onClick={() => onRun({ id: pipeline?.id ?? '', name, description: '', createdBy: 'user', createdAt: '', steps, maxParallel, retryOnFail: true, timeout_ms: 60000 })}>Run</button>}
        </div>
      </div>
      <div className="pipeline-steps">
        {steps.length === 0 && <p className="muted">No steps yet. Click "+ Add Step" to start.</p>}
        {steps.map((step, idx) => (
          <div key={step.id} className="pipeline-step-card">
            <div className="step-header">
              <span className="step-id">{idx + 1}. {step.id}</span>
              <select value={step.on_error} onChange={e => updateStep(idx, { on_error: e.target.value as PipelineStep['on_error'] })}>
                <option value="abort">Abort on fail</option>
                <option value="skip">Skip on fail</option>
                <option value="retry">Retry on fail</option>
              </select>
            </div>
            <input placeholder="Skill ID" value={step.skillId} onChange={e => updateStep(idx, { skillId: e.target.value })} />
            <input placeholder="Depends on (comma-separated step IDs)" value={step.depends_on.join(', ')} onChange={e => updateStep(idx, { depends_on: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </div>
        ))}
      </div>
    </div>
  );
}