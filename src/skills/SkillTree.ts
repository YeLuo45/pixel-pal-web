/**
 * Skill Tree
 * generic-agent-design Skill Tree - Node + Unlock + Dependency + Upgrade
 */

export interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  dependencies: string[];
}

export class SkillTree {
  private skills: Map<string, SkillNode> = new Map();
  private unlocked: Set<string> = new Set();

  addSkill(skill: SkillNode): void {
    this.skills.set(skill.id, { ...skill, dependencies: [...skill.dependencies] });
  }

  unlock(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;

    // Check dependencies
    for (const dep of skill.dependencies) {
      if (!this.unlocked.has(dep)) return false;
    }

    this.unlocked.add(id);
    skill.level = 1;
    return true;
  }

  upgrade(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;
    if (!this.unlocked.has(id)) return false;
    if (skill.level >= skill.maxLevel) return false;
    skill.level++;
    return true;
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  getPrerequisites(id: string): string[] {
    return [...(this.skills.get(id)?.dependencies ?? [])];
  }

  getSkill(id: string): SkillNode | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): SkillNode[] {
    return Array.from(this.skills.values());
  }

  removeSkill(id: string): boolean {
    this.unlocked.delete(id);
    return this.skills.delete(id);
  }

  hasSkill(id: string): boolean {
    return this.skills.has(id);
  }

  getSkillCount(): number {
    return this.skills.size;
  }

  getUnlockedCount(): number {
    return this.unlocked.size;
  }

  getUnlockedSkills(): SkillNode[] {
    return Array.from(this.unlocked).map(id => this.skills.get(id)!).filter(Boolean);
  }

  getLockedSkills(): SkillNode[] {
    return Array.from(this.skills.values())
      .filter(s => !this.unlocked.has(s.id));
  }

  canUnlock(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill || this.unlocked.has(id)) return false;
    return skill.dependencies.every(d => this.unlocked.has(d));
  }

  getMissingPrerequisites(id: string): string[] {
    const skill = this.skills.get(id);
    if (!skill) return [];
    return skill.dependencies.filter(d => !this.unlocked.has(d));
  }

  getMaxLevel(id: string): number {
    return this.skills.get(id)?.maxLevel ?? 0;
  }

  getCurrentLevel(id: string): number {
    return this.skills.get(id)?.level ?? 0;
  }

  reset(): void {
    for (const skill of this.skills.values()) {
      skill.level = 0;
    }
    this.unlocked.clear();
  }

  getAvailableToUnlock(): SkillNode[] {
    return Array.from(this.skills.values()).filter(s => this.canUnlock(s.id));
  }

  isMaxLevel(id: string): boolean {
    const skill = this.skills.get(id);
    return skill ? skill.level >= skill.maxLevel : false;
  }

  getProgress(id: string): number {
    const skill = this.skills.get(id);
    if (!skill || skill.maxLevel === 0) return 0;
    return Math.round((skill.level / skill.maxLevel) * 100) / 100;
  }

  getOverallProgress(): number {
    if (this.skills.size === 0) return 0;
    const sum = Array.from(this.skills.values()).reduce((acc, s) => acc + s.level, 0);
    const max = Array.from(this.skills.values()).reduce((acc, s) => acc + s.maxLevel, 0);
    return max === 0 ? 0 : Math.round((sum / max) * 100) / 100;
  }

  clearAll(): void {
    this.skills.clear();
    this.unlocked.clear();
  }
}

export default SkillTree;