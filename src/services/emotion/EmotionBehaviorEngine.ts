/**
 * EmotionBehaviorEngine - V70 语音情感→行为联动引擎 + V145 Hook System
 * 
 * Provides emotion-to-action mapping with cooldown logic.
 * Decoupled from AgentExecutor/PlatformAdapter - only provides interfaces.
 * 
 * V145: Added lifecycle hooks for emotion detection, action triggering, and cooldown events.
 */

import { EMOTION_BEHAVIOR_MAP, type EmotionAction, type EmotionActionType } from './emotionBehaviorMap'
import type { EmotionState } from '../voice/emotionDetector';
import { emotionMemoryStore } from './EmotionMemoryStore';

// ============================================
// V145: Emotion Hooks Interface
// ============================================

export interface EmotionContext {
  trigger: string;
  sessionId: string;
  timestamp: number;
}

export interface ActionResult {
  action: EmotionActionType;
  emotion: EmotionState;
  confidence: number;
}

export interface EmotionHooks {
  onEmotionDetected?: (emotion: EmotionState, context: EmotionContext) => void;
  onActionTriggered?: (action: ActionResult, emotion: EmotionState) => void;
  onCooldownStart?: (emotionType: string, remainingMs: number) => void;
  onCooldownEnd?: (emotionType: string) => void;
}

class EmotionBehaviorEngine {
  private lastEmotion: string | null = null
  private lastTriggerTime = 0
  private cooldownMs = 30000

  // V145: Hooks
  private hooks: EmotionHooks = {};
  private cooldownTimer: ReturnType<typeof setTimeout> | null = null;

  // V145: Session ID for cross-session tracking
  private sessionId: string;

  constructor() {
    // V145: Generate or retrieve session ID
    this.sessionId = emotionMemoryStore.getSessionId();
  }

  // ============================================
  // V145: Hook Registration
  // ============================================

  /**
   * Register emotion lifecycle hooks
   */
  registerHooks(hooks: EmotionHooks): void {
    this.hooks = hooks;
  }

  /**
   * Unregister all hooks
   */
  unregisterHooks(): void {
    this.hooks = {};
  }

  // ============================================
  // V145: Hook Invocation Helpers
  // ============================================

  private emitEmotionDetected(emotion: EmotionState, context: EmotionContext): void {
    if (this.hooks.onEmotionDetected) {
      try {
        this.hooks.onEmotionDetected(emotion, context);
      } catch (err) {
        console.error('[EmotionBehaviorEngine] onEmotionDetected hook error:', err);
      }
    }
  }

  private emitActionTriggered(action: ActionResult, emotion: EmotionState): void {
    if (this.hooks.onActionTriggered) {
      try {
        this.hooks.onActionTriggered(action, emotion);
      } catch (err) {
        console.error('[EmotionBehaviorEngine] onActionTriggered hook error:', err);
      }
    }
  }

  private emitCooldownStart(emotionType: string, remainingMs: number): void {
    if (this.hooks.onCooldownStart) {
      try {
        this.hooks.onCooldownStart(emotionType, remainingMs);
      } catch (err) {
        console.error('[EmotionBehaviorEngine] onCooldownStart hook error:', err);
      }
    }
  }

  private emitCooldownEnd(emotionType: string): void {
    if (this.hooks.onCooldownEnd) {
      try {
        this.hooks.onCooldownEnd(emotionType);
      } catch (err) {
        console.error('[EmotionBehaviorEngine] onCooldownEnd hook error:', err);
      }
    }
  }

  // ============================================
  // V145: detectEmotion (enhanced with hooks + memory)
  // ============================================

