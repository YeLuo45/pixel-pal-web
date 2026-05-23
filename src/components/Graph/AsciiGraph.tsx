import React from 'react';
import { useSkillGraph } from '../../hooks/useSkillGraph';
import { renderAscii } from '../../services/graph/GraphVisualizer';

/**
 * V135: AsciiGraph — ASCII text rendering for small graphs
 */
export function AsciiGraph() {
  const { topNodes, events } = useSkillGraph();
  const edges: [string, string, number][] = events.slice(-20).map(e => [e.from, e.to, e.weight]);
  return (
    <pre className="ascii-graph">
      {renderAscii(
        topNodes.slice(0, 15).map(n => ({ id: n.id, influence: n.influence })),
        edges.map(e => ({ from: e[0], to: e[1], weight: e[2] }))
      )}
    </pre>
  );
}