/**
 * Behavior Engine
 * generic-agent-design Behavior Engine - Define + Trigger + Compose + Evaluate
 */

export interface Behavior {
  id: string;
  name: string;
  trigger: string;
  action: string;
  priority: number;
}

export interface BehaviorHistory {
  behavior: string;
  timestamp: number;
}

export interface ComposedBehavior {
  id: string;
  behaviors: string[];
  action: string;
  priority: number;
}

export class BehaviorEngine {
  private behaviors: Map<string, Behavior> = new Map();
  private history: BehaviorHistory[] = [];

  registerBehavior(behavior: Behavior): void {
    this.behaviors.set(behavior.id, { ...behavior });
  }

  trigger(triggerName: string): Behavior[] {
    const matching = Array.from(this.behaviors.values())
      .filter(b => b.trigger === triggerName)
      .sort((a, b) => b.priority - a.priority);

    for (const b of matching) {
      this.history.push({ behavior: b.id, timestamp: Date.now() });
    }
    return matching;
  }

  compose(behaviorIds: string[]): ComposedBehavior | null {
    const behaviors = behaviorIds
      .map(id => this.behaviors.get(id))
      .filter((b): b is Behavior => b !== undefined);

    if (behaviors.length === 0) return null;

    const totalPriority = behaviors.reduce((sum, b) => sum + b.priority, 0);
    const avgPriority = Math.round(totalPriority / behaviors.length);
    const actions = behaviors.map(b => b.action).join('|');

    return {
      id: `composed-${Date.now()}`,
      behaviors: behaviorIds,
      action: actions,
      priority: avgPriority,
    };
  }

  getHistory(): BehaviorHistory[] {
    return [...this.history];
  }

  getBehavior(id: string): Behavior | undefined {
    return this.behaviors.get(id);
  }

  getAllBehaviors(): Behavior[] {
    return Array.from(this.behaviors.values());
  }

  removeBehavior(id: string): boolean {
    return this.behaviors.delete(id);
  }

  hasBehavior(id: string): boolean {
    return this.behaviors.has(id);
  }

  getCount(): number {
    return this.behaviors.size;
  }

  getBehaviorsByTrigger(trigger: string): Behavior[] {
    return Array.from(this.behaviors.values()).filter(b => b.trigger === trigger);
  }

  getBehaviorsByPriority(min: number, max: number): Behavior[] {
    return Array.from(this.behaviors.values()).filter(b => b.priority >= min && b.priority <= max);
  }

  getHighestPriority(trigger: string): Behavior | null {
    const matching = this.getBehaviorsByTrigger(trigger);
    if (matching.length === 0) return null;
    return matching.reduce((max, b) => b.priority > max.priority ? b : max);
  }

  updatePriority(id: string, priority: number): boolean {
    const b = this.behaviors.get(id);
    if (!b) return false;
    b.priority = Math.max(0, priority);
    return true;
  }

  getAllTriggers(): string[] {
    return [...new Set(Array.from(this.behaviors.values()).map(b => b.trigger))];
  }

  getTriggerCount(): number {
    return this.getAllTriggers().length;
  }

  clearHistory(): void {
    this.history = [];
  }

  getHistoryCount(): number {
    return this.history.length;
  }

  getHistoryByBehavior(behaviorId: string): BehaviorHistory[] {
    return this.history.filter(h => h.behavior === behaviorId);
  }

  getMostTriggered(): string | null {
    if (this.history.length === 0) return null;
    const counts = new Map<string, number>();
    for (const h of this.history) {
      counts.set(h.behavior, (counts.get(h.behavior) ?? 0) + 1);
    }
    let max = 0;
    let result: string | null = null;
    for (const [id, count] of counts.entries()) {
      if (count > max) {
        max = count;
        result = id;
      }
    }
    return result;
  }

  clearAll(): void {
    this.behaviors.clear();
    this.history = [];
  }
}

export default BehaviorEngine;