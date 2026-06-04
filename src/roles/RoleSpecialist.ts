/**
 * Role Specialist v2
 * chatdev-design Role Specialization v2 - Dynamic Assignment + Skill Matching
 */

export interface Agent {
  id: string;
  role: string;
  skills: string[];
  score: number;
}

export class RoleSpecialist {
  private agents: Map<string, Agent> = new Map();
  private taskHistory: Map<string, string[]> = new Map();

  /**
   * Register an agent
   */
  register(agent: Agent): void {
    this.agents.set(agent.id, { ...agent });
  }

  /**
   * Match agents to a task based on skills
   */
  matchRole(agentId: string, task: string): string[] {
    const agent = this.agents.get(agentId);
    if (!agent) return [];

    // Record task history
    if (!this.taskHistory.has(agentId)) {
      this.taskHistory.set(agentId, []);
    }
    this.taskHistory.get(agentId)!.push(task);

    // Find matching skills
    const taskKeywords = task.toLowerCase().split(/\s+/);
    const matching: string[] = [];

    for (const skill of agent.skills) {
      if (taskKeywords.some(kw => skill.toLowerCase().includes(kw))) {
        matching.push(skill);
      }
    }

    // If no keyword match, return all skills as potential matches
    if (matching.length === 0) {
      return [...agent.skills];
    }

    return matching;
  }

  /**
   * Score collaboration between agents
   */
  scoreCollaboration(agentIds: string[]): number {
    if (agentIds.length < 2) return 0;

    const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean) as Agent[];
    if (agents.length < 2) return 0;

    // Calculate skill overlap
    const skillSets = agents.map(a => new Set(a.skills));
    const intersection = skillSets[0];
    for (let i = 1; i < skillSets.length; i++) {
      for (const skill of intersection) {
        if (!skillSets[i].has(skill)) intersection.delete(skill);
      }
    }

    // Calculate role diversity
    const roles = new Set(agents.map(a => a.role));
    const diversity = roles.size / agents.length;

    // Score = skill overlap count * diversity factor
    return Math.round(intersection.size * diversity * 100) / 100;
  }

  /**
   * Evolve agent role (increase score)
   */
  evolveRole(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    agent.score = Math.min(100, agent.score + 5);

    // Add a new skill based on task history
    const history = this.taskHistory.get(agentId) || [];
    if (history.length > 0) {
      const lastTask = history[history.length - 1];
      const keywords = lastTask.split(/\s+/).filter(w => w.length > 4);
      if (keywords.length > 0) {
        const newSkill = keywords[0];
        if (!agent.skills.includes(newSkill)) {
          agent.skills.push(newSkill);
        }
      }
    }

    return true;
  }

  /**
   * Get agent specializations
   */
  getSpecializations(agentId: string): string[] {
    const agent = this.agents.get(agentId);
    return agent ? [...agent.skills] : [];
  }

  /**
   * Get agent by id
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: string): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.role === role);
  }

  /**
   * Get task count for agent
   */
  getTaskCount(agentId: string): number {
    return this.taskHistory.get(agentId)?.length ?? 0;
  }

  /**
   * Update agent score
   */
  updateScore(agentId: string, delta: number): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    agent.score = Math.max(0, Math.min(100, agent.score + delta));
    return true;
  }

  /**
   * Get top agents by score
   */
  getTopAgents(count: number = 5): Agent[] {
    return Array.from(this.agents.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * Get average score
   */
  getAverageScore(): number {
    if (this.agents.size === 0) return 0;
    const sum = Array.from(this.agents.values()).reduce((acc, a) => acc + a.score, 0);
    return Math.round(sum / this.agents.size * 100) / 100;
  }

  /**
   * Remove agent
   */
  removeAgent(agentId: string): boolean {
    if (!this.agents.has(agentId)) return false;
    this.agents.delete(agentId);
    this.taskHistory.delete(agentId);
    return true;
  }

  /**
   * Clear all
   */
  clearAll(): void {
    this.agents.clear();
    this.taskHistory.clear();
  }

  /**
   * Get collaboration history count
   */
  getCollaborationCount(agentId1: string, agentId2: string): number {
    const h1 = this.taskHistory.get(agentId1) || [];
    const h2 = this.taskHistory.get(agentId2) || [];
    let count = 0;
    for (const task of h1) {
      if (h2.includes(task)) count++;
    }
    return count;
  }

  /**
   * Get best collaborator for an agent
   */
  getBestCollaborator(agentId: string): Agent | null {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    let best: Agent | null = null;
    let bestScore = -1;

    for (const other of this.agents.values()) {
      if (other.id === agentId) continue;
      const score = this.scoreCollaboration([agentId, other.id]);
      if (score > bestScore) {
        bestScore = score;
        best = other;
      }
    }

    return best;
  }
}

export default RoleSpecialist;