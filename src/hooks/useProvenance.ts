/**
 * V136: useProvenance hook
 */
import { useState, useEffect, useCallback } from 'react';
import { getAllProvenances, saveProvenance } from '../services/provenance/ProvenanceStore';
import { buildAncestorChain, computeContributionScore, buildFamilyTree } from '../services/provenance/LineageEngine';
import type { SkillProvenance } from '../services/provenance/ProvenanceStore';
import type { LineageNode } from '../services/provenance/LineageEngine';

export function useProvenance(skillId?: string) {
  const [provenances, setProvenances] = useState<SkillProvenance[]>([]);
  const [chain, setChain] = useState<LineageNode[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllProvenances();
      setProvenances(all);
      if (skillId) {
        const skillProvs = all.filter(p => p.skillId === skillId);
        setChain(buildAncestorChain(skillProvs));
      }
      const userId = localStorage.getItem('pixelpal_user_id') || 'anonymous';
      setUserScore(computeContributionScore(all, userId));
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  const recordProvenance = useCallback(async (prov: Omit<SkillProvenance, 'id'>) => {
    await saveProvenance(prov);
    await load();
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return { provenances, chain, userScore, loading, recordProvenance };
}