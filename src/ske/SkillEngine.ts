/**
 * Skill Engine
 * generic-agent-design Skill Engine - Add + Upgrade + Use + Stats
 */

export type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  proficiency: number; // 0-100
  uses: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SkeStats {
  skills: number;
  totalAdded: number;
  totalUpgrades: number;
  totalUsed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  novice: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  expert: number;
  avgProficiency: number;
  maxProficiency: number;
  minProficiency: number;
}

export class SkillEngine {
  private skills: Map<string, Skill> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalUpgrades = 0;
  private totalUsed = 0;

  add(name: string, level: SkillLevel, proficiency: number = 50): string {
    const id = `ske-${++this.counter}`;
    this.skills.set(id, {
      id,
      name,
      level,
      proficiency: Math.max(0, Math.min(100, proficiency)),
      uses: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  upgrade(id: string, amount: number = 5): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.proficiency = Math.min(100, s.proficiency + amount);
    if (s.proficiency >= 80) s.level = 'expert';
    else if (s.proficiency >= 60) s.level = 'advanced';
    else if (s.proficiency >= 40) s.level = 'intermediate';
    else if (s.proficiency >= 20) s.level = 'beginner';
    else s.level = 'novice';
    s.updated = Date.now();
    s.hits++;
    this.totalUpgrades++;
    return true;
  }

  use(id: string): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.uses++;
    s.updated = Date.now();
    s.hits++;
    this.totalUsed++;
    return true;
  }

  remove(id: string): boolean {
    return this.skills.delete(id);
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

  setLevel(id: string, level: SkillLevel): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    s.level = level;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.skills.values()) {
      s.active = true;
      s.hits = 0;
      s.uses = 0;
    }
    this.totalAdded = 0;
    this.totalUpgrades = 0;
    this.totalUsed = 0;
  }

  getStats(): SkeStats {
    const all = Array.from(this.skills.values());
    const proficiencies = all.map(s => s.proficiency);
    return {
      skills: all.length,
      totalAdded: this.totalAdded,
      totalUpgrades: this.totalUpgrades,
      totalUsed: this.totalUsed,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      novice: all.filter(s => s.level === 'novice').length,
      beginner: all.filter(s => s.level === 'beginner').length,
      intermediate: all.filter(s => s.level === 'intermediate').length,
      advanced: all.filter(s => s.level === 'advanced').length,
      expert: all.filter(s => s.level === 'expert').length,
      avgProficiency: all.length > 0 ? Math.round((proficiencies.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxProficiency: proficiencies.length > 0 ? Math.max(...proficiencies) : 0,
      minProficiency: proficiencies.length > 0 ? Math.min(...proficiencies) : 0,
    };
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
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

  getLevel(id: string): SkillLevel | undefined {
    return this.skills.get(id)?.level;
  }

  getProficiency(id: string): number {
    return this.skills.get(id)?.proficiency ?? 0;
  }

  getUses(id: string): number {
    return this.skills.get(id)?.uses ?? 0;
  }

  getHits(id: string): number {
    return this.skills.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.skills.get(id)?.active ?? false;
  }

  getByLevel(level: SkillLevel): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.level === level);
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalUpgrades(): number {
    return this.totalUpgrades;
  }

  getTotalUsed(): number {
    return this.totalUsed;
  }

  clearAll(): void {
    this.skills.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalUpgrades = 0;
    this.totalUsed = 0;
  }
}

export default SkillEngine;