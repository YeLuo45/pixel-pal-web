/**
 * V133 Skill Marketplace - Discovery Engine
 * Search + recommendation using keyword matching, tag affinity, emotion, and rating.
 */

import type { MarketplaceSkill } from '../../data/sampleMarketplaceSkills';

export interface SearchOptions {
  query?: string;
  tags?: string[];
  emotion?: string;
  sortBy?: 'relevance' | 'rating' | 'installs' | 'newest';
  minRating?: number;
}

export interface SearchResult {
  skill: MarketplaceSkill;
  score: number;
  matchedOn: string[];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(Boolean);
}

function computeScore(query: string, skill: MarketplaceSkill): number {
  const queryTokens = tokenize(query);
  const nameTokens = tokenize(skill.name);
  const descTokens = tokenize(skill.description);
  const tagTokens = skill.tags.map((t) => t.toLowerCase());
  const keywordTokens = skill.chatKeywords.map((k) => k.toLowerCase());
  let score = 0;
  for (const qt of queryTokens) {
    if (tagTokens.some((t) => t === qt)) { score += 10; }
    else if (nameTokens.some((n) => n.includes(qt) || qt.includes(n))) { score += 6; }
    else if (keywordTokens.some((k) => k.includes(qt) || qt.includes(k))) { score += 4; }
    else if (descTokens.some((d) => d.includes(qt) || qt.includes(d))) { score += 2; }
  }
  return score;
}

export function searchSkills(skills: MarketplaceSkill[], options: SearchOptions): SearchResult[] {
  const { query = '', tags = [], emotion, sortBy = 'relevance', minRating } = options;
  const results: SearchResult[] = [];
  for (const skill of skills) {
    if (minRating !== undefined && skill.avgRating < minRating) continue;
    let score = 0;
    const matchedOn: string[] = [];
    if (query.trim()) {
      score += computeScore(query, skill);
      const tokens = tokenize(query);
      for (const qt of tokens) {
        if (skill.tags.some((t) => t.toLowerCase().includes(qt))) matchedOn.push(`tag:${qt}`);
        else if (skill.name.toLowerCase().includes(qt)) matchedOn.push(`name:${qt}`);
        else if (skill.chatKeywords.some((k) => k.toLowerCase().includes(qt))) matchedOn.push(`keyword:${qt}`);
        else if (skill.description.toLowerCase().includes(qt)) matchedOn.push(`desc:${qt}`);
      }
    }
    if (tags.length > 0) {
      const skillTagsLower = skill.tags.map((t) => t.toLowerCase());
      const allMatch = tags.every((tag) => skillTagsLower.some((st) => st.includes(tag.toLowerCase())));
      if (!allMatch) continue;
      score += 3 * tags.length;
      matchedOn.push(...tags.map((t) => `tag:${t}`));
    }
    if (emotion) {
      const emotionLower = emotion.toLowerCase();
      const genomeEmotions = (skill as unknown as { genome?: { applicableEmotions?: string[] } }).genome?.applicableEmotions ?? [];
      const descLower = skill.description.toLowerCase();
      const tagLower = skill.tags.join(' ').toLowerCase();
      if (genomeEmotions.some((e) => e.toLowerCase().includes(emotionLower)) || descLower.includes(emotionLower) || tagLower.includes(emotionLower)) {
        score += 5;
        matchedOn.push(`emotion:${emotion}`);
      } else { continue; }
    }
    if (score <= 0 && query.trim()) continue;
    results.push({ skill, score, matchedOn });
  }
  switch (sortBy) {
    case 'rating': results.sort((a, b) => b.skill.avgRating - a.skill.avgRating); break;
    case 'installs': results.sort((a, b) => b.skill.installCount - a.skill.installCount); break;
    case 'newest': results.sort((a, b) => new Date(b.skill.updatedAt).getTime() - new Date(a.skill.updatedAt).getTime()); break;
    case 'relevance': results.sort((a, b) => b.score - a.score); break;
  }
  return results;
}

export interface RecommendOptions {
  currentEmotion?: string;
  preferredTags?: string[];
  minRating?: number;
  limit?: number;
}

export function recommendSkills(skills: MarketplaceSkill[], options: RecommendOptions): MarketplaceSkill[] {
  const { currentEmotion, preferredTags = [], minRating = 0, limit = 10 } = options;
  const scored = skills.filter((s) => s.avgRating >= minRating).map((skill) => {
    let score = 0;
    if (preferredTags.length > 0) {
      const skillTagsLower = skill.tags.map((t) => t.toLowerCase());
      const matchCount = preferredTags.filter((pt) => skillTagsLower.some((st) => st.includes(pt.toLowerCase()))).length;
      score += matchCount * 2;
    }
    if (currentEmotion) {
      const emotionLower = currentEmotion.toLowerCase();
      const genome = (skill as unknown as { genome?: { applicableEmotions?: string[] } }).genome;
      if (genome?.applicableEmotions?.some((e) => e.toLowerCase().includes(emotionLower))) score += 3;
    }
    score += (skill.avgRating / 5) * 5;
    score += Math.log10(skill.installCount + 1) * 0.5;
    return { skill, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.skill);
}

export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;
  const tokens = tokenize(query);
  let result = text;
  for (const token of tokens) {
    const regex = new RegExp(`(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '**$1**');
  }
  return result;
}
