/**
 * Container Manager
 * nanobot-design Container Manager - Create + Start + Stop + Stats
 */

export interface Container {
  id: string;
  name: string;
  image: string;
  running: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
  restarts: number;
}

export interface CntmStats {
  containers: number;
  running: number;
  stopped: number;
  totalRestarts: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueImages: number;
  avgRestarts: number;
  maxRestarts: number;
  minRestarts: number;
}

export class ContainerManager {
  private containers: Map<string, Container> = new Map();
  private counter = 0;
  private totalRestarts = 0;

  create(name: string, image: string): string {
    const id = `cntm-${++this.counter}`;
    this.containers.set(id, {
      id,
      name,
      image,
      running: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
      restarts: 0,
    });
    return id;
  }

  start(id: string): boolean {
    const c = this.containers.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.running = true;
    c.history.push(true);
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  stop(id: string): boolean {
    const c = this.containers.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.running = false;
    c.history.push(false);
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  restart(id: string): boolean {
    const c = this.containers.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.restarts++;
    c.running = true;
    c.history.push(true);
    c.updated = Date.now();
    c.hits++;
    this.totalRestarts++;
    return true;
  }

  getStats(): CntmStats {
    const all = Array.from(this.containers.values());
    const restartValues = all.map(c => c.restarts);
    return {
      containers: all.length,
      running: all.filter(c => c.running).length,
      stopped: all.filter(c => !c.running).length,
      totalRestarts: this.totalRestarts,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueNames: new Set(all.map(c => c.name)).size,
      uniqueImages: new Set(all.map(c => c.image)).size,
      avgRestarts: all.length > 0 ? Math.round((restartValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxRestarts: restartValues.length > 0 ? Math.max(...restartValues) : 0,
      minRestarts: restartValues.length > 0 ? Math.min(...restartValues) : 0,
    };
  }

  getContainer(id: string): Container | undefined {
    return this.containers.get(id);
  }

  getAllContainers(): Container[] {
    return Array.from(this.containers.values());
  }

  removeContainer(id: string): boolean {
    return this.containers.delete(id);
  }

  hasContainer(id: string): boolean {
    return this.containers.has(id);
  }

  getCount(): number {
    return this.containers.size;
  }

  getName(id: string): string | undefined {
    return this.containers.get(id)?.name;
  }

  getImage(id: string): string | undefined {
    return this.containers.get(id)?.image;
  }

  getRestarts(id: string): number {
    return this.containers.get(id)?.restarts ?? 0;
  }

  getHistory(id: string): boolean[] {
    return [...(this.containers.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.containers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.containers.get(id)?.active ?? false;
  }

  isRunning(id: string): boolean {
    return this.containers.get(id)?.running ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.containers.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.containers.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  setImage(id: string, image: string): boolean {
    const c = this.containers.get(id);
    if (!c) return false;
    c.image = image;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.containers.values()) {
      c.running = false;
      c.restarts = 0;
      c.hits = 0;
      c.history = [];
      c.active = true;
    }
    this.totalRestarts = 0;
  }

  getByName(name: string): Container[] {
    return Array.from(this.containers.values()).filter(c => c.name === name);
  }

  getByImage(image: string): Container[] {
    return Array.from(this.containers.values()).filter(c => c.image === image);
  }

  getRunningContainers(): Container[] {
    return Array.from(this.containers.values()).filter(c => c.running);
  }

  getStoppedContainers(): Container[] {
    return Array.from(this.containers.values()).filter(c => !c.running);
  }

  getActiveContainers(): Container[] {
    return Array.from(this.containers.values()).filter(c => c.active);
  }

  getInactiveContainers(): Container[] {
    return Array.from(this.containers.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.containers.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllImages(): string[] {
    return [...new Set(Array.from(this.containers.values()).map(c => c.image))];
  }

  getImageCount(): number {
    return this.getAllImages().length;
  }

  getByMinRestarts(min: number): Container[] {
    return Array.from(this.containers.values()).filter(c => c.restarts >= min);
  }

  getMostRestarts(): Container | null {
    const all = Array.from(this.containers.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.restarts > max.restarts ? c : max);
  }

  getNewest(): Container | null {
    const all = Array.from(this.containers.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Container | null {
    const all = Array.from(this.containers.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.containers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.containers.get(id)?.updated ?? 0;
  }

  getTotalRestarts(): number {
    return this.totalRestarts;
  }

  clearAll(): void {
    this.containers.clear();
    this.counter = 0;
    this.totalRestarts = 0;
  }
}

export default ContainerManager;