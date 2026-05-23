/**
 * V135: useSkillGraph hook
 */
import { useState, useEffect, useCallback } from 'react';
import { getGraphEvents, addGraphEvent, saveGraphSnapshot, loadGraphSnapshot } from '../services/graph/GraphStore';
import { getTopInfluential, getNeighbors, findPath, computeInfluence } from '../services/graph/GraphEngine';
import type { GraphEvent } from '../services/graph/GraphStore';
import type { GraphNode } from '../services/graph/GraphEngine';

export function useSkillGraph() {
  const [events, setEvents] = useState<GraphEvent[]>([]);
  const [topNodes, setTopNodes] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const evts = await getGraphEvents();
      setEvents(evts);
      setTopNodes(getTopInfluential(evts));
      // Save snapshot
      const infl = computeInfluence(evts);
      const nodes = [...infl.keys()].map(id => ({ id, influence: infl.get(id)! }));
      const edges: [string, string, number][] = [];
      for (const e of evts) edges.push([e.from, e.to, e.weight]);
      saveGraphSnapshot(nodes.map(n => n.id), edges);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordEdge = useCallback(async (from: string, to: string, weight: number) => {
    await addGraphEvent({ from, to, edgeType: 'TRIGGERS', weight, timestamp: new Date().toISOString() });
    await loadGraph();
  }, [loadGraph]);

  const getPath = useCallback((from: string, to: string) => {
    return findPath(from, to, events);
  }, [events]);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  return { events, topNodes, loading, loadGraph, recordEdge, getPath };
}