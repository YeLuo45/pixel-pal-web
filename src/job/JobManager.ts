/**
 * Job Manager
 * thunderbolt-design Job Manager - Submit + Execute + Retry + Stats
 */

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  retries: number;
  maxRetries: number;
  created: number;
  updated: number;
  executed: number;
  hits: number;
  history: JobStatus[];
}

export interface JobStats {
  jobs: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
  totalRetries: number;
  totalExecutions: number;
  avgRetries: number;
}

export class JobManager {
  private jobs: Map<string, Job> = new Map();
  private counter = 0;
  private defaultMaxRetries: number;

  constructor(defaultMaxRetries: number = 3) {
    this.defaultMaxRetries = defaultMaxRetries;
  }

  submit(name: string, maxRetries?: number): string {
    const id = `job-${++this.counter}`;
    this.jobs.set(id, {
      id,
      name,
      status: 'queued',
      retries: 0,
      maxRetries: maxRetries ?? this.defaultMaxRetries,
      created: Date.now(),
      updated: Date.now(),
      executed: 0,
      hits: 0,
      history: ['queued'],
    });
    return id;
  }

  execute(id: string): boolean {
    const j = this.jobs.get(id);
    if (!j) return false;
    if (j.status === 'running') return false;
    if (j.status === 'done') return false;
    j.status = 'running';
    j.updated = Date.now();
    j.executed++;
    j.hits++;
    j.history.push('running');
    j.status = 'done';
    j.history.push('done');
    j.updated = Date.now();
    return true;
  }

  retry(id: string): boolean {
    const j = this.jobs.get(id);
    if (!j) return false;
    if (j.retries >= j.maxRetries) return false;
    if (j.status === 'done') return false;
    j.status = 'queued';
    j.retries++;
    j.updated = Date.now();
    j.history.push('queued');
    return true;
  }

  getStats(): JobStats {
    const all = Array.from(this.jobs.values());
    return {
      jobs: all.length,
      queued: all.filter(j => j.status === 'queued').length,
      running: all.filter(j => j.status === 'running').length,
      done: all.filter(j => j.status === 'done').length,
      failed: all.filter(j => j.status === 'failed').length,
      totalRetries: all.reduce((s, j) => s + j.retries, 0),
      totalExecutions: all.reduce((s, j) => s + j.executed, 0),
      avgRetries: all.length > 0 ? Math.round((all.reduce((s, j) => s + j.retries, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  removeJob(id: string): boolean {
    return this.jobs.delete(id);
  }

  hasJob(id: string): boolean {
    return this.jobs.has(id);
  }

  getCount(): number {
    return this.jobs.size;
  }

  getName(id: string): string | undefined {
    return this.jobs.get(id)?.name;
  }

  getStatus(id: string): JobStatus | undefined {
    return this.jobs.get(id)?.status;
  }

  getRetries(id: string): number {
    return this.jobs.get(id)?.retries ?? 0;
  }

  getMaxRetries(id: string): number {
    return this.jobs.get(id)?.maxRetries ?? 0;
  }

  getExecuted(id: string): number {
    return this.jobs.get(id)?.executed ?? 0;
  }

  getHits(id: string): number {
    return this.jobs.get(id)?.hits ?? 0;
  }

  getHistory(id: string): JobStatus[] {
    return [...(this.jobs.get(id)?.history ?? [])];
  }

  isQueued(id: string): boolean {
    return this.jobs.get(id)?.status === 'queued';
  }

  isRunning(id: string): boolean {
    return this.jobs.get(id)?.status === 'running';
  }

  isDone(id: string): boolean {
    return this.jobs.get(id)?.status === 'done';
  }

  isFailed(id: string): boolean {
    return this.jobs.get(id)?.status === 'failed';
  }

  setStatus(id: string, status: JobStatus): boolean {
    const j = this.jobs.get(id);
    if (!j) return false;
    j.status = status;
    j.history.push(status);
    j.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const j = this.jobs.get(id);
    if (!j) return false;
    j.name = name;
    j.updated = Date.now();
    return true;
  }

  fail(id: string): boolean {
    return this.setStatus(id, 'failed');
  }

  touch(id: string): boolean {
    const j = this.jobs.get(id);
    if (!j) return false;
    j.hits++;
    j.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const j of this.jobs.values()) {
      j.status = 'queued';
      j.retries = 0;
      j.executed = 0;
      j.hits = 0;
      j.history = ['queued'];
    }
  }

  getByName(name: string): Job[] {
    return Array.from(this.jobs.values()).filter(j => j.name === name);
  }

  getByStatus(status: JobStatus): Job[] {
    return Array.from(this.jobs.values()).filter(j => j.status === status);
  }

  getQueuedJobs(): Job[] {
    return this.getByStatus('queued');
  }

  getRunningJobs(): Job[] {
    return this.getByStatus('running');
  }

  getDoneJobs(): Job[] {
    return this.getByStatus('done');
  }

  getFailedJobs(): Job[] {
    return this.getByStatus('failed');
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.jobs.values()).map(j => j.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinRetries(min: number): Job[] {
    return Array.from(this.jobs.values()).filter(j => j.retries >= min);
  }

  getMostRetries(): Job | null {
    const all = Array.from(this.jobs.values());
    if (all.length === 0) return null;
    return all.reduce((max, j) => j.retries > max.retries ? j : max);
  }

  getNewest(): Job | null {
    const all = Array.from(this.jobs.values());
    if (all.length === 0) return null;
    return all.reduce((max, j) => j.created > max.created ? j : max);
  }

  getOldest(): Job | null {
    const all = Array.from(this.jobs.values());
    if (all.length === 0) return null;
    return all.reduce((min, j) => j.created < min.created ? j : min);
  }

  getCreatedAt(id: string): number {
    return this.jobs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.jobs.get(id)?.updated ?? 0;
  }

  getDefaultMaxRetries(): number {
    return this.defaultMaxRetries;
  }

  clearAll(): void {
    this.jobs.clear();
    this.counter = 0;
  }
}

export default JobManager;