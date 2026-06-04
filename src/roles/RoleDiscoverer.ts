/**
 * Role Discoverer
 * chatdev-design Role Discoverer - Register + Match + Recommend + Analyze
 */

export interface Role {
  name: string;
  skills: string[];
  description: string;
}

export interface RoleAnalysis {
  skillCount: number;
  complexity: number;
  rarity: number;
}

export class RoleDiscoverer {
  private roles: Map<string, Role> = new Map();
  private skillIndex: Map<string, Set<string>> = new Map(); // skill -> role names

  registerRole(role: Role): void {
    this.roles.set(role.name, { ...role, skills: [...role.skills] });
    for (const skill of role.skills) {
      if (!this.skillIndex.has(skill)) this.skillIndex.set(skill, new Set());
      this.skillIndex.get(skill)!.add(role.name);
    }
  }

  matchBySkill(skill: string): Role[] {
    const names = this.skillIndex.get(skill) ?? new Set();
    return Array.from(names).map(n => this.roles.get(n)!).filter(Boolean).map(r => ({ ...r, skills: [...r.skills] }));
  }

  recommend(task: string): Role[] {
    const words = task.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const scores = new Map<string, number>();
    for (const word of words) {
      for (const role of this.roles.values()) {
        if (role.description.toLowerCase().includes(word) || role.skills.some(s => s.toLowerCase().includes(word))) {
          scores.set(role.name, (scores.get(role.name) ?? 0) + 1);
        }
      }
    }
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => this.roles.get(name)!)
      .filter(Boolean)
      .map(r => ({ ...r, skills: [...r.skills] }));
  }

  analyze(role: Role): RoleAnalysis {
    const skillCount = role.skills.length;
    const complexity = Math.min(10, Math.ceil(skillCount / 2));
    const totalRoles = this.roles.size || 1;
    const avgSkills = Array.from(this.roles.values()).reduce((sum, r) => sum + r.skills.length, 0) / totalRoles;
    const rarity = avgSkills > 0 ? Math.min(10, Math.ceil(skillCount / avgSkills * 5)) : 5;
    return { skillCount, complexity, rarity };
  }

  getRole(name: string): Role | undefined {
    return this.roles.get(name);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values()).map(r => ({ ...r, skills: [...r.skills] }));
  }

  removeRole(name: string): boolean {
    const role = this.roles.get(name);
    if (!role) return false;
    for (const skill of role.skills) {
      this.skillIndex.get(skill)?.delete(name);
    }
    return this.roles.delete(name);
  }

  hasRole(name: string): boolean {
    return this.roles.has(name);
  }

  getRoleCount(): number {
    return this.roles.size;
  }

  getAllSkills(): string[] {
    return [...this.skillIndex.keys()];
  }

  getSkillCount(): number {
    return this.skillIndex.size;
  }

  searchRoles(query: string): Role[] {
    const lower = query.toLowerCase();
    return Array.from(this.roles.values())
      .filter(r => r.name.toLowerCase().includes(lower) || r.description.toLowerCase().includes(lower))
      .map(r => ({ ...r, skills: [...r.skills] }));
  }

  getRolesBySkillCount(min: number, max: number): Role[] {
    return Array.from(this.roles.values())
      .filter(r => r.skills.length >= min && r.skills.length <= max)
      .map(r => ({ ...r, skills: [...r.skills] }));
  }

  addSkillToRole(roleName: string, skill: string): boolean {
    const role = this.roles.get(roleName);
    if (!role) return false;
    if (!role.skills.includes(skill)) {
      role.skills.push(skill);
      if (!this.skillIndex.has(skill)) this.skillIndex.set(skill, new Set());
      this.skillIndex.get(skill)!.add(roleName);
    }
    return true;
  }

  removeSkillFromRole(roleName: string, skill: string): boolean {
    const role = this.roles.get(roleName);
    if (!role) return false;
    const idx = role.skills.indexOf(skill);
    if (idx === -1) return false;
    role.skills.splice(idx, 1);
    this.skillIndex.get(skill)?.delete(roleName);
    return true;
  }

  getSkillsOfRole(name: string): string[] {
    return [...(this.roles.get(name)?.skills ?? [])];
  }

  getMostSkilledRole(): Role | null {
    let best: Role | null = null;
    let max = -1;
    for (const role of this.roles.values()) {
      if (role.skills.length > max) {
        max = role.skills.length;
        best = role;
      }
    }
    return best ? { ...best, skills: [...best.skills] } : null;
  }

  getRareSkills(): string[] {
    return Array.from(this.skillIndex.entries())
      .filter(([_, roles]) => roles.size === 1)
      .map(([skill]) => skill);
  }

  clearAll(): void {
    this.roles.clear();
    this.skillIndex.clear();
  }
}

export default RoleDiscoverer;