/**
 * V132 useSkillEvolution — React hook for version chain + evolution state
 */

import { useState, useEffect, useCallback } from 'react';
import type { SkillGenome, SkillVersion } from '../services/evolution/SkillGenome';
import { loadGenome, getVersions } from '../services/evolution/SkillVersionStore';
import { evolutionEngine } from '../services/evolution/EvolutionEngine';

export interface SkillEvolutionState {
  activeSkillId: string | null;
  versionChain: string[];
  evolvingSkillIds: string[];
  lastScanTimestamp: number;
}

export interface UseSkillEvolutionReturn {
  state: SkillEvolutionState;
  activeGenome: SkillGenome | null;
  activeVersions: SkillVersion[];
  setActiveSkill: (skillId: string | null) => void;
  recordFeedback: (skillId: string, success: boolean) => void;
  forceScan: () => Promise<void>;
  getGenome: (skillId: string) => SkillGenome | null;
}

/**
 * Hook to manage skill evolution state and operations
 */
export function useSkillEvolution(): UseSkillEvolutionReturn {
  const [state, setState] = useState<SkillEvolutionState>({
    activeSkillId: null,
    versionChain: [],
    evolvingSkillIds: [],
    lastScanTimestamp: 0,
  });

  const [activeGenome, setActiveGenome] = useState<SkillGenome | null>(null);
  const [activeVersions, setActiveVersions] = useState<SkillVersion[]>([]);

  // Load genome when active skill changes
  useEffect(() => {
    if (state.activeSkillId) {
      const genome = loadGenome(state.activeSkillId);
      setActiveGenome(genome);
      
      const versions = getVersions(state.activeSkillId);
      setActiveVersions(versions);
      
      if (genome) {
        setState(prev => ({
          ...prev,
          versionChain: genome.versionChain,
        }));
      }
    } else {
      setActiveGenome(null);
      setActiveVersions([]);
    }
  }, [state.activeSkillId]);

  /**
   * Set the active skill to view
   */
  const setActiveSkill = useCallback((skillId: string | null) => {
    setState(prev => ({
      ...prev,
      activeSkillId: skillId,
    }));
  }, []);

  /**
   * Record feedback for a skill (called after skill execution)
   */
  const recordFeedback = useCallback((skillId: string, success: boolean) => {
    evolutionEngine.recordFeedback(skillId, success);
  }, []);

  /**
   * Force an immediate evolution scan
   */
  const forceScan = useCallback(async () => {
    await evolutionEngine.scan();
    setState(prev => ({
      ...prev,
      lastScanTimestamp: Date.now(),
    }));
  }, []);

  /**
   * Get genome for any skill
   */
  const getGenome = useCallback((skillId: string): SkillGenome | null => {
    return loadGenome(skillId);
  }, []);

  return {
    state,
    activeGenome,
    activeVersions,
    setActiveSkill,
    recordFeedback,
    forceScan,
    getGenome,
  };
}