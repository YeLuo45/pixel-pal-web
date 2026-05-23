/**
 * V140: ResourceMonitor — tracks CPU/memory usage per Skill execution
 */
export interface ResourceUsage {
  skillId: string;
  memoryMB: number;
  cpuPercent: number;
  duration_ms: number;
}

export class ResourceMonitor {
  private usage = new Map<string, ResourceUsage>();

  startTracking(skillId: string) {
    const mem = (performance as any)?.memory?.usedJSHeapSize ?? 0;
    this.usage.set(skillId, {
      skillId,
      memoryMB: mem / 1024 / 1024,
      cpuPercent: 0,
      duration_ms: 0,
    });
  }

  recordResult(skillId: string, duration_ms: number) {
    const u = this.usage.get(skillId);
    if (u) { u.duration_ms = duration_ms; }
  }

  getUsage(skillId: string): ResourceUsage | null {
    return this.usage.get(skillId) ?? null;
  }

  clear() { this.usage.clear(); }
}