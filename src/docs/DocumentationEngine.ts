/**
 * Documentation Engine
 * claude-code-design Documentation Engine - Add + Retrieve + Search + BumpVersion
 */

export interface Document {
  id: string;
  title: string;
  content: string;
  version: string;
  tags: string[];
  views: number;
  versionHistory: string[];
  created: number;
  updated: number;
}

export interface DocStats {
  documents: number;
  versions: number;
  views: number;
  tags: number;
}

export class DocumentationEngine {
  private documents: Map<string, Document> = new Map();
  private counter = 0;

  add(doc: Omit<Document, 'id' | 'views' | 'versionHistory' | 'created' | 'updated'> & { version?: string }): string {
    const id = `doc-${++this.counter}`;
    const version = doc.version ?? '1.0.0';
    this.documents.set(id, {
      id,
      title: doc.title,
      content: doc.content,
      version,
      tags: [...doc.tags],
      views: 0,
      versionHistory: [version],
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  retrieve(id: string): Document | null {
    const doc = this.documents.get(id);
    if (!doc) return null;
    doc.views++;
    return doc;
  }

  search(query: string): Document[] {
    const q = query.toLowerCase();
    return Array.from(this.documents.values()).filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  bumpVersion(id: string, version: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;
    doc.version = version;
    doc.versionHistory.push(version);
    doc.updated = Date.now();
    return true;
  }

  getStats(): DocStats {
    const all = Array.from(this.documents.values());
    const tags = new Set<string>();
    for (const d of all) d.tags.forEach(t => tags.add(t));
    return {
      documents: all.length,
      versions: all.reduce((s, d) => s + d.versionHistory.length, 0),
      views: all.reduce((s, d) => s + d.views, 0),
      tags: tags.size,
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

  getContent(id: string): string | undefined {
    return this.documents.get(id)?.content;
  }

  getVersion(id: string): string | undefined {
    return this.documents.get(id)?.version;
  }

  getVersionHistory(id: string): string[] {
    return [...(this.documents.get(id)?.versionHistory ?? [])];
  }

  getTags(id: string): string[] {
    return [...(this.documents.get(id)?.tags ?? [])];
  }

  hasTag(id: string, tag: string): boolean {
    return this.documents.get(id)?.tags.includes(tag) ?? false;
  }

  addTag(id: string, tag: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    if (!d.tags.includes(tag)) d.tags.push(tag);
    return true;
  }

  removeTag(id: string, tag: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    const idx = d.tags.indexOf(tag);
    if (idx === -1) return false;
    d.tags.splice(idx, 1);
    return true;
  }

  getViews(id: string): number {
    return this.documents.get(id)?.views ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.documents.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.documents.get(id)?.updated ?? 0;
  }

  updateTitle(id: string, title: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    d.title = title;
    d.updated = Date.now();
    return true;
  }

  updateContent(id: string, content: string): boolean {
    const d = this.documents.get(id);
    if (!d) return false;
    d.content = content;
    d.updated = Date.now();
    return true;
  }

  getByTag(tag: string): Document[] {
    return Array.from(this.documents.values()).filter(d => d.tags.includes(tag));
  }

  getByVersion(version: string): Document[] {
    return Array.from(this.documents.values()).filter(d => d.version === version);
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    for (const d of this.documents.values()) d.tags.forEach(t => tags.add(t));
    return Array.from(tags);
  }

  getTagCount(): number {
    return this.getAllTags().length;
  }

  getMostViewed(): Document | null {
    const all = Array.from(this.documents.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.views > max.views ? d : max);
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

  getVersionsCount(id: string): number {
    return this.documents.get(id)?.versionHistory.length ?? 0;
  }

  clearAll(): void {
    this.documents.clear();
    this.counter = 0;
  }
}

export default DocumentationEngine;