/**
 * Media Engine
 * chatdev-design Media Engine - Add + Attach + Detach + Stats
 */

export type MediaKind = 'image' | 'video' | 'audio' | 'doc' | 'embed';

export interface MediaItem {
  id: string;
  name: string;
  kind: MediaKind;
  url: string;
  size: number;
  attached: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface MmeStats {
  media: number;
  totalAdded: number;
  totalAttached: number;
  totalDetached: number;
  image: number;
  video: number;
  audio: number;
  doc: number;
  embed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalSize: number;
  totalAttachedSum: number;
  maxAttached: number;
  avgAttached: number;
}

export class MediaEngine {
  private media: Map<string, MediaItem> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAttached = 0;
  private totalDetached = 0;
  private totalSize = 0;

  add(name: string, kind: MediaKind, url: string, size: number = 0): string {
    const id = `mme-${++this.counter}`;
    this.media.set(id, {
      id,
      name,
      kind,
      url,
      size,
      attached: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalSize += size;
    return id;
  }

  attach(id: string): boolean {
    const m = this.media.get(id);
    if (!m) return false;
    if (!m.active) return false;
    m.attached++;
    m.updated = Date.now();
    m.hits++;
    this.totalAttached++;
    return true;
  }

  detach(id: string): boolean {
    const m = this.media.get(id);
    if (!m) return false;
    if (m.attached <= 0) return false;
    m.attached--;
    m.updated = Date.now();
    m.hits++;
    this.totalDetached++;
    return true;
  }

  remove(id: string): boolean {
    return this.media.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.media.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const m = this.media.get(id);
    if (!m) return false;
    m.name = name;
    m.updated = Date.now();
    return true;
  }

  setKind(id: string, kind: MediaKind): boolean {
    const m = this.media.get(id);
    if (!m) return false;
    m.kind = kind;
    m.updated = Date.now();
    return true;
  }

  setUrl(id: string, url: string): boolean {
    const m = this.media.get(id);
    if (!m) return false;
    m.url = url;
    m.updated = Date.now();
    return true;
  }

  setSize(id: string, size: number): boolean {
    const m = this.media.get(id);
    if (!m) return false;
    m.size = size;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.media.values()) {
      m.attached = 0;
      m.active = true;
      m.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAttached = 0;
    this.totalDetached = 0;
    this.totalSize = 0;
  }

  getStats(): MmeStats {
    const all = Array.from(this.media.values());
    const aArr = all.map(m => m.attached);
    return {
      media: all.length,
      totalAdded: this.totalAdded,
      totalAttached: this.totalAttached,
      totalDetached: this.totalDetached,
      image: all.filter(m => m.kind === 'image').length,
      video: all.filter(m => m.kind === 'video').length,
      audio: all.filter(m => m.kind === 'audio').length,
      doc: all.filter(m => m.kind === 'doc').length,
      embed: all.filter(m => m.kind === 'embed').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueNames: new Set(all.map(m => m.name)).size,
      totalSize: this.totalSize,
      totalAttachedSum: all.reduce((s, m) => s + m.attached, 0),
      maxAttached: aArr.length > 0 ? Math.max(...aArr) : 0,
      avgAttached: all.length > 0 ? Math.round((aArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getMedia(id: string): MediaItem | undefined {
    return this.media.get(id);
  }

  getAllMedia(): MediaItem[] {
    return Array.from(this.media.values());
  }

  hasMedia(id: string): boolean {
    return this.media.has(id);
  }

  getCount(): number {
    return this.media.size;
  }

  getName(id: string): string | undefined {
    return this.media.get(id)?.name;
  }

  getKind(id: string): MediaKind | undefined {
    return this.media.get(id)?.kind;
  }

  getUrl(id: string): string | undefined {
    return this.media.get(id)?.url;
  }

  getSize(id: string): number {
    return this.media.get(id)?.size ?? 0;
  }

  getAttached(id: string): number {
    return this.media.get(id)?.attached ?? 0;
  }

  getHits(id: string): number {
    return this.media.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.media.get(id)?.active ?? false;
  }

  isImage(id: string): boolean {
    return this.media.get(id)?.kind === 'image';
  }

  isVideo(id: string): boolean {
    return this.media.get(id)?.kind === 'video';
  }

  isAudio(id: string): boolean {
    return this.media.get(id)?.kind === 'audio';
  }

  isDoc(id: string): boolean {
    return this.media.get(id)?.kind === 'doc';
  }

  isEmbed(id: string): boolean {
    return this.media.get(id)?.kind === 'embed';
  }

  getByKind(kind: MediaKind): MediaItem[] {
    return Array.from(this.media.values()).filter(m => m.kind === kind);
  }

  getActiveMedia(): MediaItem[] {
    return Array.from(this.media.values()).filter(m => m.active);
  }

  getInactiveMedia(): MediaItem[] {
    return Array.from(this.media.values()).filter(m => !m.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.media.values()).map(m => m.name))];
  }

  getNewest(): MediaItem | null {
    const all = Array.from(this.media.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): MediaItem | null {
    const all = Array.from(this.media.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.media.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.media.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAttached(): number {
    return this.totalAttached;
  }

  getTotalDetached(): number {
    return this.totalDetached;
  }

  clearAll(): void {
    this.media.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAttached = 0;
    this.totalDetached = 0;
    this.totalSize = 0;
  }
}

export default MediaEngine;