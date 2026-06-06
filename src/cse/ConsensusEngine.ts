/**
 * Consensus Engine
 * nanobot-design Consensus Engine - Propose + Vote + Resolve + Stats
 */

export type ConsensusStatus = 'pending' | 'approved' | 'rejected';

export interface Vote {
  voter: string;
  approve: boolean;
  timestamp: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  votes: Vote[];
  status: ConsensusStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CseStats {
  proposals: number;
  totalApproved: number;
  totalRejected: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  totalVotes: number;
  avgVotes: number;
  maxVotes: number;
  minVotes: number;
  uniqueVoters: number;
}

export class ConsensusEngine {
  private proposals: Map<string, Proposal> = new Map();
  private counter = 0;
  private totalApproved = 0;
  private totalRejected = 0;

  propose(title: string, description: string = ''): string {
    const id = `cse-${++this.counter}`;
    this.proposals.set(id, {
      id,
      title,
      description,
      votes: [],
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  vote(id: string, voter: string, approve: boolean): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.status !== 'pending') return false;
    if (p.votes.find(v => v.voter === voter)) return false;
    p.votes.push({
      voter,
      approve,
      timestamp: Date.now(),
    });
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  resolve(id: string, approveOnMajority: boolean = true): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    if (p.status !== 'pending') return false;
    const approveCount = p.votes.filter(v => v.approve).length;
    const rejectCount = p.votes.filter(v => !v.approve).length;
    p.status = approveOnMajority
      ? (approveCount > rejectCount ? 'approved' : 'rejected')
      : (approveCount >= rejectCount ? 'approved' : 'rejected');
    p.updated = Date.now();
    p.hits++;
    if (p.status === 'approved') this.totalApproved++;
    else this.totalRejected++;
    return true;
  }

  remove(id: string): boolean {
    return this.proposals.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.proposals.values()) {
      p.votes = [];
      p.status = 'pending';
      p.active = true;
      p.hits = 0;
    }
    this.totalApproved = 0;
    this.totalRejected = 0;
  }

  getStats(): CseStats {
    const all = Array.from(this.proposals.values());
    const voteValues = all.map(p => p.votes.length);
    const allVoters = all.flatMap(p => p.votes.map(v => v.voter));
    return {
      proposals: all.length,
      totalApproved: this.totalApproved,
      totalRejected: this.totalRejected,
      pending: all.filter(p => p.status === 'pending').length,
      approved: all.filter(p => p.status === 'approved').length,
      rejected: all.filter(p => p.status === 'rejected').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueTitles: new Set(all.map(p => p.title)).size,
      totalVotes: all.reduce((s, p) => s + p.votes.length, 0),
      avgVotes: all.length > 0 ? Math.round((voteValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxVotes: voteValues.length > 0 ? Math.max(...voteValues) : 0,
      minVotes: voteValues.length > 0 ? Math.min(...voteValues) : 0,
      uniqueVoters: new Set(allVoters).size,
    };
  }

  getProposal(id: string): Proposal | undefined {
    return this.proposals.get(id);
  }

  getAllProposals(): Proposal[] {
    return Array.from(this.proposals.values());
  }

  hasProposal(id: string): boolean {
    return this.proposals.has(id);
  }

  getCount(): number {
    return this.proposals.size;
  }

  getTitle(id: string): string | undefined {
    return this.proposals.get(id)?.title;
  }

  getDescription(id: string): string | undefined {
    return this.proposals.get(id)?.description;
  }

  getStatus(id: string): ConsensusStatus | undefined {
    return this.proposals.get(id)?.status;
  }

  getVotes(id: string): Vote[] {
    return [...(this.proposals.get(id)?.votes ?? [])];
  }

  getVoteCount(id: string): number {
    return this.proposals.get(id)?.votes.length ?? 0;
  }

  getApproveCount(id: string): number {
    return this.proposals.get(id)?.votes.filter(v => v.approve).length ?? 0;
  }

  getRejectCount(id: string): number {
    return this.proposals.get(id)?.votes.filter(v => !v.approve).length ?? 0;
  }

  getHits(id: string): number {
    return this.proposals.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.proposals.get(id)?.active ?? false;
  }

  isApproved(id: string): boolean {
    return this.proposals.get(id)?.status === 'approved';
  }

  isRejected(id: string): boolean {
    return this.proposals.get(id)?.status === 'rejected';
  }

  setTitle(id: string, title: string): boolean {
    const p = this.proposals.get(id);
    if (!p) return false;
    p.title = title;
    p.updated = Date.now();
    return true;
  }

  getByStatus(status: ConsensusStatus): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.status === status);
  }

  getActiveProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.active);
  }

  getInactiveProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => !p.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.proposals.values()).map(p => p.title))];
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

  getTotalApproved(): number {
    return this.totalApproved;
  }

  getTotalRejected(): number {
    return this.totalRejected;
  }

  clearAll(): void {
    this.proposals.clear();
    this.counter = 0;
    this.totalApproved = 0;
    this.totalRejected = 0;
  }
}

export default ConsensusEngine;