/**
 * Translation Engine
 * chatdev-design Translation Engine - Add + GetByLang + Stats
 */

export interface Translation {
  id: string;
  source: string;
  target: string;
  text: string;
  translated: string;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface TE3Stats {
  translations: number;
  uniqueLanguages: number;
  uniquePairs: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgTextLength: number;
  maxTextLength: number;
  minTextLength: number;
  totalTextLength: number;
}

export class TranslationEngine {
  private translations: Map<string, Translation> = new Map();
  private counter = 0;

  add(source: string, target: string, text: string, translated: string): string {
    const id = `te3-${++this.counter}`;
    this.translations.set(id, {
      id,
      source,
      target,
      text,
      translated,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  access(id: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.hits++;
    t.history.push(Date.now());
    t.updated = Date.now();
    return true;
  }

  getByLang(source: string, target: string): Translation[] {
    return Array.from(this.translations.values()).filter(t => t.source === source && t.target === target);
  }

  getStats(): TE3Stats {
    const all = Array.from(this.translations.values());
    const textLengths = all.map(t => t.text.length);
    return {
      translations: all.length,
      uniqueLanguages: new Set([...all.map(t => t.source), ...all.map(t => t.target)]).size,
      uniquePairs: new Set(all.map(t => `${t.source}->${t.target}`)).size,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      avgTextLength: all.length > 0 ? Math.round((textLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTextLength: textLengths.length > 0 ? Math.max(...textLengths) : 0,
      minTextLength: textLengths.length > 0 ? Math.min(...textLengths) : 0,
      totalTextLength: textLengths.reduce((s, v) => s + v, 0),
    };
  }

  getTranslation(id: string): Translation | undefined {
    return this.translations.get(id);
  }

  getAllTranslations(): Translation[] {
    return Array.from(this.translations.values());
  }

  removeTranslation(id: string): boolean {
    return this.translations.delete(id);
  }

  hasTranslation(id: string): boolean {
    return this.translations.has(id);
  }

  getCount(): number {
    return this.translations.size;
  }

  getSource(id: string): string | undefined {
    return this.translations.get(id)?.source;
  }

  getTarget(id: string): string | undefined {
    return this.translations.get(id)?.target;
  }

  getText(id: string): string | undefined {
    return this.translations.get(id)?.text;
  }

  getTranslated(id: string): string | undefined {
    return this.translations.get(id)?.translated;
  }

  getTextLength(id: string): number {
    return this.translations.get(id)?.text.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.translations.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.translations.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.translations.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setSource(id: string, source: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.source = source;
    t.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.target = target;
    t.updated = Date.now();
    return true;
  }

  setText(id: string, text: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.text = text;
    t.updated = Date.now();
    return true;
  }

  setTranslated(id: string, translated: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.translated = translated;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.translations.values()) {
      t.hits = 0;
      t.history = [];
      t.active = true;
    }
  }

  getBySource(source: string): Translation[] {
    return Array.from(this.translations.values()).filter(t => t.source === source);
  }

  getByTarget(target: string): Translation[] {
    return Array.from(this.translations.values()).filter(t => t.target === target);
  }

  getActiveTranslations(): Translation[] {
    return Array.from(this.translations.values()).filter(t => t.active);
  }

  getInactiveTranslations(): Translation[] {
    return Array.from(this.translations.values()).filter(t => !t.active);
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.translations.values()).map(t => t.source))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.translations.values()).map(t => t.target))];
  }

  getSourceCount(): number {
    return this.getAllSources().length;
  }

  getTargetCount(): number {
    return this.getAllTargets().length;
  }

  getByMinTextLength(min: number): Translation[] {
    return Array.from(this.translations.values()).filter(t => t.text.length >= min);
  }

  getMostTextLength(): Translation | null {
    const all = Array.from(this.translations.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.text.length > max.text.length ? t : max);
  }

  getNewest(): Translation | null {
    const all = Array.from(this.translations.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Translation | null {
    const all = Array.from(this.translations.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.translations.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.translations.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.translations.clear();
    this.counter = 0;
  }
}

export default TranslationEngine;