/**
 * Voice Engine
 * chatdev-design Voice Engine - Join + Leave + SetState + StartSpeaking + StopSpeaking + Stats
 */

export type VoiceState = 'idle' | 'speaking' | 'muted' | 'deafened';

export interface Voice {
  id: string;
  user: string;
  state: VoiceState;
  speaking: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: VoiceState[];
}

export interface VO2Stats {
  voices: number;
  speaking: number;
  muted: number;
  deafened: number;
  idle: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueUsers: number;
  uniqueStates: number;
  speakingRatio: number;
}

export class VoiceEngine {
  private voices: Map<string, Voice> = new Map();
  private counter = 0;
  private totalStateChanges = 0;

  join(user: string): string {
    const id = `vo2-${++this.counter}`;
    this.voices.set(id, {
      id,
      user,
      state: 'idle',
      speaking: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['idle'],
    });
    return id;
  }

  leave(id: string): boolean {
    return this.voices.delete(id);
  }

  setState(id: string, state: VoiceState): boolean {
    const v = this.voices.get(id);
    if (!v) return false;
    if (!v.active) return false;
    v.state = state;
    v.history.push(state);
    v.updated = Date.now();
    v.hits++;
    this.totalStateChanges++;
    if (state === 'speaking') {
      v.speaking = true;
    } else {
      v.speaking = false;
    }
    return true;
  }

  startSpeaking(id: string): boolean {
    const v = this.voices.get(id);
    if (!v) return false;
    if (!v.active) return false;
    v.speaking = true;
    v.state = 'speaking';
    v.history.push('speaking');
    v.updated = Date.now();
    v.hits++;
    this.totalStateChanges++;
    return true;
  }

  stopSpeaking(id: string): boolean {
    const v = this.voices.get(id);
    if (!v) return false;
    if (!v.active) return false;
    v.speaking = false;
    v.state = 'idle';
    v.history.push('idle');
    v.updated = Date.now();
    v.hits++;
    this.totalStateChanges++;
    return true;
  }

  resetAll(): void {
    for (const v of this.voices.values()) {
      v.state = 'idle';
      v.speaking = false;
      v.hits = 0;
      v.history = ['idle'];
      v.active = true;
    }
    this.totalStateChanges = 0;
  }

  getStats(): VO2Stats {
    const all = Array.from(this.voices.values());
    return {
      voices: all.length,
      speaking: all.filter(v => v.state === 'speaking').length,
      muted: all.filter(v => v.state === 'muted').length,
      deafened: all.filter(v => v.state === 'deafened').length,
      idle: all.filter(v => v.state === 'idle').length,
      active: all.filter(v => v.active).length,
      inactive: all.filter(v => !v.active).length,
      totalHits: all.reduce((s, v) => s + v.hits, 0),
      uniqueUsers: new Set(all.map(v => v.user)).size,
      uniqueStates: new Set(all.map(v => v.state)).size,
      speakingRatio: all.length > 0 ? Math.round((all.filter(v => v.speaking).length / all.length) * 100) / 100 : 0,
    };
  }

  getVoice(id: string): Voice | undefined {
    return this.voices.get(id);
  }

  getAllVoices(): Voice[] {
    return Array.from(this.voices.values());
  }

  removeVoice(id: string): boolean {
    return this.voices.delete(id);
  }

  hasVoice(id: string): boolean {
    return this.voices.has(id);
  }

  getCount(): number {
    return this.voices.size;
  }

  getUser(id: string): string | undefined {
    return this.voices.get(id)?.user;
  }

  getState(id: string): VoiceState | undefined {
    return this.voices.get(id)?.state;
  }

  isSpeaking(id: string): boolean {
    return this.voices.get(id)?.speaking ?? false;
  }

  getHistory(id: string): VoiceState[] {
    return [...(this.voices.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.voices.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.voices.get(id)?.active ?? false;
  }

  isMuted(id: string): boolean {
    return this.voices.get(id)?.state === 'muted';
  }

  isDeafened(id: string): boolean {
    return this.voices.get(id)?.state === 'deafened';
  }

  isIdle(id: string): boolean {
    return this.voices.get(id)?.state === 'idle';
  }

  setActive(id: string, active: boolean): boolean {
    const v = this.voices.get(id);
    if (!v) return false;
    v.active = active;
    v.updated = Date.now();
    return true;
  }

  setUser(id: string, user: string): boolean {
    const v = this.voices.get(id);
    if (!v) return false;
    v.user = user;
    v.updated = Date.now();
    return true;
  }

  getByUser(user: string): Voice[] {
    return Array.from(this.voices.values()).filter(v => v.user === user);
  }

  getSpeakingVoices(): Voice[] {
    return Array.from(this.voices.values()).filter(v => v.state === 'speaking');
  }

  getMutedVoices(): Voice[] {
    return Array.from(this.voices.values()).filter(v => v.state === 'muted');
  }

  getDeafenedVoices(): Voice[] {
    return Array.from(this.voices.values()).filter(v => v.state === 'deafened');
  }

  getIdleVoices(): Voice[] {
    return Array.from(this.voices.values()).filter(v => v.state === 'idle');
  }

  getActiveVoices(): Voice[] {
    return Array.from(this.voices.values()).filter(v => v.active);
  }

  getInactiveVoices(): Voice[] {
    return Array.from(this.voices.values()).filter(v => !v.active);
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.voices.values()).map(v => v.user))];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  getNewest(): Voice | null {
    const all = Array.from(this.voices.values());
    if (all.length === 0) return null;
    return all.reduce((max, v) => v.created > max.created ? v : max);
  }

  getOldest(): Voice | null {
    const all = Array.from(this.voices.values());
    if (all.length === 0) return null;
    return all.reduce((min, v) => v.created < min.created ? v : min);
  }

  getCreatedAt(id: string): number {
    return this.voices.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.voices.get(id)?.updated ?? 0;
  }

  getTotalStateChanges(): number {
    return this.totalStateChanges;
  }

  clearAll(): void {
    this.voices.clear();
    this.counter = 0;
    this.totalStateChanges = 0;
  }
}

export default VoiceEngine;