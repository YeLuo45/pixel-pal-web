/**
 * Manifest Engine
 * claude-code-design Manifest Engine - Create + Sign + Verify + Stats
 */

export type ManifestFormat = 'json' | 'yaml' | 'xml';

export interface Manifest {
  id: string;
  name: string;
  version: string;
  format: ManifestFormat;
  signed: boolean;
  content: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface MfeStats {
  manifests: number;
  totalCreated: number;
  totalSigned: number;
  totalVerified: number;
  json: number;
  yaml: number;
  xml: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueVersions: number;
  totalContentLen: number;
  avgContentLen: number;
  maxContentLen: number;
  minContentLen: number;
  signed: number;
  unsigned: number;
}

export class ManifestEngine {
  private manifests: Map<string, Manifest> = new Map();
  private counter = 0;
  private totalCreated = 0;
  private totalSigned = 0;
  private totalVerified = 0;
  private totalContentLen = 0;

  create(name: string, version: string, content: string, format: ManifestFormat = 'json'): string {
    const id = `mfe-${++this.counter}`;
    this.manifests.set(id, {
      id,
      name,
      version,
      format,
      signed: false,
      content,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalCreated++;
    this.totalContentLen += content.length;
    return id;
  }

  sign(id: string): boolean {
    const m = this.manifests.get(id);
    if (!m) return false;
    if (m.signed) return false;
    m.signed = true;
    m.updated = Date.now();
    m.hits++;
    this.totalSigned++;
    return true;
  }

  verify(id: string): boolean {
    const m = this.manifests.get(id);
    if (!m) return false;
    if (!m.active) return false;
    m.updated = Date.now();
    m.hits++;
    this.totalVerified++;
    return m.signed;
  }

  remove(id: string): boolean {
    return this.manifests.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.manifests.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const m = this.manifests.get(id);
    if (!m) return false;
    m.name = name;
    m.updated = Date.now();
    return true;
  }

  setVersion(id: string, version: string): boolean {
    const m = this.manifests.get(id);
    if (!m) return false;
    m.version = version;
    m.updated = Date.now();
    return true;
  }

  setContent(id: string, content: string): boolean {
    const m = this.manifests.get(id);
    if (!m) return false;
    m.content = content;
    m.updated = Date.now();
    return true;
  }

  setFormat(id: string, format: ManifestFormat): boolean {
    const m = this.manifests.get(id);
    if (!m) return false;
    m.format = format;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.manifests.values()) {
      m.signed = false;
      m.active = true;
      m.hits = 0;
    }
    this.totalCreated = 0;
    this.totalSigned = 0;
    this.totalVerified = 0;
    this.totalContentLen = 0;
  }

  getStats(): MfeStats {
    const all = Array.from(this.manifests.values());
    const lenArr = all.map(m => m.content.length);
    return {
      manifests: all.length,
      totalCreated: this.totalCreated,
      totalSigned: this.totalSigned,
      totalVerified: this.totalVerified,
      json: all.filter(m => m.format === 'json').length,
      yaml: all.filter(m => m.format === 'yaml').length,
      xml: all.filter(m => m.format === 'xml').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueNames: new Set(all.map(m => m.name)).size,
      uniqueVersions: new Set(all.map(m => m.version)).size,
      totalContentLen: this.totalContentLen,
      avgContentLen: all.length > 0 ? Math.round((lenArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxContentLen: lenArr.length > 0 ? Math.max(...lenArr) : 0,
      minContentLen: lenArr.length > 0 ? Math.min(...lenArr) : 0,
      signed: all.filter(m => m.signed).length,
      unsigned: all.filter(m => !m.signed).length,
    };
  }

  getManifest(id: string): Manifest | undefined {
    return this.manifests.get(id);
  }

  getAllManifests(): Manifest[] {
    return Array.from(this.manifests.values());
  }

  hasManifest(id: string): boolean {
    return this.manifests.has(id);
  }

  getCount(): number {
    return this.manifests.size;
  }

  getName(id: string): string | undefined {
    return this.manifests.get(id)?.name;
  }

  getVersion(id: string): string | undefined {
    return this.manifests.get(id)?.version;
  }

  getFormat(id: string): ManifestFormat | undefined {
    return this.manifests.get(id)?.format;
  }

  getContent(id: string): string | undefined {
    return this.manifests.get(id)?.content;
  }

  getHits(id: string): number {
    return this.manifests.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.manifests.get(id)?.active ?? false;
  }

  isSigned(id: string): boolean {
    return this.manifests.get(id)?.signed ?? false;
  }

  isJson(id: string): boolean {
    return this.manifests.get(id)?.format === 'json';
  }

  isYaml(id: string): boolean {
    return this.manifests.get(id)?.format === 'yaml';
  }

  isXml(id: string): boolean {
    return this.manifests.get(id)?.format === 'xml';
  }

  getByFormat(format: ManifestFormat): Manifest[] {
    return Array.from(this.manifests.values()).filter(m => m.format === format);
  }

  getSignedManifests(): Manifest[] {
    return Array.from(this.manifests.values()).filter(m => m.signed);
  }

  getUnsignedManifests(): Manifest[] {
    return Array.from(this.manifests.values()).filter(m => !m.signed);
  }

  getActiveManifests(): Manifest[] {
    return Array.from(this.manifests.values()).filter(m => m.active);
  }

  getInactiveManifests(): Manifest[] {
    return Array.from(this.manifests.values()).filter(m => !m.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.manifests.values()).map(m => m.name))];
  }

  getAllVersions(): string[] {
    return [...new Set(Array.from(this.manifests.values()).map(m => m.version))];
  }

  getNewest(): Manifest | null {
    const all = Array.from(this.manifests.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): Manifest | null {
    const all = Array.from(this.manifests.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.manifests.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.manifests.get(id)?.updated ?? 0;
  }

  getTotalCreated(): number {
    return this.totalCreated;
  }

  getTotalSigned(): number {
    return this.totalSigned;
  }

  getTotalVerified(): number {
    return this.totalVerified;
  }

  clearAll(): void {
    this.manifests.clear();
    this.counter = 0;
    this.totalCreated = 0;
    this.totalSigned = 0;
    this.totalVerified = 0;
    this.totalContentLen = 0;
  }
}

export default ManifestEngine;