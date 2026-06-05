/**
 * Decision Tree
 * generic-agent-design Decision Tree - Build + Walk + Evaluate + Prune
 */

export interface TreeNode {
  id: string;
  condition: string; // e.g. "age > 18" or "result" for leaf
  result?: string;
  children: string[];
}

export type TraversalOrder = 'bfs' | 'dfs';

export class DecisionTree {
  private nodes: Map<string, TreeNode> = new Map();
  private root: string | null = null;

  addNode(node: TreeNode): void {
    this.nodes.set(node.id, { ...node, children: [...node.children] });
  }

  setRoot(id: string): boolean {
    if (!this.nodes.has(id)) return false;
    this.root = id;
    return true;
  }

  evaluate(context: Record<string, unknown>): string | null {
    if (!this.root) return null;
    return this.evaluateNode(this.root, context);
  }

  private evaluateNode(id: string, context: Record<string, unknown>): string | null {
    const node = this.nodes.get(id);
    if (!node) return null;

    // Leaf node
    if (node.children.length === 0) {
      return node.result ?? null;
    }

    // Evaluate condition: e.g. "age > 18"
    if (this.evaluateCondition(node.condition, context)) {
      return this.evaluateNode(node.children[0], context);
    } else {
      return this.evaluateNode(node.children[1] ?? node.children[0], context);
    }
  }

  private evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
    // Simple condition parser: "field op value"
    const match = condition.match(/^(\w+)\s*(>=|<=|>|<|==|!=)\s*(.+)$/);
    if (!match) return true;
    const [, field, op, rawValue] = match;
    const contextValue = context[field];
    let compareValue: unknown = rawValue;
    if (typeof contextValue === 'number') {
      compareValue = Number(rawValue);
    } else if (contextValue === undefined) {
      // Try boolean
      if (rawValue === 'true') compareValue = true;
      else if (rawValue === 'false') compareValue = false;
    } else {
      compareValue = rawValue.replace(/^['"]|['"]$/g, '');
    }

    switch (op) {
      case '>': return (contextValue as number) > (compareValue as number);
      case '<': return (contextValue as number) < (compareValue as number);
      case '>=': return (contextValue as number) >= (compareValue as number);
      case '<=': return (contextValue as number) <= (compareValue as number);
      case '==': return contextValue === compareValue;
      case '!=': return contextValue !== compareValue;
      default: return true;
    }
  }

  prune(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    // Recursively prune children
    for (const child of node.children) {
      this.prune(child);
    }
    // Remove from parent's children list
    for (const parent of this.nodes.values()) {
      const idx = parent.children.indexOf(id);
      if (idx !== -1) parent.children.splice(idx, 1);
    }
    return this.nodes.delete(id);
  }

  traverse(order: TraversalOrder): string[] {
    if (!this.root) return [];
    if (order === 'bfs') return this.bfs();
    return this.dfs();
  }

  private bfs(): string[] {
    const result: string[] = [];
    const queue: string[] = [this.root!];
    while (queue.length > 0) {
      const id = queue.shift()!;
      result.push(id);
      const node = this.nodes.get(id);
      if (node) {
        for (const child of node.children) queue.push(child);
      }
    }
    return result;
  }

  private dfs(): string[] {
    const result: string[] = [];
    const stack: string[] = [this.root!];
    while (stack.length > 0) {
      const id = stack.pop()!;
      result.push(id);
      const node = this.nodes.get(id);
      if (node) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i]);
        }
      }
    }
    return result;
  }

  getNode(id: string): TreeNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): TreeNode[] {
    return Array.from(this.nodes.values());
  }

  getRoot(): string | null {
    return this.root;
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getChildren(id: string): string[] {
    return [...(this.nodes.get(id)?.children ?? [])];
  }

  getDepth(id?: string): number {
    const startId = id ?? this.root;
    if (!startId) return 0;
    const node = this.nodes.get(startId);
    if (!node) return 0;
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(c => this.getDepth(c)));
  }

  getLeaves(): TreeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.children.length === 0);
  }

  getLeafCount(): number {
    return this.getLeaves().length;
  }

  isLeaf(id: string): boolean {
    return this.nodes.get(id)?.children.length === 0;
  }

  addChild(parentId: string, childId: string): boolean {
    const parent = this.nodes.get(parentId);
    if (!parent || !this.nodes.has(childId)) return false;
    if (!parent.children.includes(childId)) parent.children.push(childId);
    return true;
  }

  removeChild(parentId: string, childId: string): boolean {
    const parent = this.nodes.get(parentId);
    if (!parent) return false;
    const idx = parent.children.indexOf(childId);
    if (idx === -1) return false;
    parent.children.splice(idx, 1);
    return true;
  }

  clearAll(): void {
    this.nodes.clear();
    this.root = null;
  }
}

export default DecisionTree;