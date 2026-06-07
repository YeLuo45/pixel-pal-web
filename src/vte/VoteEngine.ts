/**
 * Vote Engine
 * chatdev-design Vote Engine - Create + Cast + Tally + Stats
 */

export type VoteType = 'simple' | 'ranked' | 'approval';

export interface Ballot {
  id: string;
  question: string;
  options: string[];
  type: VoteType;
  votes: Map<string, number>;
  totalVotes: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface VteStats {
  ballots: number;
  totalCreated: number;
  totalCast: number;
  simple: number;
  ranked: number;
  approval: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueQuestions: number;
  totalVotes2: number;
  avgVotes: number;
  maxVotes: number;
  minVotes: number;
}

export class VoteEngine {
  private ballots: Map<string, Ballot> = new Map();
  private counter = 0;
  private totalCreated = 0;
  private totalCast = 0;

  create(question: string, options: string[], type: VoteType = 'simple'): string {
    const id = `vte-${++this.counter}`;
    this.ballots.set(id, {
      id,
      question,
      options,
      type,
      votes: new Map(options.map(o => [o, 0])),
      totalVotes: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalCreated++;
    return id;
  }

  cast(id: string, option: string, weight: number = 1): boolean {
    const b = this.ballots.get(id);
    if (!b) return false;
    if (!b.active) return false;
    if (!b.votes.has(option)) return false;
    b.votes.set(option, (b.votes.get(option) ?? 0) + weight);
    b.totalVotes += weight;
    b.updated = Date.now();
    b.hits++;
    this.totalCast++;
    return true;
  }

  tally(id: string): Map<string, number> | undefined {
    return this.ballots.get(id)?.votes;
  }

  winner(id: string): string | undefined {
    const b = this.ballots.get(id);
    if (!b) return undefined;
    let max = 0;
    let winner: string | undefined;
    for (const [k, v] of b.votes) {
      if (v > max) {
        max = v;
        winner = k;
      }
    }
    return winner;
  }

  remove(id: string): boolean {
    return this.ballots.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.ballots.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setQuestion(id: string, question: string): boolean {
    const b = this.ballots.get(id);
    if (!b) return false;
    b.question = question;
    b.updated = Date.now();
    return true;
  }

  setType(id: string, type: VoteType): boolean {
    const b = this.ballots.get(id);
    if (!b) return false;
    b.type = type;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.ballots.values()) {
      b.votes = new Map(b.options.map(o => [o, 0]));
      b.totalVotes = 0;
      b.active = true;
      b.hits = 0;
    }
    this.totalCreated = 0;
    this.totalCast = 0;
  }

  getStats(): VteStats {
    const all = Array.from(this.ballots.values());
    const totalArr = all.map(b => b.totalVotes);
    return {
      ballots: all.length,
      totalCreated: this.totalCreated,
      totalCast: this.totalCast,
      simple: all.filter(b => b.type === 'simple').length,
      ranked: all.filter(b => b.type === 'ranked').length,
      approval: all.filter(b => b.type === 'approval').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueQuestions: new Set(all.map(b => b.question)).size,
      totalVotes2: all.reduce((s, b) => s + b.totalVotes, 0),
      avgVotes: all.length > 0 ? Math.round((totalArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxVotes: totalArr.length > 0 ? Math.max(...totalArr) : 0,
      minVotes: totalArr.length > 0 ? Math.min(...totalArr) : 0,
    };
  }

  getBallot(id: string): Ballot | undefined {
    return this.ballots.get(id);
  }

  getAllBallots(): Ballot[] {
    return Array.from(this.ballots.values());
  }

  hasBallot(id: string): boolean {
    return this.ballots.has(id);
  }

  getCount(): number {
    return this.ballots.size;
  }

  getQuestion(id: string): string | undefined {
    return this.ballots.get(id)?.question;
  }

  getOptions(id: string): string[] | undefined {
    return this.ballots.get(id)?.options;
  }

  getType(id: string): VoteType | undefined {
    return this.ballots.get(id)?.type;
  }

  getTotalVotes(id: string): number {
    return this.ballots.get(id)?.totalVotes ?? 0;
  }

  getHits(id: string): number {
    return this.ballots.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.ballots.get(id)?.active ?? false;
  }

  isSimple(id: string): boolean {
    return this.ballots.get(id)?.type === 'simple';
  }

  isRanked(id: string): boolean {
    return this.ballots.get(id)?.type === 'ranked';
  }

  isApproval(id: string): boolean {
    return this.ballots.get(id)?.type === 'approval';
  }

  getByType(type: VoteType): Ballot[] {
    return Array.from(this.ballots.values()).filter(b => b.type === type);
  }

  getActiveBallots(): Ballot[] {
    return Array.from(this.ballots.values()).filter(b => b.active);
  }

  getInactiveBallots(): Ballot[] {
    return Array.from(this.ballots.values()).filter(b => !b.active);
  }

  getAllQuestions(): string[] {
    return [...new Set(Array.from(this.ballots.values()).map(b => b.question))];
  }

  getNewest(): Ballot | null {
    const all = Array.from(this.ballots.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Ballot | null {
    const all = Array.from(this.ballots.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.ballots.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.ballots.get(id)?.updated ?? 0;
  }

  getTotalCreated(): number {
    return this.totalCreated;
  }

  getTotalCast(): number {
    return this.totalCast;
  }

  clearAll(): void {
    this.ballots.clear();
    this.counter = 0;
    this.totalCreated = 0;
    this.totalCast = 0;
  }
}

export default VoteEngine;