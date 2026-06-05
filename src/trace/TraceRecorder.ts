/**
 * Trace Recorder
 * claude-code-design Trace Recorder - Start + End + GetTrace + Stats
 */

export type TraceStatus = 'ok' | 'error';

export interface Trace {
  id: string;
  span: string;
  parent: string | null;
  start: number;
  end: number;
  duration: number;
  status: TraceStatus;
  metadata: Record<string, unknown>;
  ended: boolean;
}

export interface TraceStats {
  traces: number;
  avgDuration: number;
  errors: number;
  okCount: number;
  maxDuration: number;
  minDuration: number;
}

export class TraceRecorder {
  private traces: Map<string, Trace> = new Map();
  private counter = 0;

  start(span: string, parent: string | null = null): string {
    const id = `tr-${++this.counter}`;
    this.traces.set(id, {
      id,
      span,
      parent,
      start: Date.now(),
      end: 0,
      duration: 0,
      status: 'ok',
      metadata: {},
      ended: false,
    });
    return id;
  }

  end(id: string, status: TraceStatus = 'ok'): number {
    const t = this.traces.get(id);
    if (!t) return 0;
    t.end = Date.now();
    t.duration = t.end - t.start;
    t.status = status;
    t.ended = true;
    return t.duration;
  }

  getTrace(id: string): Trace | null {
    return this.traces.get(id) ?? null;
  }

  getStats(): TraceStats {
    const all = Array.from(this.traces.values()).filter(t => t.ended);
    const durations = all.map(t => t.duration);
    return {
      traces: this.traces.size,
      avgDuration: all.length > 0 ? Math.round((durations.reduce((s, d) => s + d, 0) / all.length) * 100) / 100 : 0,
      errors: all.filter(t => t.status === 'error').length,
      okCount: all.filter(t => t.status === 'ok').length,
      maxDuration: all.length > 0 ? Math.max(...durations) : 0,
      minDuration: all.length > 0 ? Math.min(...durations) : 0,
    };
  }

  getAllTraces(): Trace[] {
    return Array.from(this.traces.values());
  }

  getActiveTraces(): Trace[] {
    return Array.from(this.traces.values()).filter(t => !t.ended);
  }

  getCompletedTraces(): Trace[] {
    return Array.from(this.traces.values()).filter(t => t.ended);
  }

  removeTrace(id: string): boolean {
    return this.traces.delete(id);
  }

  hasTrace(id: string): boolean {
    return this.traces.has(id);
  }

  getCount(): number {
    return this.traces.size;
  }

  getActiveCount(): number {
    return this.getActiveTraces().length;
  }

  getCompletedCount(): number {
    return this.getCompletedTraces().length;
  }

  getSpan(id: string): string | undefined {
    return this.traces.get(id)?.span;
  }

  getParent(id: string): string | null {
    return this.traces.get(id)?.parent ?? null;
  }

  getStatus(id: string): TraceStatus | undefined {
    return this.traces.get(id)?.status;
  }

  getDuration(id: string): number {
    return this.traces.get(id)?.duration ?? 0;
  }

  getStart(id: string): number {
    return this.traces.get(id)?.start ?? 0;
  }

  getEnd(id: string): number {
    return this.traces.get(id)?.end ?? 0;
  }

  isActive(id: string): boolean {
    return this.traces.get(id)?.ended === false;
  }

  isCompleted(id: string): boolean {
    return this.traces.get(id)?.ended === true;
  }

  isOk(id: string): boolean {
    return this.traces.get(id)?.status === 'ok';
  }

  isError(id: string): boolean {
    return this.traces.get(id)?.status === 'error';
  }

  setMetadata(id: string, key: string, value: unknown): boolean {
    const t = this.traces.get(id);
    if (!t) return false;
    t.metadata[key] = value;
    return true;
  }

  getMetadata(id: string, key: string): unknown {
    return this.traces.get(id)?.metadata[key];
  }

  getAllMetadata(id: string): Record<string, unknown> {
    return { ...(this.traces.get(id)?.metadata ?? {}) };
  }

  getChildren(parentId: string): Trace[] {
    return Array.from(this.traces.values()).filter(t => t.parent === parentId);
  }

  getChildrenCount(parentId: string): number {
    return this.getChildren(parentId).length;
  }

  getRoots(): Trace[] {
    return Array.from(this.traces.values()).filter(t => t.parent === null);
  }

  getRootsCount(): number {
    return this.getRoots().length;
  }

  getBySpan(span: string): Trace[] {
    return Array.from(this.traces.values()).filter(t => t.span === span);
  }

  getByStatus(status: TraceStatus): Trace[] {
    return Array.from(this.traces.values()).filter(t => t.status === status);
  }

  getOkTraces(): Trace[] {
    return this.getByStatus('ok');
  }

  getErrorTraces(): Trace[] {
    return this.getByStatus('error');
  }

  getAllSpans(): string[] {
    return [...new Set(Array.from(this.traces.values()).map(t => t.span))];
  }

  getSpanCount(): number {
    return this.getAllSpans().length;
  }

  getSlowestTrace(): Trace | null {
    const completed = this.getCompletedTraces();
    if (completed.length === 0) return null;
    return completed.reduce((max, t) => t.duration > max.duration ? t : max);
  }

  getFastestTrace(): Trace | null {
    const completed = this.getCompletedTraces();
    if (completed.length === 0) return null;
    return completed.reduce((min, t) => t.duration < min.duration ? t : min);
  }

  clearAll(): void {
    this.traces.clear();
    this.counter = 0;
  }
}

export default TraceRecorder;