/**
 * State Machine
 * thunderbolt-design State Machine - Define + Transition + Guard + Track
 */

export interface FSMTransition {
  from: string;
  to: string;
  event: string;
  guard?: () => boolean;
}

export interface FSMState {
  name: string;
  isInitial: boolean;
  isFinal: boolean;
}

export interface FSMHistoryEntry {
  from: string;
  to: string;
  event: string;
  timestamp: number;
}

export class StateMachine {
  private states: Map<string, FSMState> = new Map();
  private transitions: FSMTransition[] = [];
  private currentState: string | null = null;
  private initialState: string | null = null;
  private history: FSMHistoryEntry[] = [];

  addState(name: string, opts: { initial?: boolean; final?: boolean } = {}): void {
    this.states.set(name, { name, isInitial: opts.initial ?? false, isFinal: opts.final ?? false });
    if (opts.initial) {
      this.initialState = name;
      this.currentState = name;
    }
  }

  addTransition(transition: FSMTransition): boolean {
    if (!this.states.has(transition.from) || !this.states.has(transition.to)) {
      return false;
    }
    this.transitions.push({ ...transition });
    return true;
  }

  fire(event: string): boolean {
    if (!this.currentState) return false;
    const matching = this.transitions.find(
      t => t.from === this.currentState && t.event === event
    );
    if (!matching) return false;
    if (matching.guard && !matching.guard()) return false;
    const fromState = this.currentState;
    this.currentState = matching.to;
    this.history.push({ from: fromState, to: matching.to, event, timestamp: Date.now() });
    return true;
  }

  getCurrentState(): string | null {
    return this.currentState;
  }

  getHistory(): FSMHistoryEntry[] {
    return [...this.history];
  }

  getState(name: string): FSMState | undefined {
    return this.states.get(name);
  }

  getAllStates(): FSMState[] {
    return Array.from(this.states.values());
  }

  getAllTransitions(): FSMTransition[] {
    return [...this.transitions];
  }

  hasState(name: string): boolean {
    return this.states.has(name);
  }

  isInitial(name: string): boolean {
    return this.states.get(name)?.isInitial ?? false;
  }

  isFinal(name: string): boolean {
    return this.states.get(name)?.isFinal ?? false;
  }

  isInFinalState(): boolean {
    if (!this.currentState) return false;
    return this.states.get(this.currentState)?.isFinal ?? false;
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

  getTransitionsFrom(state: string): FSMTransition[] {
    return this.transitions.filter(t => t.from === state);
  }

  getTransitionsTo(state: string): FSMTransition[] {
    return this.transitions.filter(t => t.to === state);
  }

  getEventsForState(state: string): string[] {
    return this.transitions.filter(t => t.from === state).map(t => t.event);
  }

  reset(): void {
    this.currentState = this.initialState;
    this.history = [];
  }

  setInitialState(name: string): boolean {
    if (!this.states.has(name)) return false;
    if (this.initialState) {
      const prev = this.states.get(this.initialState);
      if (prev) prev.isInitial = false;
    }
    const state = this.states.get(name)!;
    state.isInitial = true;
    this.initialState = name;
    this.currentState = name;
    this.history = [];
    return true;
  }

  getInitialState(): string | null {
    return this.initialState;
  }

  getStateCount(): number {
    return this.states.size;
  }

  getTransitionCount(): number {
    return this.transitions.length;
  }

  getFinalStates(): string[] {
    return Array.from(this.states.values()).filter(s => s.isFinal).map(s => s.name);
  }

  getInitialStates(): string[] {
    return Array.from(this.states.values()).filter(s => s.isInitial).map(s => s.name);
  }

  removeState(name: string): boolean {
    if (!this.states.has(name)) return false;
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

  getHistoryCount(): number {
    return this.history.length;
  }

  getHistoryByEvent(event: string): FSMHistoryEntry[] {
    return this.history.filter(h => h.event === event);
  }

  getVisitedStates(): string[] {
    return [...new Set(this.history.map(h => h.to))];
  }

  getTransitionFrequency(from: string, to: string): number {
    return this.history.filter(h => h.from === from && h.to === to).length;
  }

  clearAll(): void {
    this.states.clear();
    this.transitions = [];
    this.currentState = null;
    this.initialState = null;
    this.history = [];
  }
}

export default StateMachine;