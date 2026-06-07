/**
 * Attachment Engine
 * chatdev-design Attachment Engine - Add + List + Remove + Stats
 */

export type AttachType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface Attachment {
  id: string;
  name: string;
  type: AttachType;
  size: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Ate2Stats {
  attachments: number;
  totalAdded: number;
  totalListed: number;
  totalRemoved: number;
  image: number;
  video: number;
  audio: number;
  document: number;
  other: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalSize: number;
  avgSize: number;
  maxSize: number;
  minSize: number;
}

export class AttachmentEngine {
  private attachments: Map<string, Attachment> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalListed = 0;
  private totalSize = 0;

  add(name: string, type: AttachType, size: number): string {
    const id = `ate2-${++this.counter}`;
    this.attachments.set(id, {
      id,
      name,
      type,
      size,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalSize += size;
    return id;
  }

  list(id: string): boolean {
    const a = this.attachments.get(id);
    if (!a) return false;
    if (!a.active) return false;
    a.updated = Date.now();
    a.hits++;
    this.totalListed++;
    return true;
  }

  remove(id: string): boolean {
    return this.attachments.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const a = this.attachments.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const a = this.attachments.get(id);
    if (!a) return false;
    a.name = name;
    a.updated = Date.now();
    return true;
  }

  setType(id: string, type: AttachType): boolean {
    const a = this.attachments.get(id);
    if (!a) return false;
    a.type = type;
    a.updated = Date.now();
    return true;
  }

  setSize(id: string, size: number): boolean {
    const a = this.attachments.get(id);
    if (!a) return false;
    a.size = size;
    a.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const a of this.attachments.values()) {
      a.active = true;
      a.hits = 0;
    }
    this.totalAdded = 0;
    this.totalListed = 0;
    this.totalSize = 0;
  }

  getStats(): Ate2Stats {
    const all = Array.from(this.attachments.values());
    const sArr = all.map(a => a.size);
    return {
      attachments: all.length,
      totalAdded: this.totalAdded,
      totalListed: this.totalListed,
      totalRemoved: all.length > 0 ? Array.from(this.attachments.values()).filter(a => a.hits === 0).length : 0,
      image: all.filter(a => a.type === 'image').length,
      video: all.filter(a => a.type === 'video').length,
      audio: all.filter(a => a.type === 'audio').length,
      document: all.filter(a => a.type === 'document').length,
      other: all.filter(a => a.type === 'other').length,
      active: all.filter(a => a.active).length,
      inactive: all.filter(a => !a.active).length,
      totalHits: all.reduce((s, a) => s + a.hits, 0),
      uniqueNames: new Set(all.map(a => a.name)).size,
      totalSize: this.totalSize,
      avgSize: all.length > 0 ? Math.round((sArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSize: sArr.length > 0 ? Math.max(...sArr) : 0,
      minSize: sArr.length > 0 ? Math.min(...sArr) : 0,
    };
  }

  getAttachment(id: string): Attachment | undefined {
    return this.attachments.get(id);
  }

  getAllAttachments(): Attachment[] {
    return Array.from(this.attachments.values());
  }

  hasAttachment(id: string): boolean {
    return this.attachments.has(id);
  }

  getCount(): number {
    return this.attachments.size;
  }

  getName(id: string): string | undefined {
    return this.attachments.get(id)?.name;
  }

  getType(id: string): AttachType | undefined {
    return this.attachments.get(id)?.type;
  }

  getSize(id: string): number {
    return this.attachments.get(id)?.size ?? 0;
  }

  getHits(id: string): number {
    return this.attachments.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.attachments.get(id)?.active ?? false;
  }

  isImage(id: string): boolean {
    return this.attachments.get(id)?.type === 'image';
  }

  isVideo(id: string): boolean {
    return this.attachments.get(id)?.type === 'video';
  }

  isAudio(id: string): boolean {
    return this.attachments.get(id)?.type === 'audio';
  }

  isDocument(id: string): boolean {
    return this.attachments.get(id)?.type === 'document';
  }

  isOther(id: string): boolean {
    return this.attachments.get(id)?.type === 'other';
  }

  getByType(type: AttachType): Attachment[] {
    return Array.from(this.attachments.values()).filter(a => a.type === type);
  }

  getActiveAttachments(): Attachment[] {
    return Array.from(this.attachments.values()).filter(a => a.active);
  }

  getInactiveAttachments(): Attachment[] {
    return Array.from(this.attachments.values()).filter(a => !a.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.attachments.values()).map(a => a.name))];
  }

  getNewest(): Attachment | null {
    const all = Array.from(this.attachments.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): Attachment | null {
    const all = Array.from(this.attachments.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.attachments.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.attachments.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalListed(): number {
    return this.totalListed;
  }

  clearAll(): void {
    this.attachments.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalListed = 0;
    this.totalSize = 0;
  }
}

export default AttachmentEngine;