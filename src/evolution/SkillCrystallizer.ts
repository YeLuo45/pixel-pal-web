/**
 * V178: SkillCrystallizer - Self-Crystallization Engine
 * 
 * Converts high-frequency memory patterns into reusable skill fragments.
 * Based on generic-agent Self-Evolution architecture with fragment management.
 */

import { hookManager } from '../core/hooks/HookManager';

/**
 * SkillFragment represents a crystallized skill unit from memory
 */
export interface SkillFragment {
  id: string;
  name: string;
  description: string;
  trigger: string[];        // Trigger keywords
  action: string;           // Execution action
  confidence: number;        // 0-100 confidence score
  usage_count: number;      // Number of times used
  last_used: number | null; // Last used timestamp
  crystallized_from: string; // Source memory ID
  created_at: number;
}

/**
 * Configuration for SkillCrystallizer
 */
export interface SkillCrystallizerConfig {
  /** Minimum access count to allow crystallization */
  minAccessCount: number;
  /** Minimum confidence threshold for fragments */
  minConfidence: number;
  /** Maximum fragments to store */
  maxFragments: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SkillCrystallizerConfig = {
  minAccessCount: 5,
  minConfidence: 50,
  maxFragments: 100,
};

/**
 * Trigger keywords for pattern extraction
 */
const TRIGGER_PATTERNS = [
  'when', 'if', 'ask', 'request', 'show', 'tell', 'give', 'find',
  'how', 'what', 'why', 'where', 'can you', 'please', 'help',
];

/**
 * Action templates for fragment generation
 */
const ACTION_TEMPLATES = [
  'Provide {topic} information',
  'Execute {action} command',
  'Display {resource} details',
  'Analyze {subject} patterns',
  'Generate {output} report',
];

/**
 * SkillCrystallizer manages skill fragment lifecycle
 */
export class SkillCrystallizer {
  private fragments: Map<string, SkillFragment> = new Map();
  private config: SkillCrystallizerConfig;

