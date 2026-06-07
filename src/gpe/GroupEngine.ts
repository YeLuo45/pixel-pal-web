/**
 * Group Engine
 * chatdev-design Group Engine - Create + AddMember + Remove + Stats
 */

export type GroupType = 'public' | 'private' | 'secret';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  members: number;
  maxSize: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface GpeStats {
  groups: number;
  totalCreated: number;
  totalAdded: number;
  totalRemoved: number;
  public: number;
  private: number;
  secret: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalMembers: number;
  avgMembers: number;
  maxMembers: number;
  minMembers: number;
  totalMaxSize: number;
  avgMaxSize: number;
}

export class GroupEngine {
  private groups: Map<string, Group> = new Map();
  private counter = 0;
  private totalCreated = 0;
  private totalAdded = 0;
  private totalRemoved = 0;
  private totalMembers = 0;
  private totalMaxSize = 0;

  create(name: string, type: GroupType = 'public', maxSize: number = 100): string {
    const id = `gpe-${++this.counter}`;
    this.groups.set(id, {
      id,
      name,
      type,
      members: 0,
      maxSize,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalCreated++;
    this.totalMaxSize += maxSize;
    return id;
  }

  addMember(id: string): boolean {
    const g = this.groups.get(id);
    if (!g) return false;
    if (!g.active) return false;
    if (g.members >= g.maxSize) return false;
    g.members++;
    g.updated = Date.now();
    g.hits++;
    this.totalAdded++;
    this.totalMembers++;
    return true;
  }

  removeMember(id: string): boolean {
    const g = this.groups.get(id);
    if (!g) return false;
    if (g.members <= 0) return false;
    g.members--;
    g.updated = Date.now();
    g.hits++;
    this.totalRemoved++;
    this.totalMembers--;
    return true;
  }

  remove(id: string): boolean {
    return this.groups.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const g = this.groups.get(id);
    if (!g) return false;
    g.active = active;
    g.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const g = this.groups.get(id);
    if (!g) return false;
    g.name = name;
    g.updated = Date.now();
    return true;
  }

  setType(id: string, type: GroupType): boolean {
    const g = this.groups.get(id);
    if (!g) return false;
    g.type = type;
    g.updated = Date.now();
    return true;
  }

  setMaxSize(id: string, maxSize: number): boolean {
    const g = this.groups.get(id);
    if (!g) return false;
    g.maxSize = maxSize;
    g.updated = Date.now();
    return true;
  }

  setMembers(id: string, members: number): boolean {
    const g = this.groups.get(id);
    if (!g) return false;
    g.members = members;
    g.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const g of this.groups.values()) {
      g.members = 0;
      g.active = true;
      g.hits = 0;
    }
    this.totalCreated = 0;
    this.totalAdded = 0;
    this.totalRemoved = 0;
    this.totalMembers = 0;
    this.totalMaxSize = 0;
  }

  getStats(): GpeStats {
    const all = Array.from(this.groups.values());
    const mArr = all.map(g => g.members);
    const msArr = all.map(g => g.maxSize);
    return {
      groups: all.length,
      totalCreated: this.totalCreated,
      totalAdded: this.totalAdded,
      totalRemoved: this.totalRemoved,
      public: all.filter(g => g.type === 'public').length,
      private: all.filter(g => g.type === 'private').length,
      secret: all.filter(g => g.type === 'secret').length,
      active: all.filter(g => g.active).length,
      inactive: all.filter(g => !g.active).length,
      totalHits: all.reduce((s, g) => s + g.hits, 0),
      uniqueNames: new Set(all.map(g => g.name)).size,
      totalMembers: this.totalMembers,
      avgMembers: all.length > 0 ? Math.round((mArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMembers: mArr.length > 0 ? Math.max(...mArr) : 0,
      minMembers: mArr.length > 0 ? Math.min(...mArr) : 0,
      totalMaxSize: this.totalMaxSize,
      avgMaxSize: all.length > 0 ? Math.round((msArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getGroup(id: string): Group | undefined {
    return this.groups.get(id);
  }

  getAllGroups(): Group[] {
    return Array.from(this.groups.values());
  }

  hasGroup(id: string): boolean {
    return this.groups.has(id);
  }

  getCount(): number {
    return this.groups.size;
  }

  getName(id: string): string | undefined {
    return this.groups.get(id)?.name;
  }

  getType(id: string): GroupType | undefined {
    return this.groups.get(id)?.type;
  }

  getMembers(id: string): number {
    return this.groups.get(id)?.members ?? 0;
  }

  getMaxSize(id: string): number {
    return this.groups.get(id)?.maxSize ?? 0;
  }

  getHits(id: string): number {
    return this.groups.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.groups.get(id)?.active ?? false;
  }

  isPublic(id: string): boolean {
    return this.groups.get(id)?.type === 'public';
  }

  isPrivate(id: string): boolean {
    return this.groups.get(id)?.type === 'private';
  }

  isSecret(id: string): boolean {
    return this.groups.get(id)?.type === 'secret';
  }

  isFull(id: string): boolean {
    const g = this.groups.get(id);
    return g ? g.members >= g.maxSize : false;
  }

  isEmpty(id: string): boolean {
    return (this.groups.get(id)?.members ?? 0) === 0;
  }

  getByType(type: GroupType): Group[] {
    return Array.from(this.groups.values()).filter(g => g.type === type);
  }

  getActiveGroups(): Group[] {
    return Array.from(this.groups.values()).filter(g => g.active);
  }

  getInactiveGroups(): Group[] {
    return Array.from(this.groups.values()).filter(g => !g.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.groups.values()).map(g => g.name))];
  }

  getNewest(): Group | null {
    const all = Array.from(this.groups.values());
    if (all.length === 0) return null;
    return all.reduce((max, g) => g.created > max.created ? g : max);
  }

  getOldest(): Group | null {
    const all = Array.from(this.groups.values());
    if (all.length === 0) return null;
    return all.reduce((min, g) => g.created < min.created ? g : min);
  }

  getCreatedAt(id: string): number {
    return this.groups.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.groups.get(id)?.updated ?? 0;
  }

  getTotalCreated(): number {
    return this.totalCreated;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalRemoved(): number {
    return this.totalRemoved;
  }

  clearAll(): void {
    this.groups.clear();
    this.counter = 0;
    this.totalCreated = 0;
    this.totalAdded = 0;
    this.totalRemoved = 0;
    this.totalMembers = 0;
    this.totalMaxSize = 0;
  }
}

export default GroupEngine;