import { Condition, TriggerRule } from '../../types/scene';

export function evaluateCondition(condition: Condition, context: {
  lastActiveDays: number;
  messageCount: number;
  currentHour: number;
  currentEmotion?: string;
  emotionIntensity?: number;
}): boolean {
  switch (condition.type) {
    case 'daysInactive':
      return condition.params.days >= condition.threshold;
    case 'messagesCount':
      return condition.params.count >= condition.threshold;
    case 'timeOfDay':
      return condition.params.hour === condition.threshold;
    case 'emotionThreshold':
      if (condition.params.emotion !== context.currentEmotion) return false;
      return condition.params.direction === 'above'
        ? (context.emotionIntensity || 0) >= condition.threshold
        : (context.emotionIntensity || 0) <= condition.threshold;
    default:
      return false;
  }
}

export function evaluateRule(rule: TriggerRule, context: {
  lastActiveDays: number;
  messageCount: number;
  currentHour: number;
  currentEmotion?: string;
  emotionIntensity?: number;
}): boolean {
  if (!rule.enabled) return false;

  // Check cooldown
  if (rule.lastTriggered) {
    const elapsed = Date.now() - rule.lastTriggered;
    if (elapsed < rule.cooldownMinutes * 60 * 1000) return false;
  }

  const results = rule.conditions.map(c => evaluateCondition(c, context));
  if (rule.logic === 'AND') return results.every(Boolean);
  if (rule.logic === 'OR') return results.some(Boolean);
  return false;
}
