/**
 * V135: GraphEngine — PageRank-lite, neighbor queries, path finding
 */
import type { GraphEvent } from './GraphStore';

export interface GraphNode {
  id: string;
  influence: number;
  edgeCount: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

function buildAdjList(events: GraphEvent[]): Map<string, Map<string, number>> {
  const adj = new Map<string, Map<string, number>>();
  for (const e of events) {
    if (!adj.has(e.from)) adj.set(e.from, new Map());
    const prev = adj.get(e.from)!.get(e.to) || 0;
    adj.get(e.from)!.set(e.to, Math.max(prev, e.weight));
  }
  return adj;
}

/** PageRank-lite: iterative influence scoring */
export function computeInfluence(events: GraphEvent[], iterations = 20): Map<string, number> {
  const adj = buildAdjList(events);
  const nodes = [...adj.keys()];
  const ranks = new Map<string, number>();
  for (const n of nodes) ranks.set(n, 1.0);

  for (let iter = 0; iter < iterations; iter++) {
    const newRanks = new Map<string, number>();
    for (const [node, rank] of ranks) {
      const neighbors = adj.get(node);
      if (!neighbors || neighbors.size === 0) {
        newRanks.set(node, (newRanks.get(node) || 0) + rank / nodes.length);
        continue;
      }
      const sum = [...neighbors.values()].reduce((a, b) => a + b, 0);
      for (const [neighbor, weight] of neighbors) {
        newRanks.set(neighbor, (newRanks.get(neighbor) || 0) + (rank * weight) / sum);
      }
    }
    for (const n of nodes) {
      newRanks.set(n, (newRanks.get(n) || 0) + 1.0 / nodes.length);
    }
    ranks.clear();
    for (const [k, v] of newRanks) ranks.set(k, v);
  }
  return ranks;
}

export function getNeighbors(skillId: string, events: GraphEvent[]): Map<string, number> {
  const adj = buildAdjList(events);
  return adj.get(skillId) || new Map();
}

export function getTopInfluential(events: GraphEvent[], limit = 10): GraphNode[] {
  const infl = computeInfluence(events);
  return [...infl.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, influence]) => ({
      id,
      influence: Math.round(influence * 100) / 100,
      edgeCount: [...buildAdjList(events).get(id)?.values() || []].length,
    }));
}

export function findPath(from: string, to: string, events: GraphEvent[]): string[] | null {
  const adj = buildAdjList(events);
  const visited = new Set<string>();
  const queue: string[][] = [[from]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    if (visited.has(node)) continue;
    visited.add(node);
    const neighbors = adj.get(node);
    if (!neighbors) continue;
    for (const [nbr] of neighbors) {
      if (nbr === to) return [...path, nbr];
      if (!visited.has(nbr)) queue.push([...path, nbr]);
    }
  }
  return null;
}