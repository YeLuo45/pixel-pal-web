/**
 * Preview Engine
 * claude-code-design Preview Engine - Create + Render + Stats
 */

export type PreviewFormat = 'text' | 'markdown' | 'html' | 'json';

export interface Preview {
  id: string;
  title: string;
  content: string;
  format: PreviewFormat;
  rendered: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PveStats {
  previews: number;
  totalAdded: number;
  totalRendered: number;
  text: number;
  markdown: number;
  html: number;
  json: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  totalContentLen: number;
  totalTitleLen: number;
  avgContentLen: number;
  avgTitleLen: number;
  rendered: number;
  unrendered: number;
}

function renderPreview(content: string, format: PreviewFormat): string {
  if (format === 'json') {
    try { return JSON.stringify(JSON.parse(content), null, 2); }
    catch { return content; }
  }
  if (format === 'html') return content;
  return content;
}

export class PreviewEngine {
  private previews: Map<string, Preview> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalRendered = 0;
  private totalContentLen = 0;
  private totalTitleLen = 0;

  create(title: string, content: string, format: PreviewFormat): string {
    const id = `pve-${++this.counter}`;
    this.previews.set(id, {
      id,
      title,
      content,
      format,
      rendered: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalContentLen += content.length;
    this.totalTitleLen += title.length;
    return id;
  }

  render(id: string): string | null {
    const p = this.previews.get(id);
    if (!p) return null;
    if (!p.active) return null;
    p.rendered = true;
    p.updated = Date.now();
    p.hits++;
    this.totalRendered++;
    return renderPreview(p.content, p.format);
  }

  remove(id: string): boolean {
    return this.previews.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.previews.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const p = this.previews.get(id);
    if (!p) return false;
    p.title = title;
    p.updated = Date.now();
    return true;
  }

  setContent(id: string, content: string): boolean {
    const p = this.previews.get(id);
    if (!p) return false;
    p.content = content;
    p.updated = Date.now();
    return true;
  }

  setFormat(id: string, format: PreviewFormat): boolean {
    const p = this.previews.get(id);
    if (!p) return false;
    p.format = format;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.previews.values()) {
      p.rendered = false;
      p.active = true;
      p.hits = 0;
    }
    this.totalAdded = 0;
    this.totalRendered = 0;
    this.totalContentLen = 0;
    this.totalTitleLen = 0;
  }

  getStats(): PveStats {
    const all = Array.from(this.previews.values());
    const cArr = all.map(p => p.content.length);
    const tArr = all.map(p => p.title.length);
    return {
      previews: all.length,
      totalAdded: this.totalAdded,
      totalRendered: this.totalRendered,
      text: all.filter(p => p.format === 'text').length,
      markdown: all.filter(p => p.format === 'markdown').length,
      html: all.filter(p => p.format === 'html').length,
      json: all.filter(p => p.format === 'json').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueTitles: new Set(all.map(p => p.title)).size,
      totalContentLen: this.totalContentLen,
      totalTitleLen: this.totalTitleLen,
      avgContentLen: all.length > 0 ? Math.round((cArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgTitleLen: all.length > 0 ? Math.round((tArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      rendered: all.filter(p => p.rendered).length,
      unrendered: all.filter(p => !p.rendered).length,
    };
  }

  getPreview(id: string): Preview | undefined {
    return this.previews.get(id);
  }

  getAllPreviews(): Preview[] {
    return Array.from(this.previews.values());
  }

  hasPreview(id: string): boolean {
    return this.previews.has(id);
  }

  getCount(): number {
    return this.previews.size;
  }

  getTitle(id: string): string | undefined {
    return this.previews.get(id)?.title;
  }

  getContent(id: string): string | undefined {
    return this.previews.get(id)?.content;
  }

  getFormat(id: string): PreviewFormat | undefined {
    return this.previews.get(id)?.format;
  }

  isRendered(id: string): boolean {
    return this.previews.get(id)?.rendered ?? false;
  }

  getHits(id: string): number {
    return this.previews.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.previews.get(id)?.active ?? false;
  }

  isText(id: string): boolean {
    return this.previews.get(id)?.format === 'text';
  }

  isMarkdown(id: string): boolean {
    return this.previews.get(id)?.format === 'markdown';
  }

  isHtml(id: string): boolean {
    return this.previews.get(id)?.format === 'html';
  }

  isJson(id: string): boolean {
    return this.previews.get(id)?.format === 'json';
  }

  getByFormat(format: PreviewFormat): Preview[] {
    return Array.from(this.previews.values()).filter(p => p.format === format);
  }

  getActivePreviews(): Preview[] {
    return Array.from(this.previews.values()).filter(p => p.active);
  }

  getInactivePreviews(): Preview[] {
    return Array.from(this.previews.values()).filter(p => !p.active);
  }

  getRenderedPreviews(): Preview[] {
    return Array.from(this.previews.values()).filter(p => p.rendered);
  }

  getUnrenderedPreviews(): Preview[] {
    return Array.from(this.previews.values()).filter(p => !p.rendered);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.previews.values()).map(p => p.title))];
  }

  getNewest(): Preview | null {
    const all = Array.from(this.previews.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Preview | null {
    const all = Array.from(this.previews.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.previews.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.previews.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalRendered(): number {
    return this.totalRendered;
  }

  clearAll(): void {
    this.previews.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalRendered = 0;
    this.totalContentLen = 0;
    this.totalTitleLen = 0;
  }
}

export default PreviewEngine;