  constructor(config: Partial<SkillCrystallizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if memory can be crystallized based on access count
   */
  canCrystallize(memoryId: string, accessCount: number): boolean {
    return accessCount >= this.config.minAccessCount;
  }

  /**
   * Crystallize memory content into a skill fragment
   */
  crystallize(memoryId: string, content: string, accessCount?: number): SkillFragment | null {
    // Use provided accessCount or default to threshold
    const count = accessCount ?? this.config.minAccessCount;
    
    if (!this.canCrystallize(memoryId, count)) {
      return null;
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    
    // Extract triggers from content
    const triggers = this.extractTriggers(content);
    
    // Calculate initial confidence based on content analysis
    const confidence = this.calculateConfidence(content, triggers);
    
    // Generate name from content
    const name = this.generateName(content);
    
    // Generate description
    const description = this.generateDescription(content);
    
    // Generate action
    const action = this.generateAction(content);
    
    const fragment: SkillFragment = {
      id,
      name,
      description,
      trigger: triggers,
      action,
      confidence,
      usage_count: 0,
      last_used: null,
      crystallized_from: memoryId,
      created_at: now,
    };

    this.fragments.set(id, fragment);
    
    // Trigger hook for monitoring
    hookManager.trigger('onSkillFragmentCrystallized', {
      data: fragment,
    }).catch(console.error);
    
    return fragment;
  }

  /**
   * Get all skill fragments
   */
  getAllFragments(): SkillFragment[] {
    return Array.from(this.fragments.values());
  }

  /**
   * Get a specific fragment by ID
   */
  getFragment(id: string): SkillFragment | null {
    return this.fragments.get(id) ?? null;
  }

  /**
   * Use a skill fragment, returns action string
   */
  useFragment(id: string): string | null {
    const fragment = this.fragments.get(id);
    if (!fragment) {
      return null;
    }

    // Update usage statistics
    fragment.usage_count++;
    fragment.last_used = Date.now();
    
    // Update confidence based on usage
    this.updateConfidence(id, 1);

    return fragment.action;
  }

  /**
   * Update fragment confidence score
   */
  updateConfidence(id: string, delta: number): void {
    const fragment = this.fragments.get(id);
    if (!fragment) return;

    // Adjust confidence within bounds
    fragment.confidence = Math.max(0, Math.min(100, fragment.confidence + delta));
  }

  /**
   * Fuse multiple fragments into one enhanced fragment
   */
  fuse(fragmentIds: string[]): SkillFragment | null {
    if (fragmentIds.length < 2) {
      return null;
    }

    // Collect all fragments
    const fragments: SkillFragment[] = [];
    for (const id of fragmentIds) {
      const fragment = this.fragments.get(id);
      if (fragment) {
        fragments.push(fragment);
      }
    }

    if (fragments.length < 2) {
      return null;
    }

    // Merge triggers
    const allTriggers = new Set<string>();
    for (const frag of fragments) {
      for (const trigger of frag.trigger) {
        allTriggers.add(trigger);
      }
    }

    // Calculate average confidence
    const avgConfidence = fragments.reduce((sum, f) => sum + f.confidence, 0) / fragments.length;
    
    // Calculate total usage
    const totalUsage = fragments.reduce((sum, f) => sum + f.usage_count, 0);

    // Create fused fragment
    const fused: SkillFragment = {
      id: crypto.randomUUID(),
      name: `Fused: ${fragments[0].name}`,
      description: `Combined from ${fragments.length} fragments`,
      trigger: Array.from(allTriggers),
      action: fragments.map(f => f.action).join(' | '),
      confidence: Math.round(avgConfidence),
      usage_count: totalUsage,
      last_used: Date.now(),
      crystallized_from: fragments.map(f => f.crystallized_from).join(','),
      created_at: Date.now(),
    };

    this.fragments.set(fused.id, fused);
    
    // Trigger hook
    hookManager.trigger('onSkillFragmentFused', {
      data: fused,
      fragments: fragments.length,
    }).catch(console.error);
    
    return fused;
  }

  /**
   * Delete a fragment
   */
  deleteFragment(id: string): boolean {
    return this.fragments.delete(id);
  }

  /**
   * Find fragments by trigger keyword
   */
  findByTrigger(trigger: string): SkillFragment[] {
    const normalizedTrigger = trigger.toLowerCase();
    return this.getAllFragments().filter(frag =>
      frag.trigger.some(t => t.toLowerCase().includes(normalizedTrigger))
    );
  }

  /**
   * Get fragment statistics
   */
  getStats(): {
    total: number;
    avgConfidence: number;
    totalUsage: number;
    highConfidence: number;
  } {
    const fragments = this.getAllFragments();
    if (fragments.length === 0) {
      return { total: 0, avgConfidence: 0, totalUsage: 0, highConfidence: 0 };
    }

    const totalConfidence = fragments.reduce((sum, f) => sum + f.confidence, 0);
    const totalUsage = fragments.reduce((sum, f) => sum + f.usage_count, 0);
    const highConfidence = fragments.filter(f => f.confidence >= 80).length;

    return {
      total: fragments.length,
      avgConfidence: Math.round(totalConfidence / fragments.length),
      totalUsage,
      highConfidence,
    };
  }

  /**
   * Extract trigger keywords from content
   */
  private extractTriggers(content: string): string[] {
    const triggers: string[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const pattern of TRIGGER_PATTERNS) {
      if (lowerContent.includes(pattern)) {
        triggers.push(pattern);
      }
    }
    
    // Extract quoted phrases as high-priority triggers
    const quotedPhrases = content.match(/"([^"]+)"/g);
    if (quotedPhrases) {
      for (const phrase of quotedPhrases) {
        const clean = phrase.replace(/"/g, '').trim();
        if (clean.length > 2 && clean.length < 30) {
          triggers.push(clean);
        }
      }
    }
    
    // Remove duplicates
    return [...new Set(triggers)];
  }

  /**
   * Calculate confidence based on content and triggers
   */
  private calculateConfidence(content: string, triggers: string[]): number {
    let score = 50; // Base score
    
    // More triggers = higher confidence
    score += Math.min(triggers.length * 5, 25);
    
    // Longer content tends to be more specific
    if (content.length > 100) score += 10;
    if (content.length > 500) score += 10;
    
    // Specific keywords increase confidence
    const specificTerms = ['always', 'never', 'exact', 'specific', 'precise'];
    for (const term of specificTerms) {
      if (content.toLowerCase().includes(term)) {
        score += 5;
      }
    }
    
    return Math.min(score, 95);
  }

  /**
   * Generate name from content
   */
  private generateName(content: string): string {
    // Take first meaningful words
    const words = content.split(/\s+/).slice(0, 4);
    const name = words.join(' ');
    return name.length > 40 ? name.substring(0, 40) + '...' : name;
  }

  /**
   * Generate description from content
   */
  private generateDescription(content: string): string {
    // Take a summary from the content
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim() || content;
    return firstSentence.length > 200 
      ? firstSentence.substring(0, 200) + '...' 
      : firstSentence;
  }

  /**
   * Generate action from content
   */
  private generateAction(content: string): string {
    // Pick an action template and fill in
    const template = ACTION_TEMPLATES[Math.floor(Math.random() * ACTION_TEMPLATES.length)];
    
    // Extract key terms from content
    const words = content.split(/\s+/).filter(w => w.length > 4);
    const topic = words[0] || 'general';
    const action = words[1] || 'execute';
    const resource = words[2] || 'information';
    
    return template
      .replace('{topic}', topic)
      .replace('{action}', action)
      .replace('{resource}', resource)
      .replace('{subject}', topic)
      .replace('{output}', topic);
  }
}

// Singleton instance
let skillCrystallizerInstance: SkillCrystallizer | null = null;

export function getSkillCrystallizer(config?: Partial<SkillCrystallizerConfig>): SkillCrystallizer {
  if (!skillCrystallizerInstance) {
    skillCrystallizerInstance = new SkillCrystallizer(config);
  }
  return skillCrystallizerInstance;
}

export default SkillCrystallizer;