/**
 * V138: PatternExtractor — extracts pattern signatures from memory values
 */
export type PatternType = 'frequency' | 'sequential' | 'emotional' | 'preference';

export interface SkillPattern {
  skillId: string;
  patternType: PatternType;
  extractedAt: string;
  sample: unknown;
  compressionRatio: number;
  originalSizeBytes: number;
}

function extractFrequencyPattern(values: unknown[]): SkillPattern | null {
  if (!values.length) return null;
  const freq: Record<string, number> = {};
  for (const v of values) {
    const k = String(v);
    freq[k] = (freq[k] || 0) + 1;
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 3);
  return {
    skillId: 'auto',
    patternType: 'frequency',
    extractedAt: new Date().toISOString(),
    sample: top,
    compressionRatio: 0.75,
    originalSizeBytes: JSON.stringify(values).length,
  };
}

function extractSequentialPattern(values: unknown[]): SkillPattern | null {
  if (values.length < 2) return null;
  return {
    skillId: 'auto',
    patternType: 'sequential',
    extractedAt: new Date().toISOString(),
    sample: `[${values.length} steps, first=${JSON.stringify(values[0])}, last=${JSON.stringify(values[values.length-1])}]`,
    compressionRatio: 0.70,
    originalSizeBytes: JSON.stringify(values).length,
  };
}

export function extractPattern(
  skillId: string,
  patternType: PatternType,
  values: unknown[]
): SkillPattern | null {
  switch (patternType) {
    case 'frequency': return extractFrequencyPattern(values);
    case 'sequential': return extractSequentialPattern(values);
    case 'emotional':
    case 'preference':
    default:
      return {
        skillId,
        patternType,
        extractedAt: new Date().toISOString(),
        sample: values.slice(0, 1),
        compressionRatio: 0.65,
        originalSizeBytes: JSON.stringify(values).length,
      };
  }
}