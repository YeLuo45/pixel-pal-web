/**
 * Voice Engine
 * chatdev-design Voice Engine - Speak + Mute + Listen + Stats
 */

export type VoiceMode = 'loud' | 'normal' | 'whisper';

export interface VoiceMessage {
  id: string;
  speaker: string;
  text: string;
  mode: VoiceMode;
  muted: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface VceStats {
  messages: number;
  totalSpoken: number;
  totalMuted: number;
  totalListened: number;
  loud: number;
  normal: number;
  whisper: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSpeakers: number;
  uniqueTexts: number;
  totalTextLen: number;
  avgTextLen: number;
  maxTextLen: number;
  minTextLen: number;
}

export class VoiceEngine {
  private messages: Map<string, VoiceMessage> = new Map();
  private counter = 0;
  private totalSpoken = 0;
  private totalMuted = 0;
  private totalListened = 0;
  private totalTextLen = 0;

  speak(speaker: string, text: string, mode: VoiceMode = 'normal'): string {
    const id = `vce-${++this.counter}`;
    this.messages.set(id, {
      id,
      speaker,
      text,
      mode,
      muted: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSpoken++;
    this.totalTextLen += text.length;
    return id;
  }

  mute(id: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.muted = true;
    m.updated = Date.now();
    this.totalMuted++;
    return true;
  }

  listen(id: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    if (m.muted) return false;
    if (!m.active) return false;
    m.updated = Date.now();
    m.hits++;
    this.totalListened++;
    return true;
  }

  remove(id: string): boolean {
    return this.messages.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setSpeaker(id: string, speaker: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.speaker = speaker;
    m.updated = Date.now();
    return true;
  }

  setText(id: string, text: string): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.text = text;
    m.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: VoiceMode): boolean {
    const m = this.messages.get(id);
    if (!m) return false;
    m.mode = mode;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.messages.values()) {
      m.muted = false;
      m.active = true;
      m.hits = 0;
    }
    this.totalSpoken = 0;
    this.totalMuted = 0;
    this.totalListened = 0;
    this.totalTextLen = 0;
  }

  getStats(): VceStats {
    const all = Array.from(this.messages.values());
    const textLens = all.map(m => m.text.length);
    return {
      messages: all.length,
      totalSpoken: this.totalSpoken,
      totalMuted: this.totalMuted,
      totalListened: this.totalListened,
      loud: all.filter(m => m.mode === 'loud').length,
      normal: all.filter(m => m.mode === 'normal').length,
      whisper: all.filter(m => m.mode === 'whisper').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueSpeakers: new Set(all.map(m => m.speaker)).size,
      uniqueTexts: new Set(all.map(m => m.text)).size,
      totalTextLen: this.totalTextLen,
      avgTextLen: all.length > 0 ? Math.round((textLens.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTextLen: textLens.length > 0 ? Math.max(...textLens) : 0,
      minTextLen: textLens.length > 0 ? Math.min(...textLens) : 0,
    };
  }

  getMessage(id: string): VoiceMessage | undefined {
    return this.messages.get(id);
  }

  getAllMessages(): VoiceMessage[] {
    return Array.from(this.messages.values());
  }

  hasMessage(id: string): boolean {
    return this.messages.has(id);
  }

  getCount(): number {
    return this.messages.size;
  }

  getSpeaker(id: string): string | undefined {
    return this.messages.get(id)?.speaker;
  }

  getText(id: string): string | undefined {
    return this.messages.get(id)?.text;
  }

  getMode(id: string): VoiceMode | undefined {
    return this.messages.get(id)?.mode;
  }

  getHits(id: string): number {
    return this.messages.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.messages.get(id)?.active ?? false;
  }

  isMuted(id: string): boolean {
    return this.messages.get(id)?.muted ?? false;
  }

  isLoud(id: string): boolean {
    return this.messages.get(id)?.mode === 'loud';
  }

  isNormal(id: string): boolean {
    return this.messages.get(id)?.mode === 'normal';
  }

  isWhisper(id: string): boolean {
    return this.messages.get(id)?.mode === 'whisper';
  }

  getByMode(mode: VoiceMode): VoiceMessage[] {
    return Array.from(this.messages.values()).filter(m => m.mode === mode);
  }

  getActiveMessages(): VoiceMessage[] {
    return Array.from(this.messages.values()).filter(m => m.active);
  }

  getInactiveMessages(): VoiceMessage[] {
    return Array.from(this.messages.values()).filter(m => !m.active);
  }

  getMutedMessages(): VoiceMessage[] {
    return Array.from(this.messages.values()).filter(m => m.muted);
  }

  getUnmutedMessages(): VoiceMessage[] {
    return Array.from(this.messages.values()).filter(m => !m.muted);
  }

  getAllSpeakers(): string[] {
    return [...new Set(Array.from(this.messages.values()).map(m => m.speaker))];
  }

  getAllTexts(): string[] {
    return [...new Set(Array.from(this.messages.values()).map(m => m.text))];
  }

  getNewest(): VoiceMessage | null {
    const all = Array.from(this.messages.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): VoiceMessage | null {
    const all = Array.from(this.messages.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.messages.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.messages.get(id)?.updated ?? 0;
  }

  getTotalSpoken(): number {
    return this.totalSpoken;
  }

  getTotalMuted(): number {
    return this.totalMuted;
  }

  getTotalListened(): number {
    return this.totalListened;
  }

  getTotalTextLen(): number {
    return this.totalTextLen;
  }

  clearAll(): void {
    this.messages.clear();
    this.counter = 0;
    this.totalSpoken = 0;
    this.totalMuted = 0;
    this.totalListened = 0;
    this.totalTextLen = 0;
  }
}

export default VoiceEngine;