  /**
   * Detect emotion and trigger recommended action
   * V145: Now calls hooks and saves to EmotionMemoryStore
   */
  detectEmotion(emotion: string, confidence: number, trigger = ''): { emotion: string; action: EmotionAction | null } {
    // Create context for hooks
    const context: EmotionContext = {
      trigger,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    // Emit hook for emotion detection
    this.emitEmotionDetected(emotion as EmotionState, context);

    // Check cooldown
    const wasInCooldown = this.isInCooldown();
    const remainingMs = this.getCooldownRemaining();

    if (wasInCooldown) {
      return { emotion, action: null };
    }

    // Find recommended action from behavior map
    const action = EMOTION_BEHAVIOR_MAP.find(
      m => m.emotion === emotion && confidence >= m.confidenceThreshold
    );

    if (action && action.action !== 'none') {
      this.lastEmotion = emotion;
      this.lastTriggerTime = Date.now();

      // V145: Save to cross-session memory store
      emotionMemoryStore.saveEmotionFull(
        emotion,
        Math.round(confidence * 100),
        trigger || action.action
      ).catch(err => {
        console.error('[EmotionBehaviorEngine] Failed to save emotion:', err);
      });

      // V145: Emit action triggered hook
      this.emitActionTriggered(
        { action: action.action, emotion: emotion as EmotionState, confidence },
        emotion as EmotionState
      );

      // V145: Start cooldown timer for cooldown end hook
      this.startCooldownTimer(emotion);

      return { emotion, action };
    }

    return { emotion, action: null };
  }

  // ============================================
  // V145: Cooldown Timer with Hooks
  // ============================================

  private startCooldownTimer(emotionType: string): void {
    // Clear any existing timer
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
    }

    // Emit cooldown start
    this.emitCooldownStart(emotionType, this.cooldownMs);

    // Set timer for cooldown end
    this.cooldownTimer = setTimeout(() => {
      this.emitCooldownEnd(emotionType);
      this.cooldownTimer = null;
    }, this.cooldownMs);
  }

  // ============================================
  // V145: triggerAction (enhanced with hooks)
  // ============================================

  /**
   * Trigger an action for an emotion
   * V145: Calls action triggered hook
   */
  triggerAction(emotion: string, confidence: number): EmotionAction | null {
    if (this.isInCooldown()) {
      return null;
    }

    const action = EMOTION_BEHAVIOR_MAP.find(
      m => m.emotion === emotion && confidence >= m.confidenceThreshold
    );

    if (action && action.action !== 'none') {
      this.lastEmotion = emotion;
      this.lastTriggerTime = Date.now();

      // Emit action triggered hook
      this.emitActionTriggered(
        { action: action.action, emotion: emotion as EmotionState, confidence },
        emotion as EmotionState
      );

      // Start cooldown timer
      this.startCooldownTimer(emotion);

      return action;
    }

    return null;
  }

  // ============================================
  // Original Engine Methods (unchanged)
  // ============================================

  /**
   * Get recommended action for an emotion with confidence score
   */
  getRecommendedAction(emotion: string, confidence: number): EmotionAction | null {
    if (this.isInCooldown()) return null
    
    const action = EMOTION_BEHAVIOR_MAP.find(
      m => m.emotion === emotion && confidence >= m.confidenceThreshold
    )
    
    if (action && action.action !== 'none') {
      this.lastEmotion = emotion
      this.lastTriggerTime = Date.now()
      return action
    }
    return null
  }

  /**
   * Check if engine is in cooldown period
   */
  private isInCooldown(): boolean {
    return Date.now() - this.lastTriggerTime < this.cooldownMs
  }

  /**
   * Set cooldown duration in milliseconds
   */
  setCooldown(ms: number): void {
    this.cooldownMs = ms
  }

  /**
   * Get last triggered emotion
   */
  getLastEmotion(): string | null {
    return this.lastEmotion
  }

  /**
   * Reset engine state
   */
  reset(): void {
    this.lastEmotion = null
    this.lastTriggerTime = 0
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  /**
   * Get remaining cooldown time in milliseconds
   */
  getCooldownRemaining(): number {
    const elapsed = Date.now() - this.lastTriggerTime;
    return Math.max(0, this.cooldownMs - elapsed);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

export const emotionBehaviorEngine = new EmotionBehaviorEngine()