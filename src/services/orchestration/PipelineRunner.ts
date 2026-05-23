/**
 * V139: PipelineRunner — runs pipeline with state persistence
 */
import { OrchestrationEngine, type Pipeline, type PipelineRun } from './OrchestrationEngine';
import { savePipeline } from './PipelineStore';

export class PipelineRunner {
  private engine: OrchestrationEngine;

  constructor() {
    this.engine = new OrchestrationEngine();
  }

  registerSkill(skillId: string, fn: (input: Record<string, unknown>) => Promise<unknown>) {
    this.engine.registerSkill(skillId, fn);
  }

  async run(pipeline: Pipeline, initialInput: Record<string, unknown>): Promise<PipelineRun> {
    return this.engine.runPipeline(pipeline, initialInput);
  }

  async savePipeline(p: Pipeline): Promise<void> {
    await savePipeline(p);
  }
}