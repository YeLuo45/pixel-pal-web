/**
 * Profile Engine
 * generic-agent-design Profile Engine - Create + Update + Get + Stats
 */

export interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string;
  attributes: Record<string, string>;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PfeStats {
  profiles: number;
  totalCreated: number;
  totalUpdated: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueEmails: number;
  avgBioLength: number;
  maxBioLength: number;
  minBioLength: number;
  totalAttributes: number;
  uniqueAttributes: number;
}

export class ProfileEngine {
  private profiles: Map<string, Profile> = new Map();
  private counter = 0;
  private totalCreated = 0;
  private totalUpdated = 0;

  create(name: string, email: string, bio: string = ''): string {
    const id = `pfe-${++this.counter}`;
    this.profiles.set(id, {
      id,
      name,
      email,
      bio,
      attributes: {},
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalCreated++;
    return id;
  }

  update(id: string, bio: string): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.bio = bio;
    p.updated = Date.now();
    p.hits++;
    this.totalUpdated++;
    return true;
  }

  setAttribute(id: string, key: string, value: string): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.attributes[key] = value;
    p.updated = Date.now();
    return true;
  }

  removeAttribute(id: string, key: string): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    if (!(key in p.attributes)) return false;
    delete p.attributes[key];
    p.updated = Date.now();
    return true;
  }

  get(id: string): Profile | undefined {
    const p = this.profiles.get(id);
    if (!p) return undefined;
    if (!p.active) return undefined;
    p.hits++;
    p.updated = Date.now();
    return p;
  }

  remove(id: string): boolean {
    return this.profiles.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setEmail(id: string, email: string): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.email = email;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.profiles.values()) {
      p.bio = '';
      p.attributes = {};
      p.hits = 0;
      p.active = true;
    }
    this.totalCreated = 0;
    this.totalUpdated = 0;
  }

  getStats(): PfeStats {
    const all = Array.from(this.profiles.values());
    const bioLengths = all.map(p => p.bio.length);
    const allAttributes = all.flatMap(p => Object.keys(p.attributes));
    return {
      profiles: all.length,
      totalCreated: this.totalCreated,
      totalUpdated: this.totalUpdated,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      uniqueEmails: new Set(all.map(p => p.email)).size,
      avgBioLength: all.length > 0 ? Math.round((bioLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxBioLength: bioLengths.length > 0 ? Math.max(...bioLengths) : 0,
      minBioLength: bioLengths.length > 0 ? Math.min(...bioLengths) : 0,
      totalAttributes: all.reduce((s, p) => s + Object.keys(p.attributes).length, 0),
      uniqueAttributes: new Set(allAttributes).size,
    };
  }

  getProfile(id: string): Profile | undefined {
    return this.profiles.get(id);
  }

  getAllProfiles(): Profile[] {
    return Array.from(this.profiles.values());
  }

  hasProfile(id: string): boolean {
    return this.profiles.has(id);
  }

  getCount(): number {
    return this.profiles.size;
  }

  getName(id: string): string | undefined {
    return this.profiles.get(id)?.name;
  }

  getEmail(id: string): string | undefined {
    return this.profiles.get(id)?.email;
  }

  getBio(id: string): string | undefined {
    return this.profiles.get(id)?.bio;
  }

  getBioLength(id: string): number {
    return this.profiles.get(id)?.bio.length ?? 0;
  }

  getAttributes(id: string): Record<string, string> {
    return { ...(this.profiles.get(id)?.attributes ?? {}) };
  }

  getAttributeCount(id: string): number {
    return Object.keys(this.profiles.get(id)?.attributes ?? {}).length;
  }

  getHits(id: string): number {
    return this.profiles.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.profiles.get(id)?.active ?? false;
  }

  getByName(name: string): Profile[] {
    return Array.from(this.profiles.values()).filter(p => p.name === name);
  }

  getByEmail(email: string): Profile[] {
    return Array.from(this.profiles.values()).filter(p => p.email === email);
  }

  getActiveProfiles(): Profile[] {
    return Array.from(this.profiles.values()).filter(p => p.active);
  }

  getInactiveProfiles(): Profile[] {
    return Array.from(this.profiles.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.profiles.values()).map(p => p.name))];
  }

  getAllEmails(): string[] {
    return [...new Set(Array.from(this.profiles.values()).map(p => p.email))];
  }

  getNewest(): Profile | null {
    const all = Array.from(this.profiles.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Profile | null {
    const all = Array.from(this.profiles.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.profiles.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.profiles.get(id)?.updated ?? 0;
  }

  getTotalCreated(): number {
    return this.totalCreated;
  }

  getTotalUpdated(): number {
    return this.totalUpdated;
  }

  clearAll(): void {
    this.profiles.clear();
    this.counter = 0;
    this.totalCreated = 0;
    this.totalUpdated = 0;
  }
}

export default ProfileEngine;