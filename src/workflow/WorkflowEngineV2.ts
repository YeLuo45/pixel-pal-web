/**
 * Workflow Engine v2
 * thunderbolt-design Workflow Engine v2 - Flow + State + Event + Track
 */

export interface StateTransition {
  from: string;
  to: string;
  event: string;
}

export interface WorkflowEvent {
  event: string;
  fromState: string;
  toState: string;
  timestamp: number;
}

export class WorkflowEngineV2 {
  private states: Set<string> = new Set();
  private transitions: StateTransition[] = [];
  private currentState: string | null = null;
  private initialState: string | null = null;
  private history: WorkflowEvent[] = [];

  addState(name: string, isInitial = false): void {
    this.states.add(name);
    if (isInitial) {
      this.initialState = name;
      this.currentState = name;
    }
  }

  addTransition(transition: StateTransition): boolean {
    if (!this.states.has(transition.from) || !this.states.has(transition.to)) {
      return false;
    }
    this.transitions.push({ ...transition });
    return true;
  }

  fire(event: string): boolean {
    if (!this.currentState) return false;
    const transition = this.transitions.find(
      t => t.from === this.currentState && t.event === event
    );
    if (!transition) return false;

    const fromState = this.currentState;
    this.currentState = transition.to;
    this.history.push({
      event,
      fromState,
      toState: transition.to,
      timestamp: Date.now(),
    });
    return true;
  }

  getCurrentState(): string | null {
    return this.currentState;
  }

  getHistory(): string[] {
    return this.history.map(h => `${h.fromState}--${h.event}-->${h.toState}`);
  }

  getEventHistory(): WorkflowEvent[] {
    return [...this.history];
  }

  getAllStates(): string[] {
    return [...this.states];
  }

  getAllTransitions(): StateTransition[] {
    return [...this.transitions];
  }

  hasState(name: string): boolean {
    return this.states.has(name);
  }

  getStateCount(): number {
    return this.states.size;
  }

  getTransitionCount(): number {
    return this.transitions.length;
  }

  getTransitionsFrom(state: string): StateTransition[] {
    return this.transitions.filter(t => t.from === state);
  }

  getTransitionsTo(state: string): StateTransition[] {
    return this.transitions.filter(t => t.to === state);
  }

  getEventsForState(state: string): string[] {
    return this.transitions
      .filter(t => t.from === state)
      .map(t => t.event);
  }

  canFire(event: string): boolean {
    if (!this.currentState) return false;
    return this.transitions.some(t => t.from === this.currentState && t.event === event);
  }

  getNextState(event: string): string | null {
    if (!this.currentState) return null;
    const t = this.transitions.find(t => t.from === this.currentState && t.event === event);
    return t?.to ?? null;
  }

  isFinalState(state: string): boolean {
    return this.transitions.filter(t => t.from === state).length === 0;
  }

  getFinalStates(): string[] {
    return [...this.states].filter(s => this.isFinalState(s));
  }

  isInFinalState(): boolean {
    if (!this.currentState) return false;
    return this.isFinalState(this.currentState);
  }

  reset(): void {
    this.currentState = this.initialState;
    this.history = [];
  }

  setInitialState(name: string): boolean {
    if (!this.states.has(name)) return false;
    this.initialState = name;
    this.currentState = name;
    this.history = [];
    return true;
  }

  getInitialState(): string | null {
    return this.initialState;
  }

  removeState(name: string): boolean {
    this.transitions = this.transitions.filter(t => t.from !== name && t.to !== name);
    if (this.currentState === name) this.currentState = null;
    if (this.initialState === name) this.initialState = null;
    return this.states.delete(name);
  }

  removeTransition(from: string, event: string): boolean {
    const idx = this.transitions.findIndex(t => t.from === from && t.event === event);
    if (idx === -1) return false;
    this.transitions.splice(idx, 1);
    return true;
  }

  getEventCount(): number {
    return this.history.length;
  }

  clearAll(): void {
    this.states.clear();
    this.transitions = [];
    this.currentState = null;
    this.initialState = null;
    this.history = [];
  }
}

export default WorkflowEngineV2;