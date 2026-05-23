import React, { useState } from 'react';
import { useSkillGraph } from '../../hooks/useSkillGraph';
import { renderAscii, renderSvg } from '../../services/graph/GraphVisualizer';

/**
 * V135: GraphPanel — tabbed graph visualization (Trending / Influence / Communities / Path)
 */
export function GraphPanel() {
  const { topNodes, loading, recordEdge, getPath } = useSkillGraph();
  const [tab, setTab] = useState<'trending' | 'influence' | 'path'>('influence');
  const [pathFrom, setPathFrom] = useState('');
  const [pathTo, setPathTo] = useState('');
  const [pathResult, setPathResult] = useState<string[] | null>(null);

  const handlePath = () => {
    if (!pathFrom || !pathTo) return;
    setPathResult(getPath(pathFrom, pathTo));
  };

  return (
    <div className="graph-panel">
      <div className="graph-tabs">
        <button onClick={() => setTab('influence')} className={tab === 'influence' ? 'active' : ''}>Influence</button>
        <button onClick={() => setTab('trending')} className={tab === 'trending' ? 'active' : ''}>Trending</button>
        <button onClick={() => setTab('path')} className={tab === 'path' ? 'active' : ''}>Path</button>
      </div>
      <div className="graph-content">
        {loading && <p className="muted">Loading graph...</p>}
        {!loading && tab === 'influence' && (
          <div className="graph-influence">
            <h4>Top Skills by Influence</h4>
            <ol>
              {topNodes.slice(0, 10).map((n, i) => (
                <li key={n.id}>{n.id} — influence {n.influence} (#{i + 1})</li>
              ))}
            </ol>
          </div>
        )}
        {!loading && tab === 'trending' && (
          <div className="graph-trending">
            <p className="muted">Trending data — skills with new edges this week</p>
          </div>
        )}
        {!loading && tab === 'path' && (
          <div className="graph-path">
            <div className="path-inputs">
              <input value={pathFrom} onChange={e => setPathFrom(e.target.value)} placeholder="Skill A" />
              <span>→</span>
              <input value={pathTo} onChange={e => setPathTo(e.target.value)} placeholder="Skill B" />
              <button onClick={handlePath}>Find Path</button>
            </div>
            {pathResult && <p>Path: {pathResult.join(' → ')}</p>}
            {!pathResult && pathFrom && pathTo && <p className="muted">No path found</p>}
          </div>
        )}
      </div>
    </div>
  );
}