export interface PersonalityTraits {
  openness: number;        // 0-1
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PersonalityState {
  traits: PersonalityTraits;
  mood: 'happy' | 'neutral' | 'sad' | 'excited';
  energy: number;  // 0-100
  lastUpdated: number;
}

interface LearningRecord {
  interactionType: string;
  feedback: number;
  timestamp: number;
}

export class PersonalityModel {
  private state: PersonalityState;
  private learningData: LearningRecord[] = [];

  constructor(initialTraits?: Partial<PersonalityTraits>) {
    this.state = {
      traits: {
        openness: initialTraits?.openness ?? 0.5,
        conscientiousness: initialTraits?.conscientiousness ?? 0.5,
        extraversion: initialTraits?.extraversion ?? 0.5,
        agreeableness: initialTraits?.agreeableness ?? 0.5,
        neuroticism: initialTraits?.neuroticism ?? 0.5,
      },
      mood: 'neutral',
      energy: 50,
      lastUpdated: Date.now(),
    };
  }

  getState(): PersonalityState {
    return { ...this.state };
  }

  getTraits(): PersonalityTraits {
    return { ...this.state.traits };
  }

  getMood(): PersonalityState['mood'] {
    return this.state.mood;
  }

  getEnergy(): number {
    return this.state.energy;
  }

  updateTraits(delta: Partial<PersonalityTraits>): void {
    const traits = this.state.traits;
    if (delta.openness !== undefined) {
      traits.openness = Math.max(0, Math.min(1, delta.openness));
    }
    if (delta.conscientiousness !== undefined) {
      traits.conscientiousness = Math.max(0, Math.min(1, delta.conscientiousness));
    }
    if (delta.extraversion !== undefined) {
      traits.extraversion = Math.max(0, Math.min(1, delta.extraversion));
    }
    if (delta.agreeableness !== undefined) {
      traits.agreeableness = Math.max(0, Math.min(1, delta.agreeableness));
    }
    if (delta.neuroticism !== undefined) {
      traits.neuroticism = Math.max(0, Math.min(1, delta.neuroticism));
    }
    this.state.lastUpdated = Date.now();
  }

  updateMood(mood: PersonalityState['mood']): void {
    this.state.mood = mood;
    this.state.lastUpdated = Date.now();
  }

  adjustEnergy(delta: number): void {
    // Calculate new energy, clamping at each step
    let newEnergy = this.state.energy + delta;
    newEnergy = Math.max(0, Math.min(100, newEnergy));
    this.state.energy = newEnergy;
    this.state.lastUpdated = Date.now();
  }

  learnFromInteraction(type: string, feedback: number): void {
    this.learningData.push({
      interactionType: type,
      feedback,
      timestamp: Date.now(),
    });
    this.state.lastUpdated = Date.now();
  }

  applyLearning(): void {
    if (this.learningData.length === 0) return;

    const groupedData = new Map<string, number[]>();
    for (const record of this.learningData) {
      if (!groupedData.has(record.interactionType)) {
        groupedData.set(record.interactionType, []);
      }
      groupedData.get(record.interactionType)!.push(record.feedback);
    }

    for (const [type, feedbacks] of groupedData) {
      const avgFeedback = feedbacks.reduce((a, b) => a + b, 0) / feedbacks.length;
      const adjustment = avgFeedback * 0.1;

      if (type === 'chat' || type === 'social') {
        this.state.traits.extraversion = Math.max(0, Math.min(1, 
          this.state.traits.extraversion + adjustment * 0.5));
      } else if (type === 'creative') {
        this.state.traits.openness = Math.max(0, Math.min(1, 
          this.state.traits.openness + adjustment * 0.5));
      } else if (type === 'learning') {
        this.state.traits.conscientiousness = Math.max(0, Math.min(1, 
          this.state.traits.conscientiousness + adjustment * 0.5));
      }
    }

    this.learningData = [];
    this.state.lastUpdated = Date.now();
  }

  toJSON(): object {
    return {
      traits: { ...this.state.traits },
      mood: this.state.mood,
      energy: this.state.energy,
      lastUpdated: this.state.lastUpdated,
    };
  }

  static fromJSON(data: any): PersonalityModel {
    const model = new PersonalityModel();
    if (data?.traits) {
      model.updateTraits({
        openness: Math.max(0, Math.min(1, data.traits.openness ?? 0.5)),
        conscientiousness: Math.max(0, Math.min(1, data.traits.conscientiousness ?? 0.5)),
        extraversion: Math.max(0, Math.min(1, data.traits.extraversion ?? 0.5)),
        agreeableness: Math.max(0, Math.min(1, data.traits.agreeableness ?? 0.5)),
        neuroticism: Math.max(0, Math.min(1, data.traits.neuroticism ?? 0.5)),
      });
    }
    if (data?.mood) {
      model.updateMood(data.mood);
    }
    if (data?.energy !== undefined) {
      // Set energy directly, not via adjustEnergy, to preserve exact value
      model.state.energy = Math.max(0, Math.min(100, data.energy));
    }
    if (data?.lastUpdated !== undefined) {
      model.state.lastUpdated = data.lastUpdated;
    }
    return model;
  }
}
