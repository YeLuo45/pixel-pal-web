/**
 * V133 Skill Marketplace - Marketplace Client
 * Fetches and parses the skill marketplace catalog from CDN/Gist.
 */

import type { MarketplaceSkill } from '../../data/sampleMarketplaceSkills';
import { sampleMarketplaceSkills } from '../../data/sampleMarketplaceSkills';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarketplaceCatalog {
  version: string;
  updatedAt: string;
  skills: MarketplaceSkill[];
}

export interface MarketplaceClientOptions {
  /** Base URL for the marketplace CDN/Gist */
  baseUrl?: string;
  /** Gist ID for community catalog */
  gistId?: string;
  /** Token for authenticated Gist access */
  gistToken?: string;
}

// ---------------------------------------------------------------------------
// Default catalog URL (placeholder — replace with real CDN/Gist endpoint)
// ---------------------------------------------------------------------------

const DEFAULT_CATALOG_URL = 'https://raw.githubusercontent.com/YeLuo45/pixel-pal-web/main/src/data/marketplace-catalog.json';

// ---------------------------------------------------------------------------
// MarketplaceClient
// ---------------------------------------------------------------------------

class MarketplaceClientImpl {
  private baseUrl: string;
  private gistId?: string;
  private gistToken?: string;
  private cachedCatalog: MarketplaceCatalog | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(options: MarketplaceClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_CATALOG_URL;
    this.gistId = options.gistId;
    this.gistToken = options.gistToken;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Fetch the marketplace catalog (with caching).
   * Falls back to local sample skills if remote is unavailable.
   */
  async getCatalog(forceRefresh = false): Promise<MarketplaceCatalog> {
    if (!forceRefresh && this.cachedCatalog && Date.now() - this.cacheTimestamp < this.CACHE_TTL_MS) {
      return this.cachedCatalog;
    }

    try {
      const catalog = await this.fetchRemoteCatalog();
      this.cachedCatalog = catalog;
      this.cacheTimestamp = Date.now();
      return catalog;
    } catch (err) {
      console.warn('[MarketplaceClient] Failed to fetch remote catalog, using local samples:', err);
      return this.getLocalCatalog();
    }
  }

  /**
   * Get all marketplace skills (alias for getCatalog().then(c => c.skills)).
   */
  async getSkills(): Promise<MarketplaceSkill[]> {
    const catalog = await this.getCatalog();
    return catalog.skills;
  }

  /**
   * Get a single skill by ID from the marketplace.
   */
  async getSkill(skillId: string): Promise<MarketplaceSkill | undefined> {
    const skills = await this.getSkills();
    return skills.find((s) => s.id === skillId);
  }

  /**
   * Check if a newer version of a skill is available in the marketplace.
   */
  async checkUpdate(skillId: string, currentVersion: string): Promise<MarketplaceSkill | null> {
    const remote = await this.getSkill(skillId);
    if (!remote) return null;
    if (this.isNewerVersion(remote.version, currentVersion)) {
      return remote;
    }
    return null;
  }

  /**
   * Get the shareable URL for a skill package.
   */
  getShareableUrl(skillId: string, version: string): string {
    return `https://pixel-pal.market/${skillId}@${version}`;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async fetchRemoteCatalog(): Promise<MarketplaceCatalog> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (this.gistToken) {
      headers['Authorization'] = `Bearer ${this.gistToken}`;
    }

    const response = await fetch(this.baseUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json() as Promise<MarketplaceCatalog>;
  }

  private getLocalCatalog(): MarketplaceCatalog {
    return {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      skills: sampleMarketplaceSkills,
    };
  }

  private isNewerVersion(remoteVersion: string, currentVersion: string): boolean {
    const toParts = (v: string) => v.split('.').map(Number);
    const remote = toParts(remoteVersion);
    const current = toParts(currentVersion);
    for (let i = 0; i < 3; i++) {
      const r = remote[i] ?? 0;
      const c = current[i] ?? 0;
      if (r > c) return true;
      if (r < c) return false;
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const marketplaceClient = new MarketplaceClientImpl();

export { MarketplaceClientImpl };
export default marketplaceClient;