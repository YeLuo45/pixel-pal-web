/**
 * V133 Skill Marketplace - Skill Publisher
 * Bundles a skill (genome + manifest) and uploads to GitHub Gist.
 */

import type { SkillDefinition } from '../skills/types';
import type { MarketplaceSkill } from '../../data/sampleMarketplaceSkills';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PublishOptions {
  /** The skill definition to publish */
  skill: SkillDefinition;
  /** Optional changelog / release notes */
  changelog?: string;
  /** GitHub token for authenticated upload */
  githubToken?: string;
}

export interface PublishResult {
  success: boolean;
  skillId: string;
  version: string;
  shareableUrl: string;
  gistId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// SkillGenome — extracted from SkillDefinition for sharing
// ---------------------------------------------------------------------------

export interface SkillGenome {
  coreKeywords: string[];
  applicableEmotions: string[];
  successConditions: string[];
  failurePatterns: string[];
  evolutionHints: string[];
}

/**
 * Extract a minimal genome from a skill definition.
 * The genome captures the "genetic essence" of a skill for marketplace sharing.
 */
export function extractGenome(skill: SkillDefinition): SkillGenome {
  return {
    coreKeywords: [
      skill.name.toLowerCase(),
      ...skill.tags,
      ...skill.chatKeywords,
    ].slice(0, 20),
    applicableEmotions: inferEmotions(skill),
    successConditions: inferSuccessConditions(skill),
    failurePatterns: inferFailurePatterns(skill),
    evolutionHints: [],
  };
}

function inferEmotions(skill: SkillDefinition): string[] {
  const categoryEmotionMap: Record<string, string[]> = {
    productivity: ['focused', 'productive', 'organized'],
    creative: ['inspired', 'creative', 'curious'],
    analysis: ['logical', 'analytical', 'systematic'],
    lifestyle: ['relaxed', 'balanced', 'mindful'],
    developer: ['focused', 'problem-solving', 'logical'],
    entertainment: ['playful', 'fun', 'relaxed'],
    custom: [],
  };
  return categoryEmotionMap[skill.category] ?? [];
}

function inferSuccessConditions(skill: SkillDefinition): string[] {
  return [
    `User invoked skill via keyword: ${skill.chatKeywords.join(', ')}`,
    `Skill goal achieved within ${skill.maxSteps} steps`,
  ];
}

function inferFailurePatterns(skill: SkillDefinition): string[] {
  return [
    `Skill returned no response after ${skill.maxSteps} steps`,
    'Skill execution exceeded time limit',
  ];
}

// ---------------------------------------------------------------------------
// SkillPublisher
// ---------------------------------------------------------------------------

class SkillPublisherImpl {
  /**
   * Publish a skill to the marketplace (uploads to GitHub Gist).
   * Returns a shareable URL on success.
   */
  async publish(options: PublishOptions): Promise<PublishResult> {
    const { skill, changelog = '', githubToken } = options;

    try {
      // Build the skill package
      const pkg = this.buildPackage(skill, changelog);

      // Upload to Gist (or simulate for now)
      const gistResult = await this.uploadToGist(pkg, githubToken);

      return {
        success: true,
        skillId: skill.id,
        version: skill.version,
        shareableUrl: `https://pixel-pal.market/${skill.id}@${skill.version}`,
        gistId: gistResult.gistId,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        skillId: skill.id,
        version: skill.version,
        shareableUrl: '',
        error: errorMsg,
      };
    }
  }

  /**
   * Bundle a skill into a MarketplaceSkill package.
   */
  private buildPackage(skill: SkillDefinition, changelog: string): MarketplaceSkill {
    const genome = extractGenome(skill);

    const marketplaceSkill: MarketplaceSkill = {
      ...skill,
      installCount: 0,
      avgRating: 0,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attach genome as extended property (not in original type)
    (marketplaceSkill as unknown as { genome: SkillGenome }).genome = genome;

    return marketplaceSkill;
  }

  /**
   * Upload package content to GitHub Gist.
   * Falls back to a simulated result if no token provided.
   */
  private async uploadToGist(
    pkg: MarketplaceSkill,
    token?: string
  ): Promise<{ gistId: string; url: string }> {
    const content = JSON.stringify(pkg, null, 2);
    const filename = `${pkg.id}@${pkg.version}.json`;

    if (!token) {
      // Simulated publish — in production, this would POST to GitHub Gist API
      console.warn('[SkillPublisher] No GitHub token provided, simulating publish.');
      const fakeGistId = `fake-${Date.now()}`;
      return {
        gistId: fakeGistId,
        url: `https://gist.github.com/anonymous/${fakeGistId}`,
      };
    }

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        description: `PixelPal Skill: ${pkg.name} v${pkg.version}`,
        public: true,
        files: {
          [filename]: { content },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gist upload failed (${response.status}): ${errText}`);
    }

    const result = await response.json() as { id: string; html_url: string };
    return { gistId: result.id, url: result.html_url };
  }

  /**
   * Get the Gist raw URL for a previously published skill.
   */
  getGistRawUrl(gistId: string, filename: string): string {
    return `https://gist.githubusercontent.com/YeLuo45/${gistId}/raw/${filename}`;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const skillPublisher = new SkillPublisherImpl();

export { SkillPublisherImpl };
export default skillPublisher;