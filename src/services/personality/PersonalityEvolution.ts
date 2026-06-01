import { PersonalityModel, PersonalityTraits } from './PersonalityModel';
import { AdaptiveLearner } from './AdaptiveLearner';

export interface EvolutionConfig {
  learningRate: number;
  decayRate: number;
  maxDataPoints: number;
}

export class PersonalityEvolution {
  private model: PersonalityModel;
  private learner: AdaptiveLearner;
  private config: EvolutionConfig;

  constructor(config?: Partial<EvolutionConfig> & { openness?: number; conscientiousness?: number; extraversion?: number; agreeableness?: number; neuroticism?: number }) {
    const initialTraits: Partial<PersonalityTraits> = {};
    if (config?.openness !== undefined) initialTraits.openness = config.openness;
    if (config?.conscientiousness !== undefined) initialTraits.conscientiousness = config.conscientiousness;
    if (config?.extraversion !== undefined) initialTraits.extraversion = config.extraversion;
    if (config?.agreeableness !== undefined) initialTraits.agreeableness = config.agreeableness;
    if (config?.neuroticism !== undefined) initialTraits.neuroticism = config.neuroticism;
    
    this.model = new PersonalityModel(initialTraits);
    this.learner = new AdaptiveLearner();
    this.config = {
      learningRate: config?.learningRate ?? 0.01,
      decayRate: config?.decayRate ?? 0.95,
      maxDataPoints: config?.maxDataPoints ?? 1000,
    };
  }

  processInteraction(type: string, outcome: number, context?: Record<string, any>): void {
    this.learner.record(type, outcome, context);
  }

  evolve(): void {
    this.model.applyLearning();
  }

  getEvolutionDelta(): Partial<PersonalityTraits> {
    const pattern = this.learner.findPattern('chat');
    if (!pattern || pattern.length === 0) return {};
    const avg = pattern.reduce((a, b) => a + b, 0) / pattern.length;
    if (Math.abs(avg) < 0.01) return {};
    return { extraversion: avg * 0.05 };
  }

  getModel(): PersonalityModel {
    return this.model;
  }

  getLearner(): AdaptiveLearner {
    return this.learner;
  }

  toJSON(): object {
    return {
      config: { ...this.config },
      model: this.model.toJSON(),
      learner: { data: this.learner.getData() },
    };
  }

  static fromJSON(data: any): PersonalityEvolution {
    const evolution = new PersonalityEvolution({
      learningRate: data?.config?.learningRate !== undefined 
        ? Math.max(0, Math.min(1, data.config.learningRate)) 
        : 0.01,
      decayRate: data?.config?.decayRate !== undefined 
        ? Math.max(0, Math.min(1, data.config.decayRate)) 
        : 0.95,
      maxDataPoints: data?.config?.maxDataPoints !== undefined 
        ? Math.max(1, data.config.maxDataPoints) 
        : 1000,
    });
    if (data?.model) {
      evolution.model = PersonalityModel.fromJSON(data.model);
    }
    if (data?.learner?.data) {
      for (const record of data.learner.data) {
        evolution.learner.record(record.interactionType, record.outcome, record.context || {});
      }
    }
    return evolution;
  }
}