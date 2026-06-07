/**
 * Perception Engine
 * generic-agent-design Perception Engine - Sense + Perceive + Forget + Stats
 */

export type SenseType = 'visual' | 'audio' | 'touch' | 'taste' | 'smell';

export interface Sensation {
  id: string;
  type: SenseType;
  stimulus: string;
  intensity: number;
  perceived: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PceStats {
  sensations: number;
  totalSensed: number;
  totalPerceived: number;
  totalForgotten: number;
  visual: number;
  audio: number;
  touch: number;
  taste: number;
  smell: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalIntensity: number;
  avgIntensity: number;
  maxIntensity: number;
  minIntensity: number;
  totalPerceived2: number;
}

export class PerceptionEngine {
  private sensations: Map<string, Sensation> = new Map();
  private counter = 0;
  private totalSensed = 0;
  private totalPerceived = 0;
  private totalForgotten = 0;
  private totalIntensity = 0;

  sense(type: SenseType, stimulus: string, intensity: number): string {
    const id = `pce-${++this.counter}`;
    this.sensations.set(id, {
      id,
      type,
      stimulus,
      intensity: Math.max(0, Math.min(10, intensity)),
      perceived: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSensed++;
    this.totalIntensity += intensity;
    return id;
  }

  perceive(id: string): boolean {
    const s = this.sensations.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.perceived = true;
    s.updated = Date.now();
    s.hits++;
    this.totalPerceived++;
    return true;
  }

  forget(id: string): boolean {
    const s = this.sensations.get(id);
    if (!s) return false;
    s.active = false;
    s.updated = Date.now();
    this.totalForgotten++;
    return true;
  }

  remove(id: string): boolean {
    return this.sensations.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.sensations.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setStimulus(id: string, stimulus: string): boolean {
    const s = this.sensations.get(id);
    if (!s) return false;
    s.stimulus = stimulus;
    s.updated = Date.now();
    return true;
  }

  setIntensity(id: string, intensity: number): boolean {
    const s = this.sensations.get(id);
    if (!s) return false;
    s.intensity = Math.max(0, Math.min(10, intensity));
    s.updated = Date.now();
    return true;
  }

  setType(id: string, type: SenseType): boolean {
    const s = this.sensations.get(id);
    if (!s) return false;
    s.type = type;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.sensations.values()) {
      s.perceived = false;
      s.active = true;
      s.hits = 0;
    }
    this.totalSensed = 0;
    this.totalPerceived = 0;
    this.totalForgotten = 0;
    this.totalIntensity = 0;
  }

  getStats(): PceStats {
    const all = Array.from(this.sensations.values());
    const intArr = all.map(s => s.intensity);
    return {
      sensations: all.length,
      totalSensed: this.totalSensed,
      totalPerceived: this.totalPerceived,
      totalForgotten: this.totalForgotten,
      visual: all.filter(s => s.type === 'visual').length,
      audio: all.filter(s => s.type === 'audio').length,
      touch: all.filter(s => s.type === 'touch').length,
      taste: all.filter(s => s.type === 'taste').length,
      smell: all.filter(s => s.type === 'smell').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      totalIntensity: this.totalIntensity,
      avgIntensity: all.length > 0 ? Math.round((intArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxIntensity: intArr.length > 0 ? Math.max(...intArr) : 0,
      minIntensity: intArr.length > 0 ? Math.min(...intArr) : 0,
      totalPerceived2: all.filter(s => s.perceived).length,
    };
  }

  getSensation(id: string): Sensation | undefined {
    return this.sensations.get(id);
  }

  getAllSensations(): Sensation[] {
    return Array.from(this.sensations.values());
  }

  hasSensation(id: string): boolean {
    return this.sensations.has(id);
  }

  getCount(): number {
    return this.sensations.size;
  }

  getType(id: string): SenseType | undefined {
    return this.sensations.get(id)?.type;
  }

  getStimulus(id: string): string | undefined {
    return this.sensations.get(id)?.stimulus;
  }

  getIntensity(id: string): number {
    return this.sensations.get(id)?.intensity ?? 0;
  }

  getHits(id: string): number {
    return this.sensations.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.sensations.get(id)?.active ?? false;
  }

  isPerceived(id: string): boolean {
    return this.sensations.get(id)?.perceived ?? false;
  }

  isVisual(id: string): boolean {
    return this.sensations.get(id)?.type === 'visual';
  }

  isAudio(id: string): boolean {
    return this.sensations.get(id)?.type === 'audio';
  }

  isTouch(id: string): boolean {
    return this.sensations.get(id)?.type === 'touch';
  }

  isTaste(id: string): boolean {
    return this.sensations.get(id)?.type === 'taste';
  }

  isSmell(id: string): boolean {
    return this.sensations.get(id)?.type === 'smell';
  }

  getByType(type: SenseType): Sensation[] {
    return Array.from(this.sensations.values()).filter(s => s.type === type);
  }

  getActiveSensations(): Sensation[] {
    return Array.from(this.sensations.values()).filter(s => s.active);
  }

  getInactiveSensations(): Sensation[] {
    return Array.from(this.sensations.values()).filter(s => !s.active);
  }

  getPerceivedSensations(): Sensation[] {
    return Array.from(this.sensations.values()).filter(s => s.perceived);
  }

  getNewest(): Sensation | null {
    const all = Array.from(this.sensations.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Sensation | null {
    const all = Array.from(this.sensations.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.sensations.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.sensations.get(id)?.updated ?? 0;
  }

  getTotalSensed(): number {
    return this.totalSensed;
  }

  getTotalPerceived(): number {
    return this.totalPerceived;
  }

  getTotalForgotten(): number {
    return this.totalForgotten;
  }

  clearAll(): void {
    this.sensations.clear();
    this.counter = 0;
    this.totalSensed = 0;
    this.totalPerceived = 0;
    this.totalForgotten = 0;
    this.totalIntensity = 0;
  }
}

export default PerceptionEngine;