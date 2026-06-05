/**
 * Pattern Detector
 * generic-agent-design Pattern Detector - Define + Match + Learn + Evaluate
 */

export interface Pattern {
  id: string;
  name: string;
  regex: string;
  confidence: number;
  occurrences: number;
}

export interface PatternMatch {
  pattern: string;
  text: string;
  confidence: number;
  position: number;
}

export class PatternDetector {
  private patterns: Map<string, Pattern> = new Map();
  private training: Map<string, string[]> = new Map();
  private counter = 0;

  registerPattern(pattern: Pattern): boolean {
    try {
      new RegExp(pattern.regex);
      this.patterns.set(pattern.id, { ...pattern });
      return true;
    } catch {
      return false;
    }
  }

  detect(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    for (const pattern of this.patterns.values()) {
      try {
        const re = new RegExp(pattern.regex, 'g');
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          matches.push({
            pattern: pattern.id,
            text: m[0],
            confidence: pattern.confidence,
            position: m.index,
          });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } catch {
        // skip invalid regex
      }
    }
    return matches;
  }

  learn(text: string, label: string): void {
    if (!this.training.has(label)) this.training.set(label, []);
    this.training.get(label)!.push(text);
  }

  evaluate(patternId: string): number {
    return this.patterns.get(patternId)?.confidence ?? 0;
  }

  getPattern(id: string): Pattern | undefined {
    return this.patterns.get(id);
  }

  getAllPatterns(): Pattern[] {
    return Array.from(this.patterns.values());
  }

  removePattern(id: string): boolean {
    return this.patterns.delete(id);
  }

  hasPattern(id: string): boolean {
    return this.patterns.has(id);
  }

  getCount(): number {
    return this.patterns.size;
  }

  incrementOccurrence(id: string): boolean {
    const pattern = this.patterns.get(id);
    if (!pattern) return false;
    pattern.occurrences++;
    return true;
  }

  getOccurrences(id: string): number {
    return this.patterns.get(id)?.occurrences ?? 0;
  }

  setConfidence(id: string, confidence: number): boolean {
    const pattern = this.patterns.get(id);
    if (!pattern) return false;
    pattern.confidence = Math.max(0, Math.min(1, confidence));
    return true;
  }

  getByMinConfidence(min: number): Pattern[] {
    return Array.from(this.patterns.values()).filter(p => p.confidence >= min);
  }

  getBestPattern(): Pattern | null {
    const all = Array.from(this.patterns.values());
    if (all.length === 0) return null;
    return all.reduce((best, p) => p.confidence > best.confidence ? p : best);
  }

  getTrainingCount(label: string): number {
    return this.training.get(label)?.length ?? 0;
  }

  getAllLabels(): string[] {
    return [...this.training.keys()];
  }

  getLabelCount(): number {
    return this.training.size;
  }

  getTrainingData(label: string): string[] {
    return [...(this.training.get(label) ?? [])];
  }

  hasLabel(label: string): boolean {
    return this.training.has(label);
  }

  removeTraining(label: string): boolean {
    return this.training.delete(label);
  }

  clearTraining(): void {
    this.training.clear();
  }

  clearAll(): void {
    this.patterns.clear();
    this.training.clear();
    this.counter = 0;
  }

  static generateId(name: string): string {
    return `p-${name.toLowerCase().replace(/\s+/g, '-')}`;
  }
}

export default PatternDetector;