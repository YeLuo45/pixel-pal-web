/**
 * Document Manager
 * chatdev-design Document Manager - Create + Update + Share + Stats
 */

export interface Document {
  id: string;
  title: string;
  content: string;
  versions: string[];
  shared: string[];
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface DMStats {
  documents: number;
  totalVersions: number;
  totalShares: number;
  totalHits: number;
  active: number;
  inactive: number;
  avgVersions: number;
  avgShares: number;
  titles: number;
  contentLength: number;
}

export class DocumentManager {
  private documents: Map<string, Document> = new Map();
  private counter = 0;

  create(title: string, content: string): string {
    const id = `dm-${++this.counter}`;
    this.documents.set(id, {
      id,
      title,
      content,
      versions: [content],
      shared: [],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [Date.now()],
    });
    return id;
  }

  update(id: string, content: string): string {
    const d = this.documents.get(id);
    if (!d) return '';
    if (!d.active) return '';
    d.content = content;
    d.versions.push(content);
    d.updated = Date.now();
    d.history.push(Date.now());
    d.hits++;
    return id;
  }

  share(id: string, user: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    if (!d.active) return false;
    if (!d.shared.includes(user)) {
      d.shared.push(user);
    }
    d.updated = Date.now();
    return true;
  }

  unshare(id: string, user: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    d.shared = d.shared.filter(u => u !== user);
    d.updated = Date.now();
    return true;
  }

  getContent(id: string): string {
    return this.documents.get(id)?.content ?? '';
  }

  getVersion(id: string, version: number): string {
    const d = this.documents.get(id);
    if (!d) return '';
    return d.versions[version] ?? '';
  }

  getStats(): DMStats {
    const all = Array.from(this.documents.values());
    return {
      documents: all.length,
      totalVersions: all.reduce((s, d) => s + d.versions.length, 0),
      totalShares: all.reduce((s, d) => s + d.shared.length, 0),
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      avgVersions: all.length > 0 ? Math.round((all.reduce((s, d) => s + d.versions.length, 0) / all.length) * 100) / 100 : 0,
      avgShares: all.length > 0 ? Math.round((all.reduce((s, d) => s + d.shared.length, 0) / all.length) * 100) / 100 : 0,
      titles: new Set(all.map(d => d.title)).size,
      contentLength: all.reduce((s, d) => s + d.content.length, 0),
    };
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  removeDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  hasDocument(id: string): boolean {
    return this.documents.has(id);
  }

  getCount(): number {
    return this.documents.size;
  }

  getTitle(id: string): string | undefined {
    return this.documents.get(id)?.title;
  }

  getVersions(id: string): string[] {
    return [...(this.documents.get(id)?.versions ?? [])];
  }

  getVersionCount(id: string): number {
    return this.documents.get(id)?.versions.length ?? 0;
  }

  getShared(id: string): string[] {
    return [...(this.documents.get(id)?.shared ?? [])];
  }

  getSharedCount(id: string): number {
    return this.documents.get(id)?.shared.length ?? 0;
  }

  getHits(id: string): number {
    return this.documents.get(id)?.hits ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.documents.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.documents.get(id)?.active ?? false;
  }

  isShared(id: string, user: string): boolean {
    return this.documents.get(id)?.shared.includes(user) ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    d.title = title;
    d.updated = Date.now();
    return true;
  }

  setContent(id: string, content: string): boolean {
    return this.update(id, content) === '';
  }

  touch(id: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    d.hits++;
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const d of this.documents.values()) {
      d.versions = [d.content];
      d.shared = [];
      d.hits = 0;
      d.history = [d.created];
      d.active = true;
    }
  }

  getByTitle(title: string): Document[] {
    return Array.from(this.documents.values()).filter(d => d.title === title);
  }

  getSharedWith(user: string): Document[] {
    return Array.from(this.documents.values()).filter(d => d.shared.includes(user));
  }

  getActiveDocuments(): Document[] {
    return Array.from(this.documents.values()).filter(d => d.active);
  }

  getInactiveDocuments(): Document[] {
    return Array.from(this.documents.values()).filter(d => !d.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.documents.values()).map(d => d.title))];
  }

  getTitleCount(): number {
    return this.getAllTitles().length;
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.documents.values()).flatMap(d => d.shared))];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  getByMinVersions(min: number): Document[] {
    return Array.from(this.documents.values()).filter(d => d.versions.length >= min);
  }

  getMostVersions(): Document | null {
    const all = Array.from(this.documents.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.versions.length > max.versions.length ? d : max);
  }

  getMostShared(): Document | null {
    const all = Array.from(this.documents.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.shared.length > max.shared.length ? d : max);
  }

  getNewest(): Document | null {
    const all = Array.from(this.documents.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Document | null {
    const all = Array.from(this.documents.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.documents.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.documents.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.documents.clear();
    this.counter = 0;
  }
}

export default DocumentManager;