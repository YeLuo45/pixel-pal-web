/**
 * Translation Engine
 * chatdev-design Translation Engine - Add + Translate + Stats
 */

export type LangCode = 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de';

export interface Translation {
  id: string;
  key: string;
  source: string;
  sourceLang: LangCode;
  target: string;
  targetLang: LangCode;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface TreStats {
  translations: number;
  totalAdded: number;
  totalTranslated: number;
  en: number;
  zh: number;
  ja: number;
  es: number;
  fr: number;
  de: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueKeys: number;
  totalSourceLen: number;
  totalTargetLen: number;
  avgSourceLen: number;
  avgTargetLen: number;
}

function translate(source: string, sourceLang: LangCode, targetLang: LangCode): string {
  if (sourceLang === targetLang) return source;
  // Mock translation - real implementation would use a translation service
  return `[${targetLang}]${source}`;
}

export class TranslationEngine {
  private translations: Map<string, Translation> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalTranslated = 0;
  private totalSourceLen = 0;
  private totalTargetLen = 0;

  add(key: string, source: string, sourceLang: LangCode, targetLang: LangCode): string {
    const id = `tre-${++this.counter}`;
    const target = translate(source, sourceLang, targetLang);
    this.translations.set(id, {
      id,
      key,
      source,
      sourceLang,
      target,
      targetLang,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalSourceLen += source.length;
    this.totalTargetLen += target.length;
    return id;
  }

  translate(id: string, newSource: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.source = newSource;
    t.target = translate(newSource, t.sourceLang, t.targetLang);
    t.updated = Date.now();
    t.hits++;
    this.totalTranslated++;
    this.totalSourceLen += newSource.length;
    this.totalTargetLen += t.target.length;
    return true;
  }

  remove(id: string): boolean {
    return this.translations.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setKey(id: string, key: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.key = key;
    t.updated = Date.now();
    return true;
  }

  setSource(id: string, source: string): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.source = source;
    t.target = translate(source, t.sourceLang, t.targetLang);
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

  setSourceLang(id: string, lang: LangCode): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.sourceLang = lang;
    t.target = translate(t.source, lang, t.targetLang);
    t.updated = Date.now();
    return true;
  }

  setTargetLang(id: string, lang: LangCode): boolean {
    const t = this.translations.get(id);
    if (!t) return false;
    t.targetLang = lang;
    t.target = translate(t.source, t.sourceLang, lang);
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.translations.values()) {
      t.active = true;
      t.hits = 0;
    }
    this.totalAdded = 0;
    this.totalTranslated = 0;
    this.totalSourceLen = 0;
    this.totalTargetLen = 0;
  }

  getStats(): TreStats {
    const all = Array.from(this.translations.values());
    const sArr = all.map(t => t.source.length);
    const tgArr = all.map(t => t.target.length);
    return {
      translations: all.length,
      totalAdded: this.totalAdded,
      totalTranslated: this.totalTranslated,
      en: all.filter(t => t.sourceLang === 'en').length,
      zh: all.filter(t => t.sourceLang === 'zh').length,
      ja: all.filter(t => t.sourceLang === 'ja').length,
      es: all.filter(t => t.sourceLang === 'es').length,
      fr: all.filter(t => t.sourceLang === 'fr').length,
      de: all.filter(t => t.sourceLang === 'de').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueKeys: new Set(all.map(t => t.key)).size,
      totalSourceLen: this.totalSourceLen,
      totalTargetLen: this.totalTargetLen,
      avgSourceLen: all.length > 0 ? Math.round((sArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgTargetLen: all.length > 0 ? Math.round((tgArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getTranslation(id: string): Translation | undefined {
    return this.translations.get(id);
  }

  getAllTranslations(): Translation[] {
    return Array.from(this.translations.values());
  }

  hasTranslation(id: string): boolean {
    return this.translations.has(id);
  }

  getCount(): number {
    return this.translations.size;
  }

  getKey(id: string): string | undefined {
    return this.translations.get(id)?.key;
  }

  getSource(id: string): string | undefined {
    return this.translations.get(id)?.source;
  }

  getTarget(id: string): string | undefined {
    return this.translations.get(id)?.target;
  }

  getSourceLang(id: string): LangCode | undefined {
    return this.translations.get(id)?.sourceLang;
  }

  getTargetLang(id: string): LangCode | undefined {
    return this.translations.get(id)?.targetLang;
  }

  getHits(id: string): number {
    return this.translations.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.translations.get(id)?.active ?? false;
  }

  isEn(id: string): boolean {
    return this.translations.get(id)?.sourceLang === 'en';
  }

  isZh(id: string): boolean {
    return this.translations.get(id)?.sourceLang === 'zh';
  }

  isJa(id: string): boolean {
    return this.translations.get(id)?.sourceLang === 'ja';
  }

  isEs(id: string): boolean {
    return this.translations.get(id)?.sourceLang === 'es';
  }

  isFr(id: string): boolean {
    return this.translations.get(id)?.sourceLang === 'fr';
  }

  isDe(id: string): boolean {
    return this.translations.get(id)?.sourceLang === 'de';
  }

  getBySourceLang(lang: LangCode): Translation[] {
    return Array.from(this.translations.values()).filter(t => t.sourceLang === lang);
  }

  getActiveTranslations(): Translation[] {
    return Array.from(this.translations.values()).filter(t => t.active);
  }

  getInactiveTranslations(): Translation[] {
    return Array.from(this.translations.values()).filter(t => !t.active);
  }

  getAllKeys(): string[] {
    return [...new Set(Array.from(this.translations.values()).map(t => t.key))];
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalTranslated(): number {
    return this.totalTranslated;
  }

  clearAll(): void {
    this.translations.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalTranslated = 0;
    this.totalSourceLen = 0;
    this.totalTargetLen = 0;
  }
}

export default TranslationEngine;