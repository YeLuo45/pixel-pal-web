/**
 * V133 Skill Marketplace - React Hook
 * Exposes marketplace state and actions to React components.
 */

import { useState, useEffect, useCallback } from 'react';
import type { MarketplaceSkill, SkillRating } from '../data/sampleMarketplaceSkills';
import { getCommunitySkills, addSkillRating, installMarketplaceSkill, isSkillInstalled } from '../services/marketplace/marketplaceService';
import { skillPublisher, type PublishOptions, type PublishResult } from '../services/marketplace/SkillPublisher';
import { skillInstaller } from '../services/marketplace/SkillInstaller';
import { searchSkills, type SearchOptions, type SearchResult, recommendSkills, type RecommendOptions } from '../services/marketplace/DiscoveryEngine';
import type { SkillDefinition } from '../services/skills/types';

export interface UseMarketplaceReturn {
  // Skills list
  marketplaceSkills: MarketplaceSkill[];
  localSkills: SkillDefinition[];
  publishedSkills: MarketplaceSkill[];
  // Search
  searchResults: SearchResult[];
  search: (options: SearchOptions) => void;
  clearSearch: () => void;
  // Recommend
  recommendedSkills: MarketplaceSkill[];
  recommend: (options: RecommendOptions) => void;
  // Install / Update / Uninstall
  installSkill: (skill: MarketplaceSkill) => Promise<{ success: boolean; error?: string }>;
  updateSkill: (skill: MarketplaceSkill) => Promise<{ success: boolean; fromVersion?: string; toVersion?: string; error?: string }>;
  uninstallSkill: (skillId: string) => Promise<{ success: boolean; error?: string }>;
  // Publish
  publishSkill: (skill: SkillDefinition, changelog?: string) => Promise<PublishResult>;
  // Rating
  rateSkill: (skillId: string, rating: 1 | 2 | 3 | 4 | 5, review?: string) => void;
  getSkillRatings: (skillId: string) => SkillRating[];
  getAverageRating: (skillId: string) => number;
  // Installed check
  installedSkillIds: Set<string>;
  checkInstalled: (skillId: string) => Promise<boolean>;
  // Loading
  isLoading: boolean;
}

export function useMarketplace(): UseMarketplaceReturn {
  const [marketplaceSkills, setMarketplaceSkills] = useState<MarketplaceSkill[]>([]);
  const [localSkills, setLocalSkills] = useState<SkillDefinition[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recommendedSkills, setRecommendedSkills] = useState<MarketplaceSkill[]>([]);
  const [installedSkillIds, setInstalledSkillIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load marketplace catalog
  useEffect(() => {
    const load = async () => {
      try {
        const skills = getCommunitySkills();
        setMarketplaceSkills(skills);

        // Check installed status for each skill
        const installed = new Set<string>();
        for (const skill of skills) {
          if (await isSkillInstalled(skill.id)) {
            installed.add(skill.id);
          }
        }
        setInstalledSkillIds(installed);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const search = useCallback((options: SearchOptions) => {
    const results = searchSkills(marketplaceSkills, options);
    setSearchResults(results);
  }, [marketplaceSkills]);

  const clearSearch = useCallback(() => setSearchResults([]), []);

  const recommend = useCallback((options: RecommendOptions) => {
    const rec = recommendSkills(marketplaceSkills, options);
    setRecommendedSkills(rec);
  }, [marketplaceSkills]);

  const installSkill = useCallback(async (skill: MarketplaceSkill) => {
    const result = await skillInstaller.install(skill);
    if (result.success) {
      setInstalledSkillIds((prev) => new Set([...prev, skill.id]));
      const skills = getCommunitySkills();
      setMarketplaceSkills(skills);
    }
    return result;
  }, []);

  const updateSkill = useCallback(async (skill: MarketplaceSkill) => {
    const result = await skillInstaller.update(skill);
    return result;
  }, []);

  const uninstallSkill = useCallback(async (skillId: string) => {
    const result = await skillInstaller.uninstall(skillId);
    if (result.success) {
      setInstalledSkillIds((prev) => {
        const next = new Set(prev);
        next.delete(skillId);
        return next;
      });
    }
    return result;
  }, []);

  const publishSkill = useCallback(async (skill: SkillDefinition, changelog?: string) => {
    const result = await skillPublisher.publish({ skill, changelog } as PublishOptions);
    return result;
  }, []);

  const rateSkill = useCallback((skillId: string, rating: 1 | 2 | 3 | 4 | 5, review?: string) => {
    addSkillRating(skillId, {
      userId: 'local-user',
      rating,
      review,
      createdAt: new Date().toISOString(),
    } as SkillRating);
    const skills = getCommunitySkills();
    setMarketplaceSkills(skills);
  }, []);

  const getSkillRatings = useCallback((skillId: string): SkillRating[] => {
    const { getSkillRatings: getRatings } = require('../services/marketplace/marketplaceService');
    return getRatings(skillId);
  }, []);

  const getAverageRating = useCallback((skillId: string): number => {
    const ratings = getSkillRatings(skillId);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  }, [getSkillRatings]);

  const checkInstalled = useCallback(async (skillId: string) => {
    return installedSkillIds.has(skillId);
  }, [installedSkillIds]);

  const publishedSkills = marketplaceSkills.filter((s) => s.author !== 'anon');

  return {
    marketplaceSkills,
    localSkills,
    publishedSkills,
    searchResults,
    search,
    clearSearch,
    recommendedSkills,
    recommend,
    installSkill,
    updateSkill,
    uninstallSkill,
    publishSkill,
    rateSkill,
    getSkillRatings,
    getAverageRating,
    installedSkillIds,
    checkInstalled,
    isLoading,
  };
}

export default useMarketplace;
