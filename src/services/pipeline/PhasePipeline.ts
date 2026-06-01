export enum PipelinePhase {
  INTENT_DETECTION = 'intent_detection',
  CONTEXT_GATHERING = 'context_gathering',
  EXECUTION = 'execution',
  REFLECTION = 'reflection',
  RESPONSE = 'response',
}

export interface PhaseResult {
  phase: PipelinePhase;
  output: any;
  success: boolean;
  duration: number;
}

export interface PipelineConfig {
  phases: PipelinePhase[];
  timeoutPerPhase?: number;
  continueOnError?: boolean;
}

export class PhasePipeline {
  private config: PipelineConfig;
  private results: PhaseResult[] = [];

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  async execute(input: any): Promise<PhaseResult[]> {
    this.results = [];

    for (const phase of this.config.phases) {
      const startTime = Date.now();
      let output: any;
      let success = true;

      try {
        output = await this.executePhase(phase, input);
      } catch (error) {
        success = false;
        output = { error: error instanceof Error ? error.message : String(error) };
        if (!this.config.continueOnError) {
          const duration = Date.now() - startTime;
          this.results.push({ phase, output, success, duration });
          break;
        }
      }

      const duration = Date.now() - startTime;
      this.results.push({ phase, output, success, duration });
      input = output;
    }

    return this.results;
  }

  private async executePhase(phase: PipelinePhase, input: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const output: Record<string, any> = {
          phase,
          input,
          processed: true,
          timestamp: Date.now()
        };
        resolve(output);
      }, 10);
    });
  }

  getResults(): PhaseResult[] {
    return [...this.results];
  }

  getResultByPhase(phase: PipelinePhase): PhaseResult | null {
    return this.results.find(r => r.phase === phase) || null;
  }

  reset(): void {
    this.results = [];
  }
}