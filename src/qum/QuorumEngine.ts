/**
 * Quorum Engine
 * nanobot-design Quorum Engine - AddMember + Vote + Check + Stats
 */

export type QuorumVote = 'yes' | 'no' | 'abstain';

export interface QuorumMember {
  id: string;
  name: string;
  weight: number;
  vote: QuorumVote;
  voted: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface QumStats {
  members: number;
  totalAdded: number;
  totalVoted: number;
  yes: number;
  no: number;
  abstain: number;
  voted: number;
  unvoted: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalWeight: number;
  yesWeight: number;
  noWeight: number;
  abstainWeight: number;
}

export class QuorumEngine {
  private members: Map<string, QuorumMember> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalVoted = 0;
  private totalWeight = 0;
  private yesWeight = 0;
  private noWeight = 0;
  private abstainWeight = 0;

  addMember(name: string, weight: number): string {
    const id = `qum-${++this.counter}`;
    this.members.set(id, {
      id,
      name,
      weight,
      vote: 'abstain',
      voted: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalWeight += weight;
    return id;
  }

  vote(id: string, v: QuorumVote): boolean {
    const m = this.members.get(id);
    if (!m) return false;
    if (!m.active) return false;
    if (m.voted) {
      // Undo previous weight
      if (m.vote === 'yes') this.yesWeight -= m.weight;
      else if (m.vote === 'no') this.noWeight -= m.weight;
      else this.abstainWeight -= m.weight;
    } else {
      this.totalVoted++;
    }
    m.vote = v;
    m.voted = true;
    m.updated = Date.now();
    m.hits++;
    if (v === 'yes') this.yesWeight += m.weight;
    else if (v === 'no') this.noWeight += m.weight;
    else this.abstainWeight += m.weight;
    return true;
  }

  check(quorumRatio: number): boolean {
    if (this.totalWeight === 0) return false;
    return (this.yesWeight / this.totalWeight) >= quorumRatio;
  }

  remove(id: string): boolean {
    return this.members.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.members.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const m = this.members.get(id);
    if (!m) return false;
    m.name = name;
    m.updated = Date.now();
    return true;
  }

  setWeight(id: string, weight: number): boolean {
    const m = this.members.get(id);
    if (!m) return false;
    m.weight = weight;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.members.values()) {
      m.vote = 'abstain';
      m.voted = false;
      m.active = true;
      m.hits = 0;
    }
    this.totalAdded = 0;
    this.totalVoted = 0;
    this.yesWeight = 0;
    this.noWeight = 0;
    this.abstainWeight = 0;
  }

  getStats(): QumStats {
    const all = Array.from(this.members.values());
    return {
      members: all.length,
      totalAdded: this.totalAdded,
      totalVoted: this.totalVoted,
      yes: all.filter(m => m.vote === 'yes').length,
      no: all.filter(m => m.vote === 'no').length,
      abstain: all.filter(m => m.vote === 'abstain').length,
      voted: all.filter(m => m.voted).length,
      unvoted: all.filter(m => !m.voted).length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueNames: new Set(all.map(m => m.name)).size,
      totalWeight: this.totalWeight,
      yesWeight: this.yesWeight,
      noWeight: this.noWeight,
      abstainWeight: this.abstainWeight,
    };
  }

  getMember(id: string): QuorumMember | undefined {
    return this.members.get(id);
  }

  getAllMembers(): QuorumMember[] {
    return Array.from(this.members.values());
  }

  hasMember(id: string): boolean {
    return this.members.has(id);
  }

  getCount(): number {
    return this.members.size;
  }

  getName(id: string): string | undefined {
    return this.members.get(id)?.name;
  }

  getWeight(id: string): number {
    return this.members.get(id)?.weight ?? 0;
  }

  getVote(id: string): QuorumVote | undefined {
    return this.members.get(id)?.vote;
  }

  hasVoted(id: string): boolean {
    return this.members.get(id)?.voted ?? false;
  }

  getHits(id: string): number {
    return this.members.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.members.get(id)?.active ?? false;
  }

  isYes(id: string): boolean {
    return this.members.get(id)?.vote === 'yes';
  }

  isNo(id: string): boolean {
    return this.members.get(id)?.vote === 'no';
  }

  isAbstain(id: string): boolean {
    return this.members.get(id)?.vote === 'abstain';
  }

  getByVote(vote: QuorumVote): QuorumMember[] {
    return Array.from(this.members.values()).filter(m => m.vote === vote);
  }

  getVoted(): QuorumMember[] {
    return Array.from(this.members.values()).filter(m => m.voted);
  }

  getUnvoted(): QuorumMember[] {
    return Array.from(this.members.values()).filter(m => !m.voted);
  }

  getActiveMembers(): QuorumMember[] {
    return Array.from(this.members.values()).filter(m => m.active);
  }

  getInactiveMembers(): QuorumMember[] {
    return Array.from(this.members.values()).filter(m => !m.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.members.values()).map(m => m.name))];
  }

  getNewest(): QuorumMember | null {
    const all = Array.from(this.members.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): QuorumMember | null {
    const all = Array.from(this.members.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.members.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.members.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalVoted(): number {
    return this.totalVoted;
  }

  getYesWeight(): number {
    return this.yesWeight;
  }

  getNoWeight(): number {
    return this.noWeight;
  }

  getTotalWeight(): number {
    return this.totalWeight;
  }

  clearAll(): void {
    this.members.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalVoted = 0;
    this.totalWeight = 0;
    this.yesWeight = 0;
    this.noWeight = 0;
    this.abstainWeight = 0;
  }
}

export default QuorumEngine;