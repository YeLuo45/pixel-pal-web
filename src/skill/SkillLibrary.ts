/**
 * Skill Library
 * chatdev-design Skill Library - Register + Invoke + Update + Stats
 */

export type SkillHandler = (...args: unknown[]) => unknown;

export interface Skill {
  id: string;
  name: string;
  description: string;
  handler: SkillHandler;
  created: number;
  updated: number;
  invocations: number;
}

export interface SkillStats {
  skills: number;
  invocations: number;
}

export class SkillLibrary {
  private skills: Map<string, Skill> = new Map();

  register(skill: Omit<Skill, 'created' | 'updated' | 'invocations'>): boolean {
    if (this.skills.has(skill.id)) return false;
    this.skills.set(skill.id, {
      ...skill,
      created: Date.now(),
      updated: Date.now(),
      invocations: 0,
    });
    return true;
  }

  invoke(id: string, ...args: unknown[]): unknown {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    skill.invocations++;
    return skill.handler(...args);
  }

  update(id: string, handler: SkillHandler): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;
    skill.handler = handler;
    skill.updated = Date.now();
    return true;
  }

  getStats(): SkillStats {
    return {
      skills: this.skills.size,
      invocations: Array.from(this.skills.values()).reduce((sum, s) => sum + s.invocations, 0),
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

  getDescription(id: string): string | undefined {
    return this.skills.get(id)?.description;
  }

  getInvocations(id: string): number {
    return this.skills.get(id)?.invocations ?? 0;
  }

  updateName(id: string, name: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;
    skill.name = name;
    skill.updated = Date.now();
    return true;
  }

  updateDescription(id: string, description: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;
    skill.description = description;
    skill.updated = Date.now();
    return true;
  }

  resetInvocations(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;
    skill.invocations = 0;
    return true;
  }

  resetAllInvocations(): void {
    for (const skill of this.skills.values()) {
      skill.invocations = 0;
    }
  }

  getMostInvoked(): Skill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.invocations > max.invocations ? s : max);
  }

  getLeastInvoked(): Skill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.invocations < min.invocations ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.skills.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.skills.get(id)?.updated ?? 0;
  }

  getAvgInvocations(): number {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, s) => sum + s.invocations, 0) / all.length) * 100) / 100;
  }

  clearAll(): void {
    this.skills.clear();
  }
}

export default SkillLibrary;