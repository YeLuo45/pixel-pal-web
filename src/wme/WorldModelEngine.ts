/**
 * World Model Engine
 * generic-agent-design World Model Engine - AddObject + AddRelation + Query + Stats
 */

export interface WorldObject {
  id: string;
  name: string;
  type: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface WorldRelation {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface WmeStats {
  objects: number;
  relations: number;
  totalObjects: number;
  totalRelations: number;
  activeObjects: number;
  inactiveObjects: number;
  activeRelations: number;
  inactiveRelations: number;
  totalHits: number;
  uniqueObjectTypes: number;
  uniqueRelationTypes: number;
  uniqueObjectNames: number;
}

export class WorldModelEngine {
  private objects: Map<string, WorldObject> = new Map();
  private relations: Map<string, WorldRelation> = new Map();
  private objCounter = 0;
  private relCounter = 0;
  private totalObjects = 0;
  private totalRelations = 0;

  addObject(name: string, type: string): string {
    const id = `wme-o-${++this.objCounter}`;
    this.objects.set(id, {
      id,
      name,
      type,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalObjects++;
    return id;
  }

  addRelation(fromId: string, toId: string, type: string): string {
    const id = `wme-r-${++this.relCounter}`;
    this.relations.set(id, {
      id,
      fromId,
      toId,
      type,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalRelations++;
    return id;
  }

  query(id: string): { object?: WorldObject; relations: WorldRelation[] } {
    const obj = this.objects.get(id);
    const relations: WorldRelation[] = [];
    for (const r of this.relations.values()) {
      if ((r.fromId === id || r.toId === id) && r.active) {
        relations.push(r);
      }
    }
    return { object: obj, relations };
  }

  removeObject(id: string): boolean {
    return this.objects.delete(id);
  }

  removeRelation(id: string): boolean {
    return this.relations.delete(id);
  }

  setActiveObject(id: string, active: boolean): boolean {
    const o = this.objects.get(id);
    if (!o) return false;
    o.active = active;
    o.updated = Date.now();
    return true;
  }

  setActiveRelation(id: string, active: boolean): boolean {
    const r = this.relations.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const o of this.objects.values()) {
      o.active = true;
      o.hits = 0;
    }
    for (const r of this.relations.values()) {
      r.active = true;
      r.hits = 0;
    }
    this.totalObjects = 0;
    this.totalRelations = 0;
  }

  getStats(): WmeStats {
    const allObjects = Array.from(this.objects.values());
    const allRelations = Array.from(this.relations.values());
    return {
      objects: allObjects.length,
      relations: allRelations.length,
      totalObjects: this.totalObjects,
      totalRelations: this.totalRelations,
      activeObjects: allObjects.filter(o => o.active).length,
      inactiveObjects: allObjects.filter(o => !o.active).length,
      activeRelations: allRelations.filter(r => r.active).length,
      inactiveRelations: allRelations.filter(r => !r.active).length,
      totalHits: allObjects.reduce((s, o) => s + o.hits, 0) + allRelations.reduce((s, r) => s + r.hits, 0),
      uniqueObjectTypes: new Set(allObjects.map(o => o.type)).size,
      uniqueRelationTypes: new Set(allRelations.map(r => r.type)).size,
      uniqueObjectNames: new Set(allObjects.map(o => o.name)).size,
    };
  }

  getObject(id: string): WorldObject | undefined {
    return this.objects.get(id);
  }

  getRelation(id: string): WorldRelation | undefined {
    return this.relations.get(id);
  }

  getAllObjects(): WorldObject[] {
    return Array.from(this.objects.values());
  }

  getAllRelations(): WorldRelation[] {
    return Array.from(this.relations.values());
  }

  hasObject(id: string): boolean {
    return this.objects.has(id);
  }

  hasRelation(id: string): boolean {
    return this.relations.has(id);
  }

  getObjectCount(): number {
    return this.objects.size;
  }

  getRelationCount(): number {
    return this.relations.size;
  }

  getObjectName(id: string): string | undefined {
    return this.objects.get(id)?.name;
  }

  getObjectType(id: string): string | undefined {
    return this.objects.get(id)?.type;
  }

  getHits(id: string): number {
    return this.objects.get(id)?.hits ?? this.relations.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.objects.get(id)?.active ?? this.relations.get(id)?.active ?? false;
  }

  getByType(type: string): WorldObject[] {
    return Array.from(this.objects.values()).filter(o => o.type === type);
  }

  getRelationsByType(type: string): WorldRelation[] {
    return Array.from(this.relations.values()).filter(r => r.type === type);
  }

  getActiveObjects(): WorldObject[] {
    return Array.from(this.objects.values()).filter(o => o.active);
  }

  getInactiveObjects(): WorldObject[] {
    return Array.from(this.objects.values()).filter(o => !o.active);
  }

  getActiveRelations(): WorldRelation[] {
    return Array.from(this.relations.values()).filter(r => r.active);
  }

  getInactiveRelations(): WorldRelation[] {
    return Array.from(this.relations.values()).filter(r => !r.active);
  }

  getAllObjectNames(): string[] {
    return [...new Set(Array.from(this.objects.values()).map(o => o.name))];
  }

  getAllObjectTypes(): string[] {
    return [...new Set(Array.from(this.objects.values()).map(o => o.type))];
  }

  getAllRelationTypes(): string[] {
    return [...new Set(Array.from(this.relations.values()).map(r => r.type))];
  }

  getNewestObject(): WorldObject | null {
    const all = Array.from(this.objects.values());
    if (all.length === 0) return null;
    return all.reduce((max, o) => o.created > max.created ? o : max);
  }

  getNewestRelation(): WorldRelation | null {
    const all = Array.from(this.relations.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getTotalObjects(): number {
    return this.totalObjects;
  }

  getTotalRelations(): number {
    return this.totalRelations;
  }

  clearAll(): void {
    this.objects.clear();
    this.relations.clear();
    this.objCounter = 0;
    this.relCounter = 0;
    this.totalObjects = 0;
    this.totalRelations = 0;
  }
}

export default WorldModelEngine;