/**
 * V138: MemoryCompressor — L0 capacity monitoring + value-based eviction + compression pipeline
 */
import { extractPattern, type SkillPattern } from './PatternExtractor';

export interface MemoryValue {
  key: string;
  value: unknown;
  accessCount: number;
  lastAccessed: string;
  importance: number;
  canEvict: boolean;
}

const EMOTIONAL_KEYWORDS = ['happy', 'sad', 'angry', 'fear', 'joy', 'frustrated', 'excited', 'anxious'];
const L0_CAPACITY_BYTES = 512 * 1024 * 1024; // 512 MB
const EVICTION_THRESHOLD = 0.2;
const PATTERN_THRESHOLD = 0.6;

function recencyScore(lastAccessed: string): number {
  const days = (Date.now() - new Date(lastAccessed).getTime()) / 86400000;
  return 1 / (1 + days);
}

function emotionalValence(value: unknown): number {
  const str = JSON.stringify(value);
  return EMOTIONAL_KEYWORDS.some(k => str.includes(k)) ? 0.7 : 0.3;
}

export function computeImportance(accessCount: number, lastAccessed: string, value: unknown): number {
  return (
    Math.log(1 + accessCount) * 0.4 +
    recencyScore(lastAccessed) * 0.3 +
    emotionalValence(value) * 0.3
  );
}

export function rankAndTag(entries: Array<{ key: string; value: unknown; accessCount: number; lastAccessed: string }>): MemoryValue[] {
  return entries.map(e => {
    const importance = computeImportance(e.accessCount, e.lastAccessed, e.value);
    return {
      key: e.key,
      value: e.value,
      accessCount: e.accessCount,
      lastAccessed: e.lastAccessed,
      importance,
      canEvict: importance < EVICTION_THRESHOLD,
    };
  }).sort((a, b) => a.importance - b.importance);
}

export function selectForPatternCompression(ranked: MemoryValue[]): MemoryValue[] {
  return ranked.filter(v => v.importance >= EVICTION_THRESHOLD && v.importance < PATTERN_THRESHOLD);
}

export function selectForEviction(ranked: MemoryValue[]): MemoryValue[] {
  return ranked.filter(v => v.canEvict);
}

export function compressWithPattern(value: MemoryValue, patternType: 'frequency' | 'sequential' = 'frequency'): SkillPattern {
  const originalSize = JSON.stringify(value.value).length;
  const pattern = extractPattern(value.key, patternType, Array.isArray(value.value) ? value.value : [value.value]);
  return pattern || {
    skillId: value.key,
    patternType: 'frequency',
    extractedAt: new Date().toISOString(),
    sample: value.value,
    compressionRatio: 0.5,
    originalSizeBytes: originalSize,
  };
}

export function checkCompressionNeeded(currentBytes: number, threshold = 0.8): boolean {
  return currentBytes >= L0_CAPACITY_BYTES * threshold;
}

export function estimateSavings(mb: MemoryValue[]): { evict: number; pattern: number; total: number } {
  let evict = 0, pattern = 0;
  for (const v of mb) {
    const size = JSON.stringify(v.value).length;
    if (v.canEvict) evict += size;
    else pattern += size * 0.7;
  }
  return { evict, pattern, total: evict + pattern };
}