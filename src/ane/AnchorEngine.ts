/**
 * Anchor Engine
 * claude-code-design Anchor Engine - Add + Link + Unlink + Stats
 */

export type AnchorKind = 'h1' | 'h2' | 'h3' | 'span' | 'div' | 'section';

export interface Anchor {
  id: string;
  name: string;
  href: string;
  kind: AnchorKind;
  linked: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface AneStats {
  anchors: number;
  totalAdded: number;
  totalLinked: number;
  totalUnlinked: number;
  h1: number;
  h2: number;
  h3: number;
  span: number;
  div: number;
  section: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalLinked: number;
  avgLinked: number;
  maxLinked: number;
}

export class AnchorEngine {
  private anchors: Map<string, Anchor> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalLinked = 0;
  private totalUnlinked = 0;

  add(name: string, href: string, kind: AnchorKind): string {
    const id = `ane-${++this.counter}`;
    this.anchors.set(id, {
      id,
      name,
      href,
      kind,
      linked: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  link(id: string): boolean {
    const a = this.anchors.get(id);
    if (!a) return false;
    if (!a.active) return false;
    a.linked++;
    a.updated = Date.now();
    a.hits++;
    this.totalLinked++;
    return true;
  }

  unlink(id: string): boolean {
    const a = this.anchors.get(id);
    if (!a) return false;
    if (a.linked <= 0) return false;
    a.linked--;
    a.updated = Date.now();
    a.hits++;
    this.totalUnlinked++;
    return true;
  }

  remove(id: string): boolean {
    return this.anchors.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const a = this.anchors.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const a = this.anchors.get(id);
    if (!a) return false;
    a.name = name;
    a.updated = Date.now();
    return true;
  }

  setHref(id: string, href: string): boolean {
    const a = this.anchors.get(id);
    if (!a) return false;
    a.href = href;
    a.updated = Date.now();
    return true;
  }

  setKind(id: string, kind: AnchorKind): boolean {
    const a = this.anchors.get(id);
    if (!a) return false;
    a.kind = kind;
    a.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const a of this.anchors.values()) {
      a.linked = 0;
      a.active = true;
      a.hits = 0;
    }
    this.totalAdded = 0;
    this.totalLinked = 0;
    this.totalUnlinked = 0;
  }

  getStats(): AneStats {
    const all = Array.from(this.anchors.values());
    const lArr = all.map(a => a.linked);
    return {
      anchors: all.length,
      totalAdded: this.totalAdded,
      totalLinked: this.totalLinked,
      totalUnlinked: this.totalUnlinked,
      h1: all.filter(a => a.kind === 'h1').length,
      h2: all.filter(a => a.kind === 'h2').length,
      h3: all.filter(a => a.kind === 'h3').length,
      span: all.filter(a => a.kind === 'span').length,
      div: all.filter(a => a.kind === 'div').length,
      section: all.filter(a => a.kind === 'section').length,
      active: all.filter(a => a.active).length,
      inactive: all.filter(a => !a.active).length,
      totalHits: all.reduce((s, a) => s + a.hits, 0),
      uniqueNames: new Set(all.map(a => a.name)).size,
      totalLinked: all.reduce((s, a) => s + a.linked, 0),
      avgLinked: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLinked: lArr.length > 0 ? Math.max(...lArr) : 0,
    };
  }

  getAnchor(id: string): Anchor | undefined {
    return this.anchors.get(id);
  }

  getAllAnchors(): Anchor[] {
    return Array.from(this.anchors.values());
  }

  hasAnchor(id: string): boolean {
    return this.anchors.has(id);
  }

  getCount(): number {
    return this.anchors.size;
  }

  getName(id: string): string | undefined {
    return this.anchors.get(id)?.name;
  }

  getHref(id: string): string | undefined {
    return this.anchors.get(id)?.href;
  }

  getKind(id: string): AnchorKind | undefined {
    return this.anchors.get(id)?.kind;
  }

  getLinked(id: string): number {
    return this.anchors.get(id)?.linked ?? 0;
  }

  getHits(id: string): number {
    return this.anchors.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.anchors.get(id)?.active ?? false;
  }

  isH1(id: string): boolean {
    return this.anchors.get(id)?.kind === 'h1';
  }

  isH2(id: string): boolean {
    return this.anchors.get(id)?.kind === 'h2';
  }

  isH3(id: string): boolean {
    return this.anchors.get(id)?.kind === 'h3';
  }

  isSpan(id: string): boolean {
    return this.anchors.get(id)?.kind === 'span';
  }

  isDiv(id: string): boolean {
    return this.anchors.get(id)?.kind === 'div';
  }

  isSection(id: string): boolean {
    return this.anchors.get(id)?.kind === 'section';
  }

  getByKind(kind: AnchorKind): Anchor[] {
    return Array.from(this.anchors.values()).filter(a => a.kind === kind);
  }

  getActiveAnchors(): Anchor[] {
    return Array.from(this.anchors.values()).filter(a => a.active);
  }

  getInactiveAnchors(): Anchor[] {
    return Array.from(this.anchors.values()).filter(a => !a.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.anchors.values()).map(a => a.name))];
  }

  getNewest(): Anchor | null {
    const all = Array.from(this.anchors.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): Anchor | null {
    const all = Array.from(this.anchors.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.anchors.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.anchors.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalLinked(): number {
    return this.totalLinked;
  }

  getTotalUnlinked(): number {
    return this.totalUnlinked;
  }

  clearAll(): void {
    this.anchors.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalLinked = 0;
    this.totalUnlinked = 0;
  }
}

export default AnchorEngine;