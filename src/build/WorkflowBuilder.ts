/**
 * Workflow Builder
 * chatdev-design Workflow Builder - AddStep + Connect + Validate + Compile
 */

export interface Step {
  id: string;
  name: string;
  action: string;
  next: string[];
}

export interface WorkflowDef {
  steps: Step[];
  start: string;
  end: string[];
}

export class WorkflowBuilder {
  private steps: Map<string, Step> = new Map();

  addStep(step: Omit<Step, 'next'>): boolean {
    if (this.steps.has(step.id)) return false;
    this.steps.set(step.id, { ...step, next: [] });
    return true;
  }

  connect(from: string, to: string): boolean {
    const fromStep = this.steps.get(from);
    const toStep = this.steps.get(to);
    if (!fromStep || !toStep) return false;
    if (!fromStep.next.includes(to)) {
      fromStep.next.push(to);
    }
    return true;
  }

  validate(workflow: WorkflowDef): boolean {
    const stepIds = new Set(workflow.steps.map(s => s.id));
    if (!stepIds.has(workflow.start)) return false;
    for (const end of workflow.end) {
      if (!stepIds.has(end)) return false;
    }
    for (const step of workflow.steps) {
      for (const next of step.next) {
        if (!stepIds.has(next)) return false;
      }
    }
    return true;
  }

  compile(workflow: WorkflowDef): string {
    const lines: string[] = [];
    lines.push(`workflow(${workflow.start}) {`);
    for (const step of workflow.steps) {
      lines.push(`  step ${step.id}: ${step.action} -> [${step.next.join(', ')}]`);
    }
    lines.push(`  end: [${workflow.end.join(', ')}]`);
    lines.push('}');
    return lines.join('\n');
  }

  getStep(id: string): Step | undefined {
    return this.steps.get(id);
  }

  getAllSteps(): Step[] {
    return Array.from(this.steps.values());
  }

  removeStep(id: string): boolean {
    return this.steps.delete(id);
  }

  hasStep(id: string): boolean {
    return this.steps.has(id);
  }

  getCount(): number {
    return this.steps.size;
  }

  getName(id: string): string | undefined {
    return this.steps.get(id)?.name;
  }

  getAction(id: string): string | undefined {
    return this.steps.get(id)?.action;
  }

  getNext(id: string): string[] {
    return [...(this.steps.get(id)?.next ?? [])];
  }

  hasConnection(from: string, to: string): boolean {
    return this.steps.get(from)?.next.includes(to) ?? false;
  }

  getNextCount(id: string): number {
    return this.steps.get(id)?.next.length ?? 0;
  }

  disconnect(from: string, to: string): boolean {
    const fromStep = this.steps.get(from);
    if (!fromStep) return false;
    const idx = fromStep.next.indexOf(to);
    if (idx === -1) return false;
    fromStep.next.splice(idx, 1);
    return true;
  }

  getIncoming(id: string): string[] {
    return Array.from(this.steps.values())
      .filter(s => s.next.includes(id))
      .map(s => s.id);
  }

  getIncomingCount(id: string): number {
    return this.getIncoming(id).length;
  }

  getRoots(): string[] {
    return Array.from(this.steps.values())
      .filter(s => this.getIncoming(s.id).length === 0)
      .map(s => s.id);
  }

  getLeaves(): string[] {
    return Array.from(this.steps.values())
      .filter(s => s.next.length === 0)
      .map(s => s.id);
  }

  setAction(id: string, action: string): boolean {
    const step = this.steps.get(id);
    if (!step) return false;
    step.action = action;
    return true;
  }

  setName(id: string, name: string): boolean {
    const step = this.steps.get(id);
    if (!step) return false;
    step.name = name;
    return true;
  }

  build(): WorkflowDef {
    const steps = this.getAllSteps();
    const roots = this.getRoots();
    const leaves = this.getLeaves();
    return {
      steps,
      start: roots[0] ?? '',
      end: leaves,
    };
  }

  export(): string {
    const workflow = this.build();
    return this.compile(workflow);
  }

  clearAll(): void {
    this.steps.clear();
  }
}

export default WorkflowBuilder;