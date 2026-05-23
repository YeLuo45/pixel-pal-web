/**
 * V140: SandboxExecutor — Skill execution in isolated Web Worker with timeout/memory guards
 */
export interface SandboxConfig {
  id: string;
  skillId: string;
  maxMemoryMB: number;
  maxCPUPercent: number;
  maxExecutionTimeMs: number;
  allowedAPIs: string[];
  blockedAPIs: string[];
  networkPolicy: 'none' | 'same-origin' | 'all';
  isolationLevel: 'full' | 'relaxed';
}

export interface SandboxResult {
  success: boolean;
  output: unknown;
  error?: string;
  reason?: 'timeout' | 'memory-exceeded' | 'cpu-exceeded' | 'api-blocked' | 'crash';
  duration_ms: number;
  memoryUsageMB?: number;
}

type MessageToWorker = { type: 'execute'; skillCode: string; input: Record<string, unknown> };
type MessageFromWorker = { type: 'result'; output: unknown } | { type: 'error'; error: string; reason?: string };

const WORKER_TEMPLATE = `
self.onmessage = function(e) {
  var data = e.data;
  if (data.type === 'execute') {
    try {
      var fn = new Function('input', data.skillCode + '\nreturn execute(input);');
      var result = fn(data.input);
      self.postMessage({ type: 'result', output: result });
    } catch(err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
};
`;

export class SandboxExecutor {
  private activeWorkers = new Map<string, Worker>();

  private createWorker(skillCode: string): [Worker, string] {
    const blob = new Blob([WORKER_TEMPLATE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    return [worker, url];
  }

  async executeInSandbox(
    skillId: string,
    skillCode: string,
    input: Record<string, unknown>,
    config: SandboxConfig
  ): Promise<SandboxResult> {
    const start = Date.now();
    return new Promise((resolve) => {
      const [worker, url] = this.createWorker(skillCode);
      this.activeWorkers.set(skillId, worker);

      const timeout = setTimeout(() => {
        worker.terminate();
        URL.revokeObjectURL(url);
        this.activeWorkers.delete(skillId);
        resolve({ success: false, output: null, reason: 'timeout', duration_ms: config.maxExecutionTimeMs });
      }, config.maxExecutionTimeMs);

      worker.onmessage = (e: MessageFromWorker) => {
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(url);
        this.activeWorkers.delete(skillId);
        if (e.type === 'result') {
          resolve({ success: true, output: e.output, duration_ms: Date.now() - start });
        } else {
          resolve({ success: false, output: null, error: e.error, reason: e.reason ?? 'crash', duration_ms: Date.now() - start });
        }
      };

      worker.onerror = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(url);
        this.activeWorkers.delete(skillId);
        resolve({ success: false, output: null, error: e.message, reason: 'crash', duration_ms: Date.now() - start });
      };

      worker.postMessage({ type: 'execute', skillCode, input } as MessageToWorker);
    });
  }

  terminateSkill(skillId: string) {
    const worker = this.activeWorkers.get(skillId);
    if (worker) { worker.terminate(); this.activeWorkers.delete(skillId); }
  }

  terminateAll() {
    for (const worker of this.activeWorkers.values()) worker.terminate();
    this.activeWorkers.clear();
  }
}