/**
 * Emotion Detector - Analyzes speech characteristics to infer emotional state
 * 
 * Uses speaking rate (chars/sec) as the primary emotion proxy:
 * - Fast rate + high volume = excited
 * - Fast rate + high pitch = tense  
 * - Slow rate + low volume = low_energy
 * - Steady rate = calm
 */

export type EmotionState = 'excited' | 'calm' | 'tense' | 'low_energy' | 'unknown';

export interface EmotionResult {
  emotion: EmotionState;
  confidence: number;        // 0-1
  speechRate: number;         // chars per second
  label: string;              // e.g. "😊 兴奋"
  context: string;             // for system prompt injection
}

// Internal tracking
let recentSegments: Array<{ text: string; durationMs: number; timestamp: number }> = [];

const EMOTION_THRESHOLDS = {
  SPEECH_RATE_FAST: 5.0,      // chars/sec
  SPEESS_RATE_SLOW: 2.0,      // chars/sec
  CONFIDENCE_HIGH: 0.8,
  CONFIDENCE_MEDIUM: 0.5,
};

/**
 * Add a speech segment for analysis
 */
export function addSpeechSegment(text: string, durationMs: number): void {
  const now = Date.now();
  recentSegments.push({ text, durationMs, timestamp: now });
  // Keep only last 10 segments
  if (recentSegments.length > 10) {
    recentSegments = recentSegments.slice(-10);
  }
}

/**
 * Detect emotion from speech characteristics
 */
export function detectEmotion(text: string, durationMs: number): EmotionResult {
  // Clear old segments (older than 30 seconds)
  const now = Date.now();
  recentSegments = recentSegments.filter(s => now - s.timestamp < 30000);

  const speechRate = durationMs > 0 ? (text.length / (durationMs / 1000)) : 0;

  let emotion: EmotionState = 'unknown';
  let confidence = 0.5;

  if (speechRate >= EMOTION_THRESHOLDS.SPEECH_RATE_FAST) {
    // Fast speech = excited or tense
    // Check for exclamation marks or question marks (excitement vs anxiety)
    const hasExclamation = /[!！]/.test(text);
    const hasQuestion = /[?？]/.test(text);
    
    if (hasExclamation || text.length > 50) {
      emotion = 'excited';
      confidence = EMOTION_THRESHOLDS.CONFIDENCE_HIGH;
    } else if (hasQuestion || /[A-Z]/.test(text)) {
      emotion = 'tense';
      confidence = EMOTION_THRESHOLDS.CONFIDENCE_MEDIUM;
    } else {
      emotion = 'excited';
      confidence = EMOTION_THRESHOLDS.CONFIDENCE_MEDIUM;
    }
  } else if (speechRate <= EMOTION_THRESHOLDS.SPEESS_RATE_SLOW) {
    emotion = 'low_energy';
    confidence = text.length < 10 ? EMOTION_THRESHOLDS.CONFIDENCE_MEDIUM : EMOTION_THRESHOLDS.CONFIDENCE_HIGH;
  } else {
    emotion = 'calm';
    confidence = EMOTION_THRESHOLDS.CONFIDENCE_HIGH;
  }

  return {
    emotion,
    confidence,
    speechRate: Math.round(speechRate * 10) / 10,
    label: getEmotionLabel(emotion),
    context: formatEmotionContext(emotion),
  };
}

/**
 * Get emoji + text label for emotion
 */
export function getEmotionLabel(emotion: EmotionState): string {
  const labels: Record<EmotionState, string> = {
    excited: '😊 兴奋',
    calm: '😌 平静',
    tense: '😰 紧张',
    low_energy: '😔 低落',
    unknown: '😐 未知',
  };
  return labels[emotion] || labels.unknown;
}

/**
 * Format emotion context string for system prompt injection
 */
export function formatEmotionContext(emotion: EmotionState): string {
  if (emotion === 'unknown') return '';
  const contextMap: Record<EmotionState, string> = {
    excited: 'user seems excited and energetic',
    calm: 'user seems calm and relaxed',
    tense: 'user seems anxious or nervous',
    low_energy: 'user seems tired or low in energy',
    unknown: '',
  };
  return `[Emotional Context: ${contextMap[emotion]}]`;
}

/**
 * Clear emotion history
 */
export function clearEmotionHistory(): void {
  recentSegments = [];
}
