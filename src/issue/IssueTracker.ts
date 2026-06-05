/**
 * Issue Tracker
 * claude-code-design Issue Tracker - Create + Classify + Resolve + Report
 */

export type IssueCategory = 'bug' | 'feature' | 'task';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  created: number;
  updated: number;
}

export interface IssueReport {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byCategory: Record<IssueCategory, number>;
  byPriority: Record<IssuePriority, number>;
}

export class IssueTracker {
  private issues: Map<string, Issue> = new Map();
  private counter = 0;

  create(issue: Omit<Issue, 'id' | 'status' | 'created' | 'updated'>): string {
    const id = `issue-${++this.counter}`;
    const now = Date.now();
    this.issues.set(id, {
      ...issue,
      id,
      status: 'open',
      created: now,
      updated: now,
    });
    return id;
  }

  classify(issueId: string, category: IssueCategory): boolean {
    const issue = this.issues.get(issueId);
    if (!issue) return false;
    issue.category = category;
    issue.updated = Date.now();
    return true;
  }

  resolve(issueId: string): boolean {
    const issue = this.issues.get(issueId);
    if (!issue) return false;
    issue.status = 'resolved';
    issue.updated = Date.now();
    return true;
  }

  report(): IssueReport {
    const all = Array.from(this.issues.values());
    const byCategory: Record<IssueCategory, number> = { bug: 0, feature: 0, task: 0 };
    const byPriority: Record<IssuePriority, number> = { low: 0, medium: 0, high: 0 };
    for (const i of all) {
      byCategory[i.category]++;
      byPriority[i.priority]++;
    }
    return {
      total: all.length,
      open: all.filter(i => i.status === 'open').length,
      inProgress: all.filter(i => i.status === 'in_progress').length,
      resolved: all.filter(i => i.status === 'resolved').length,
      closed: all.filter(i => i.status === 'closed').length,
      byCategory,
      byPriority,
    };
  }

  getIssue(id: string): Issue | undefined {
    return this.issues.get(id);
  }

  getAllIssues(): Issue[] {
    return Array.from(this.issues.values());
  }

  removeIssue(id: string): boolean {
    return this.issues.delete(id);
  }

  hasIssue(id: string): boolean {
    return this.issues.has(id);
  }

  getCount(): number {
    return this.issues.size;
  }

  setStatus(id: string, status: IssueStatus): boolean {
    const issue = this.issues.get(id);
    if (!issue) return false;
    issue.status = status;
    issue.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: IssuePriority): boolean {
    const issue = this.issues.get(id);
    if (!issue) return false;
    issue.priority = priority;
    issue.updated = Date.now();
    return true;
  }

  getByStatus(status: IssueStatus): Issue[] {
    return Array.from(this.issues.values()).filter(i => i.status === status);
  }

  getByCategory(category: IssueCategory): Issue[] {
    return Array.from(this.issues.values()).filter(i => i.category === category);
  }

  getByPriority(priority: IssuePriority): Issue[] {
    return Array.from(this.issues.values()).filter(i => i.priority === priority);
  }

  getOpen(): Issue[] {
    return this.getByStatus('open');
  }

  getInProgress(): Issue[] {
    return this.getByStatus('in_progress');
  }

  getResolved(): Issue[] {
    return this.getByStatus('resolved');
  }

  getClosed(): Issue[] {
    return this.getByStatus('closed');
  }

  close(id: string): boolean {
    return this.setStatus(id, 'closed');
  }

  start(id: string): boolean {
    return this.setStatus(id, 'in_progress');
  }

  reopen(id: string): boolean {
    return this.setStatus(id, 'open');
  }

  isOpen(id: string): boolean {
    return this.issues.get(id)?.status === 'open';
  }

  isInProgress(id: string): boolean {
    return this.issues.get(id)?.status === 'in_progress';
  }

  isResolved(id: string): boolean {
    return this.issues.get(id)?.status === 'resolved';
  }

  isClosed(id: string): boolean {
    return this.issues.get(id)?.status === 'closed';
  }

  getCreatedAt(id: string): number {
    return this.issues.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.issues.get(id)?.updated ?? 0;
  }

  getResolutionRate(): number {
    const all = Array.from(this.issues.values());
    if (all.length === 0) return 0;
    const resolved = all.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    return Math.round((resolved / all.length) * 100) / 100;
  }

  clearAll(): void {
    this.issues.clear();
    this.counter = 0;
  }
}

export default IssueTracker;