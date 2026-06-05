/**
 * Consensus Engine
 * nanobot-design Consensus Engine - Vote + Propose + Tally + Audit
 */

export type Choice = 'yes' | 'no' | 'abstain';
export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface Vote {
  voter: string;
  proposal: string;
  choice: Choice;
  timestamp: number;
}

export interface Proposal {
  id: string;
  title: string;
  status: ProposalStatus;
  votes: Vote[];
  created: number;
  finalized?: number;
}

export class ConsensusEngine {
  private proposals: Map<string, Proposal> = new Map();
  private counter = 0;

  propose(title: string): string {
    const id = `prop-${++this.counter}`;
    this.proposals.set(id, {
      id,
      title,
      status: 'pending',
      votes: [],
      created: Date.now(),
    });
    return id;
  }

  vote(proposalId: string, voter: string, choice: Choice): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return false;
    if (proposal.status !== 'pending') return false;
    // Remove existing vote from same voter
    proposal.votes = proposal.votes.filter(v => v.voter !== voter);
    proposal.votes.push({ voter, proposal: proposalId, choice, timestamp: Date.now() });
    return true;
  }

  tally(proposalId: string): Choice | 'tie' {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return 'tie';
    const yes = proposal.votes.filter(v => v.choice === 'yes').length;
    const no = proposal.votes.filter(v => v.choice === 'no').length;
    const abstain = proposal.votes.filter(v => v.choice === 'abstain').length;
    if (yes > no && yes > abstain) return 'yes';
    if (no > yes && no > abstain) return 'no';
    if (abstain > yes && abstain > no) return 'abstain';
    return 'tie';
  }

  audit(proposalId: string): Proposal | null {
    const proposal = this.proposals.get(proposalId);
    return proposal ? { ...proposal, votes: [...proposal.votes] } : null;
  }

  finalize(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return false;
    if (proposal.status !== 'pending') return false;
    const result = this.tally(proposalId);
    proposal.status = result === 'yes' ? 'approved' : 'rejected';
    proposal.finalized = Date.now();
    return true;
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

  getVotes(proposalId: string): Vote[] {
    return [...(this.proposals.get(proposalId)?.votes ?? [])];
  }

  getVoteCount(proposalId: string): number {
    return this.proposals.get(proposalId)?.votes.length ?? 0;
  }

  getYesCount(proposalId: string): number {
    return this.proposals.get(proposalId)?.votes.filter(v => v.choice === 'yes').length ?? 0;
  }

  getNoCount(proposalId: string): number {
    return this.proposals.get(proposalId)?.votes.filter(v => v.choice === 'no').length ?? 0;
  }

  getAbstainCount(proposalId: string): number {
    return this.proposals.get(proposalId)?.votes.filter(v => v.choice === 'abstain').length ?? 0;
  }

  getApprovedProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.status === 'approved');
  }

  getRejectedProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.status === 'rejected');
  }

  getPendingProposals(): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.status === 'pending');
  }

  getByStatus(status: ProposalStatus): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.status === status);
  }

  hasVoted(proposalId: string, voter: string): boolean {
    return this.proposals.get(proposalId)?.votes.some(v => v.voter === voter) ?? false;
  }

  getVoterChoice(proposalId: string, voter: string): Choice | null {
    return this.proposals.get(proposalId)?.votes.find(v => v.voter === voter)?.choice ?? null;
  }

  getApprovalRate(): number {
    const all = Array.from(this.proposals.values());
    if (all.length === 0) return 0;
    const approved = all.filter(p => p.status === 'approved').length;
    return Math.round((approved / all.length) * 100) / 100;
  }

  isApproved(id: string): boolean {
    return this.proposals.get(id)?.status === 'approved';
  }

  isRejected(id: string): boolean {
    return this.proposals.get(id)?.status === 'rejected';
  }

  isPending(id: string): boolean {
    return this.proposals.get(id)?.status === 'pending';
  }

  getCreatedAt(id: string): number {
    return this.proposals.get(id)?.created ?? 0;
  }

  getFinalizedAt(id: string): number {
    return this.proposals.get(id)?.finalized ?? 0;
  }

  clearAll(): void {
    this.proposals.clear();
    this.counter = 0;
  }
}

export default ConsensusEngine;