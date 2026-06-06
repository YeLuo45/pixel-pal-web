/**
 * Consensus Engine
 * chatdev-design Consensus Engine - Propose + Vote + Decide + Stats
 */

export type Vote = 'yes' | 'no' | 'abstain';

export interface Proposal {
  id: string;
  topic: string;
  votes: { yes: number; no: number; abstain: number };
  voters: Map<string, Vote>;
  decided: boolean;
  passed: boolean;
  created: number;
  updated: number;
  totalVotes: number;
  active: boolean;
  history: Vote[];
}

export interface CEStats {
  proposals: number;
  passed: number;
  failed: number;
  pending: number;
  totalVotes: number;
  totalYes: number;
  totalNo: number;
  totalAbstain: number;
  active: number;
  inactive: number;
  passRate: number;
}

export class ConsensusEngine {
  private proposals: Map<string, Proposal> = new Map();
  private counter = 0;

  propose(topic: string): string {
    const id = `cons-${++this.counter}`;
    this.proposals.set(id, {
      id,
      topic,
      votes: { yes: 0, no: 0, abstain: 0 },
      voters: new Map(),
      decided: false,
      passed: false,
      created: Date.now(),
      updated: Date.now(),
      totalVotes: 0,
      active: true,
      history: [],
    });
    return id;
  }

  vote(id: string, voter: string, choice: Vote): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.decided) return false;
    if (p.voters.has(voter)) return false;
    p.voters.set(voter, choice);
    p.votes[choice]++;
    p.totalVotes++;
    p.history.push(choice);
    p.updated = Date.now();
    return true;
  }

  decide(id: string, threshold: number): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    if (p.decided) return false;
    if (p.totalVotes === 0) return false;
    const yesRatio = p.votes.yes / p.totalVotes;
    p.passed = yesRatio >= threshold;
    p.decided = true;
    p.updated = Date.now();
    return true;
  }

  getStats(): CEStats {
    const all = Array.from(this.proposals.values());
    const totalYes = all.reduce((s, p) => s + p.votes.yes, 0);
    const totalNo = all.reduce((s, p) => s + p.votes.no, 0);
    const totalAbstain = all.reduce((s, p) => s + p.votes.abstain, 0);
    const totalVotes = totalYes + totalNo + totalAbstain;
    return {
      proposals: all.length,
      passed: all.filter(p => p.passed).length,
      failed: all.filter(p => p.decided && !p.passed).length,
      pending: all.filter(p => !p.decided).length,
      totalVotes,
      totalYes,
      totalNo,
      totalAbstain,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      passRate: all.length > 0 ? Math.round((all.filter(p => p.passed).length / all.length) * 100) / 100 : 0,
    };
  }

  getProposal(id: string): Proposal | undefined {
    return this.proposals.get(id);
  }

  getAllProposals(): Proposal[] {
    return Array.from(this.proposals.values());
  }

  removeProposal(id: string): boolean {
    return this.proposals.delete(id);
  }

  hasProposal(id: string): boolean {
    return this.proposals.has(id);
  }

  getCount(): number {
    return this.proposals.size;
  }

  getTopic(id: string): string | undefined {
    return this.proposals.get(id)?.topic;
  }

  getVotes(id: string): { yes: number; no: number; abstain: number } | undefined {
    return this.proposals.get(id)?.votes;
  }

  getYesCount(id: string): number {
    return this.proposals.get(id)?.votes.yes ?? 0;
  }

  getNoCount(id: string): number {
    return this.proposals.get(id)?.votes.no ?? 0;
  }

  getAbstainCount(id: string): number {
    return this.proposals.get(id)?.votes.abstain ?? 0;
  }

  getTotalVotes(id: string): number {
    return this.proposals.get(id)?.totalVotes ?? 0;
  }

  getVoterCount(id: string): number {
    return this.proposals.get(id)?.voters.size ?? 0;
  }

  getVoters(id: string): string[] {
    return [...(this.proposals.get(id)?.voters.keys() ?? [])];
  }

  getVoterChoice(id: string, voter: string): Vote | undefined {
    return this.proposals.get(id)?.voters.get(voter);
  }

  getHistory(id: string): Vote[] {
    return [...(this.proposals.get(id)?.history ?? [])];
  }

  isDecided(id: string): boolean {
    return this.proposals.get(id)?.decided ?? false;
  }

  isPassed(id: string): boolean {
    return this.proposals.get(id)?.passed ?? false;
  }

  isActive(id: string): boolean {
    return this.proposals.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return !this.isDecided(id);
  }

  hasVoted(id: string, voter: string): boolean {
    return this.proposals.get(id)?.voters.has(voter) ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setTopic(id: string, topic: string): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    p.topic = topic;
    p.updated = Date.now();
    return true;
  }

  resetVotes(id: string): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    p.votes = { yes: 0, no: 0, abstain: 0 };
    p.voters = new Map();
    p.totalVotes = 0;
    p.history = [];
    p.decided = false;
    p.passed = false;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.proposals.values()) {
      p.votes = { yes: 0, no: 0, abstain: 0 };
      p.voters = new Map();
      p.totalVotes = 0;
      p.history = [];
      p.decided = false;
      p.passed = false;
      p.active = true;
    }
  }

  getByTopic(topic: string): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.topic === topic);
  }

  getPassedProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.passed);
  }

  getFailedProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.decided && !p.passed);
  }

  getPendingProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => !p.decided);
  }

  getActiveProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.active);
  }

  getInactiveProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => !p.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.proposals.values()).map(p => p.topic))];
  }

  getTopicCount(): number {
    return this.getAllTopics().length;
  }

  getByMinVotes(min: number): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.totalVotes >= min);
  }

  getMostVotes(): Proposal | null {
    const all = Array.from(this.proposals.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.totalVotes > max.totalVotes ? p : max);
  }

  getNewest(): Proposal | null {
    const all = Array.from(this.proposals.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Proposal | null {
    const all = Array.from(this.proposals.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.proposals.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.proposals.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.proposals.clear();
    this.counter = 0;
  }
}

export default ConsensusEngine;