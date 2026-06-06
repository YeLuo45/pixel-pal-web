/**
 * Habit Engine
 * generic-agent-design Habit Engine - Define + Complete + Break + Stats
 */

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  streak: number;
  completed: boolean;
  completions: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface HE2Stats {
  habits: number;
  totalCompletions: number;
  totalStreak: number;
  daily: number;
  weekly: number;
  monthly: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgStreak: number;
  maxStreak: number;
  minStreak: number;
  completionRate: number;
}

export class HabitEngine {
  private habits: Map<string, Habit> = new Map();
  private counter = 0;
  private totalCompletions = 0;
  private totalStreak = 0;

  define(name: string, frequency: Frequency = 'daily'): string {
    const id = `he2-${++this.counter}`;
    this.habits.set(id, {
      id,
      name,
      frequency,
      streak: 0,
      completed: false,
      completions: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  complete(id: string): boolean {
    const h = this.habits.get(id);
    if (!h) return false;
    if (!h.active) return false;
    h.streak++;
    h.completions++;
    h.completed = true;
    h.history.push(Date.now());
    h.updated = Date.now();
    h.hits++;
    this.totalCompletions++;
    this.totalStreak++;
    return true;
  }

  breakHabit(id: string): boolean {
    const h = this.habits.get(id);
    if (!h) return false;
    h.streak = 0;
    h.completed = false;
    h.updated = Date.now();
    h.hits++;
    return true;
  }

  reset(id: string): boolean {
    const h = this.habits.get(id);
    if (!h) return false;
    h.streak = 0;
    h.completions = 0;
    h.completed = false;
    h.history = [];
    h.updated = Date.now();
    return true;
  }

  getStats(): HE2Stats {
    const all = Array.from(this.habits.values());
    const streakValues = all.map(h => h.streak);
    const completed = all.filter(h => h.completed).length;
    return {
      habits: all.length,
      totalCompletions: this.totalCompletions,
      totalStreak: this.totalStreak,
      daily: all.filter(h => h.frequency === 'daily').length,
      weekly: all.filter(h => h.frequency === 'weekly').length,
      monthly: all.filter(h => h.frequency === 'monthly').length,
      active: all.filter(h => h.active).length,
      inactive: all.filter(h => !h.active).length,
      totalHits: all.reduce((s, h) => s + h.hits, 0),
      uniqueNames: new Set(all.map(h => h.name)).size,
      avgStreak: all.length > 0 ? Math.round((streakValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxStreak: streakValues.length > 0 ? Math.max(...streakValues) : 0,
      minStreak: streakValues.length > 0 ? Math.min(...streakValues) : 0,
      completionRate: all.length > 0 ? Math.round((completed / all.length) * 100) / 100 : 0,
    };
  }

  getHabit(id: string): Habit | undefined {
    return this.habits.get(id);
  }

  getAllHabits(): Habit[] {
    return Array.from(this.habits.values());
  }

  removeHabit(id: string): boolean {
    return this.habits.delete(id);
  }

  hasHabit(id: string): boolean {
    return this.habits.has(id);
  }

  getCount(): number {
    return this.habits.size;
  }

  getName(id: string): string | undefined {
    return this.habits.get(id)?.name;
  }

  getFrequency(id: string): Frequency | undefined {
    return this.habits.get(id)?.frequency;
  }

  getStreak(id: string): number {
    return this.habits.get(id)?.streak ?? 0;
  }

  getCompletions(id: string): number {
    return this.habits.get(id)?.completions ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.habits.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.habits.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.habits.get(id)?.active ?? false;
  }

  isCompleted(id: string): boolean {
    return this.habits.get(id)?.completed ?? false;
  }

  isDaily(id: string): boolean {
    return this.habits.get(id)?.frequency === 'daily';
  }

  isWeekly(id: string): boolean {
    return this.habits.get(id)?.frequency === 'weekly';
  }

  isMonthly(id: string): boolean {
    return this.habits.get(id)?.frequency === 'monthly';
  }

  setActive(id: string, active: boolean): boolean {
    const h = this.habits.get(id);
    if (!h) return false;
    h.active = active;
    h.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const h = this.habits.get(id);
    if (!h) return false;
    h.name = name;
    h.updated = Date.now();
    return true;
  }

  setFrequency(id: string, frequency: Frequency): boolean {
    const h = this.habits.get(id);
    if (!h) return false;
    h.frequency = frequency;
    h.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const h of this.habits.values()) {
      h.streak = 0;
      h.completions = 0;
      h.completed = false;
      h.hits = 0;
      h.history = [];
      h.active = true;
    }
    this.totalCompletions = 0;
    this.totalStreak = 0;
  }

  getByName(name: string): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.name === name);
  }

  getByFrequency(frequency: Frequency): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.frequency === frequency);
  }

  getDailyHabits(): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.frequency === 'daily');
  }

  getWeeklyHabits(): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.frequency === 'weekly');
  }

  getMonthlyHabits(): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.frequency === 'monthly');
  }

  getCompletedHabits(): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.completed);
  }

  getActiveHabits(): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.active);
  }

  getInactiveHabits(): Habit[] {
    return Array.from(this.habits.values()).filter(h => !h.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.habits.values()).map(h => h.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinStreak(min: number): Habit[] {
    return Array.from(this.habits.values()).filter(h => h.streak >= min);
  }

  getMostStreak(): Habit | null {
    const all = Array.from(this.habits.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.streak > max.streak ? h : max);
  }

  getNewest(): Habit | null {
    const all = Array.from(this.habits.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.created > max.created ? h : max);
  }

  getOldest(): Habit | null {
    const all = Array.from(this.habits.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.created < min.created ? h : min);
  }

  getCreatedAt(id: string): number {
    return this.habits.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.habits.get(id)?.updated ?? 0;
  }

  getTotalCompletions(): number {
    return this.totalCompletions;
  }

  getTotalStreak(): number {
    return this.totalStreak;
  }

  clearAll(): void {
    this.habits.clear();
    this.counter = 0;
    this.totalCompletions = 0;
    this.totalStreak = 0;
  }
}

export default HabitEngine;