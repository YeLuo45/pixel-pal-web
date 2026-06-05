/**
 * Skill Matcher
 * generic-agent-design Skill Matcher - Index + Match + Score + Stats
 */

export interface MatchableSkill {
  id: string;
  name: string;
  capabilities: string[];
  context: string[];
  score: number;
  matches: number;
  created: number;
}

export interface MatcherStats {
  skills: number;
  matches: number;
  avgScore: number;
  topScore: number;
}

export class SkillMatcher {
  private skills: Map<string, MatchableSkill> = new Map();
  private matches = 0;

  index(skill: Omit<MatchableSkill, 'matches' | 'created'>): boolean {
    if (this.skills.has(skill.id)) return false;
    this.skills.set(skill.id, {
      ...skill,
      matches: 0,
      created: Date.now(),
    });
    return true;
  }

  match(capability: string, context: string[] = []): MatchableSkill[] {
    this.matches++;
    const results: MatchableSkill[] = [];
    for (const skill of this.skills.values()) {
      let score = 0;
      if (skill.capabilities.includes(capability)) score += 1;
      for (const ctx of context) {
        if (skill.context.includes(ctx)) score += 0.5;
      }
      if (score > 0) {
        skill.matches++;
        results.push({ ...skill, score });
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }

  getStats(): MatcherStats {
    const all = Array.from(this.skills.values());
    return {
      skills: all.length,
      matches: this.matches,
      avgScore: all.length > 0 ? Math.round((all.reduce((s, k) => s + k.score, 0) / all.length) * 100) / 100 : 0,
      topScore: all.length > 0 ? Math.max(...all.map(k => k.score)) : 0,
    };
  }

  getSkill(id: string): MatchableSkill | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): MatchableSkill[] {
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

  getScore(id: string): number {
    return this.skills.get(id)?.score ?? 0;
  }

  setScore(id: string, score: number): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    s.score = score;
    return true;
  }

  getCapabilities(id: string): string[] {
    return [...(this.skills.get(id)?.capabilities ?? [])];
  }

  getContext(id: string): string[] {
    return [...(this.skills.get(id)?.context ?? [])];
  }

  hasCapability(id: string, cap: string): boolean {
    return this.skills.get(id)?.capabilities.includes(cap) ?? false;
  }

  hasContext(id: string, ctx: string): boolean {
    return this.skills.get(id)?.context.includes(ctx) ?? false;
  }

  addCapability(id: string, cap: string): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    if (!s.capabilities.includes(cap)) s.capabilities.push(cap);
    return true;
  }

  removeCapability(id: string, cap: string): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    const idx = s.capabilities.indexOf(cap);
    if (idx === -1) return false;
    s.capabilities.splice(idx, 1);
    return true;
  }

  addContext(id: string, ctx: string): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    if (!s.context.includes(ctx)) s.context.push(ctx);
    return true;
  }

  removeContext(id: string, ctx: string): boolean {
    const s = this.skills.get(id);
    if (!s) return false;
    const idx = s.context.indexOf(ctx);
    if (idx === -1) return false;
    s.context.splice(idx, 1);
    return true;
  }

  getMatches(id: string): number {
    return this.skills.get(id)?.matches ?? 0;
  }

  getMatchCount(): number {
    return this.matches;
  }

  getByCapability(cap: string): MatchableSkill[] {
    return Array.from(this.skills.values()).filter(s => s.capabilities.includes(cap));
  }

  getByContext(ctx: string): MatchableSkill[] {
    return Array.from(this.skills.values()).filter(s => s.context.includes(ctx));
  }

  getCreatedAt(id: string): number {
    return this.skills.get(id)?.created ?? 0;
  }

  getMostMatched(): MatchableSkill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.matches > max.matches ? s : max);
  }

  getTopScored(): MatchableSkill | null {
    const all = Array.from(this.skills.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.score > max.score ? s : max);
  }

  resetMatches(): void {
    this.matches = 0;
    for (const s of this.skills.values()) s.matches = 0;
  }

  clearAll(): void {
    this.skills.clear();
    this.matches = 0;
  }
}

export default SkillMatcher;