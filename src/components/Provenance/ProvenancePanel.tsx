import React, { useState } from 'react';
import { useProvenance } from '../../hooks/useProvenance';

/**
 * V136: ProvenancePanel — tree + lineage + contribution score
 */
interface Props {
  skillId?: string;
}

export function ProvenancePanel({ skillId }: Props) {
  const { chain, userScore, loading } = useProvenance(skillId);
  const [tab, setTab] = useState<'tree' | 'contributors'>('tree');

  return (
    <div className="provenance-panel">
      <div className="provenance-tabs">
        <button onClick={() => setTab('tree')} className={tab === 'tree' ? 'active' : ''}>Lineage Tree</button>
        <button onClick={() => setTab('contributors')} className={tab === 'contributors' ? 'active' : ''}>Top Contributors</button>
      </div>
      <div className="provenance-content">
        {loading && <p className="muted">Loading lineage...</p>}
        {!loading && tab === 'tree' && (
          <div className="provenance-tree">
            {chain.length === 0 ? (
              <p className="muted">No lineage records yet. Create or fork a skill to start the tree.</p>
            ) : (
              <pre className="ascii-tree">
{chain.map((n, i) => '  '.repeat(n.depth) + (i === 0 ? '●' : '└──') + ` ${n.skillId} ${n.version} (@${n.author})`).join('\n')}
              </pre>
            )}
          </div>
        )}
        {!loading && tab === 'contributors' && (
          <div className="provenance-contributors">
            <div className="contribution-score">
              <h4>Your Score</h4>
              <p className="score">{userScore} pts</p>
            </div>
            <p className="muted">Leaderboard coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}