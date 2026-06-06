/**
 * Skill Manager
 * generic-agent-design Skill Manager - Register + Execute + Learn + Stats
 */

export interface Skill {
  id: string;
  name: string;
  level: number;
  used: number;
  success: number;
  created: number;
  updated: number;
  history: number[];
  active: boolean;
  totalLearned: number;
}

export interface SM2Stats {
  skills: number;
  totalUses: number;
  totalSuccess: number;
  avgLevel: number;
  successRate: number;
  totalLearned: number;
  active: number;
  inactive: number;
  maxLevel: number;
  minLevel: number;
}

export class SkillManager {
  private skills: Map<string, Skill> = new Map();
  private counter = 0;

  register(name: string, level: number = 1): string {
    const id = `sm-${++this.counter}`;
    this.skills.set(id, {
      id,
      name,
      level,
      used: 0,
      success: 0,
      created: Date.now(),
      updated: Date.now(),
      history: [level],
      active: true,
      totalLearned: 0,
    });
    return id;
  }

  execute(id: string, success: boolean): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.used++;
    if (success) s.success++;
    s.updated = Date.now();
    return true;
  }

  learn(id: string, amount: number): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (amount < 0) return false;
    s.level += amount;
    s.totalLearned += amount;
    s.history.push(s.level);
    s.updated = Date.now();
    return true;
  }

  getStats(): SM2Stats {
    const all = Array.from(this.skills.values());
    const levels = all.map(s => s.level);
    return {
      skills: all.length,
      totalUses: all.reduce((s, x) => s + x.used, 0),
      totalSuccess: all.reduce((s, x) => s + x.success, 0),
      avgLevel: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.level, 0) / all.length) * 100) / 100 : 0,
      successRate: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.success, 0) / Math.max(1, all.reduce((s, x) => s + x.used, 0))) * 100) / 100 : 0,
      totalLearned: all.reduce((s, x) => s + x.totalLearned, 0),
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      maxLevel: levels.length > 0 ? Math.max(...levels) : 0,
      minLevel: levels.length > 0 ? Math.min(...levels) : 0,
    };
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  removeSkill(id: string): boolean {
    return this.skills.delete(id);
  }

  hasSkill(id: string): boolean {
    return this.skills.has(id);
  }

  getCount(): number {
    return this.skills.size;
  }

  getName(id: string): string | undefined {
    return this.skills.get(id)?.name;
  }

  getLevel(id: string): number {
    return this.skills.get(id)?.level ?? 0;
  }

  getUsed(id: string): number {
    return this.skills.get(id)?.used ?? 0;
  }

  getSuccess(id: string): number {
    return this.skills.get(id)?.success ?? 0;
  }

  getTotalLearned(id: string): number {
    return this.skills.get(id)?.totalLearned ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.skills.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.skills.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setLevel(id: string, level: number): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    if (level < 0) return false;
    s.level = level;
    s.history.push(level);
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.skills.values()) {
      s.used = 0;
      s.success = 0;
      s.totalLearned = 0;
      s.history = [s.level];
      s.active = true;
    }
  }

  getByName(name: string): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.name === name);
  }

  getActiveSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.active);
  }

  getInactiveSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.skills.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinLevel(min: number): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.level >= min);
  }

  getHighestLevel(): Skill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.level > max.level ? s : max);
  }

  getMostUsed(): Skill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.used > max.used ? s : max);
  }

  getNewest(): Skill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Skill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.skills.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.skills.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.skills.clear();
    this.counter = 0;
  }
}

export default SkillManager;