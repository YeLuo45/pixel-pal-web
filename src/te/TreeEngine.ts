/**
 * Tree Engine
 * claude-code-design Tree Engine - Add + Find + Traverse + Stats
 */

export interface TreeNode {
  id: string;
  name: string;
  parent: string | null;
  children: string[];
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  depth: number;
}

export type TraversalOrder = 'pre' | 'post' | 'bfs';

export interface TEStats {
  nodes: number;
  roots: number;
  maxDepth: number;
  totalHits: number;
  active: number;
  inactive: number;
  avgChildren: number;
  avgDepth: number;
  leaves: number;
  internal: number;
}

export class TreeEngine {
  private nodes: Map<string, TreeNode> = new Map();
  private counter = 0;

  add(name: string, parent: string | null = null): string {
    const id = `te-${++this.counter}`;
    let depth = 0;
    if (parent) {
      const p = this.nodes.get(parent);
      if (p) {
        depth = p.depth + 1;
        p.children.push(id);
        p.updated = Date.now();
      }
    }
    this.nodes.set(id, {
      id,
      name,
      parent,
      children: [],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      depth,
    });
    return id;
  }

  find(id: string): TreeNode | null {
    return this.nodes.get(id) ?? null;
  }

  traverse(id: string, order: TraversalOrder = 'pre'): string[] {
    const start = this.nodes.get(id);
    if (!start) return [];
    const result: string[] = [];
    if (order === 'pre') {
      this.traversePre(start, result);
    } else if (order === 'post') {
      this.traversePost(start, result);
    } else {
      this.traverseBfs(start, result);
    }
    return result;
  }

  private traversePre(node: TreeNode, result: string[]): void {
    result.push(node.id);
    for (const childId of node.children) {
      const child = this.nodes.get(childId);
      if (child) this.traversePre(child, result);
    }
  }

  private traversePost(node: TreeNode, result: string[]): void {
    for (const childId of node.children) {
      const child = this.nodes.get(childId);
      if (child) this.traversePost(child, result);
    }
    result.push(node.id);
  }

  private traverseBfs(node: TreeNode, result: string[]): void {
    const queue: TreeNode[] = [node];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current.id);
      for (const childId of current.children) {
        const child = this.nodes.get(childId);
        if (child) queue.push(child);
      }
    }
  }

  getStats(): TEStats {
    const all = Array.from(this.nodes.values());
    return {
      nodes: all.length,
      roots: all.filter(n => n.parent === null).length,
      maxDepth: all.length > 0 ? Math.max(...all.map(n => n.depth)) : 0,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      avgChildren: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.children.length, 0) / all.length) * 100) / 100 : 0,
      avgDepth: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.depth, 0) / all.length) * 100) / 100 : 0,
      leaves: all.filter(n => n.children.length === 0).length,
      internal: all.filter(n => n.children.length > 0).length,
    };
  }

  getNode(id: string): TreeNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): TreeNode[] {
    return Array.from(this.nodes.values());
  }

  getRoots(): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.parent === null);
  }

  removeNode(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (n.parent) {
      const parent = this.nodes.get(n.parent);
      if (parent) {
        parent.children = parent.children.filter(c => c !== id);
        parent.updated = Date.now();
      }
    }
    // Remove all descendants
    for (const childId of [...n.children]) {
      this.removeNode(childId);
    }
    return this.nodes.delete(id);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getName(id: string): string | undefined {
    return this.nodes.get(id)?.name;
  }

  getParent(id: string): string | null {
    return this.nodes.get(id)?.parent ?? null;
  }

  getChildren(id: string): string[] {
    return [...(this.nodes.get(id)?.children ?? [])];
  }

  getChildCount(id: string): number {
    return this.nodes.get(id)?.children.length ?? 0;
  }

  getDepth(id: string): number {
    return this.nodes.get(id)?.depth ?? 0;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.nodes.get(id)?.active ?? false;
  }

  isRoot(id: string): boolean {
    return this.nodes.get(id)?.parent === null;
  }

  isLeaf(id: string): boolean {
    return (this.nodes.get(id)?.children.length ?? 0) === 0;
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.name = name;
    n.updated = Date.now();
    return true;
  }

  touch(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.hits++;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.hits = 0;
      n.active = true;
    }
  }

  getByName(name: string): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.name === name);
  }

  getByParent(parent: string | null): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.parent === parent);
  }

  getActiveNodes(): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.active);
  }

  getInactiveNodes(): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getLeaves(): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.children.length === 0);
  }

  getInternalNodes(): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.children.length > 0);
  }

  getByDepth(depth: number): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.depth === depth);
  }

  getMaxDepth(): number {
    const all = Array.from(this.nodes.values());
    return all.length > 0 ? Math.max(...all.map(n => n.depth)) : 0;
  }

  getByMinChildren(min: number): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.children.length >= min);
  }

  getNewest(): TreeNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): TreeNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.nodes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.nodes.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.nodes.clear();
    this.counter = 0;
  }
}

export default TreeEngine;