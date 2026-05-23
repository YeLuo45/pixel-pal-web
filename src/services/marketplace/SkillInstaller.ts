/**
 * V133 Skill Marketplace - Skill Installer
 * Install/update/uninstall skills locally.
 */

import type { SkillDefinition } from '../skills/types';
import type { MarketplaceSkill } from '../../data/sampleMarketplaceSkills';
import { saveCustomSkill, deleteCustomSkill, getCustomSkills } from '../skills/skillStorage';
import { skillRegistry } from '../skills/skillRegistry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InstallResult {
  success: boolean;
  skillId: string;
  version?: string;
  error?: string;
}

export interface UninstallResult {
  success: boolean;
  skillId: string;
  error?: string;
}

export interface UpdateResult {
  success: boolean;
  skillId: string;
  fromVersion: string;
  toVersion: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// SkillInstaller
// ---------------------------------------------------------------------------

class SkillInstallerImpl {
  /**
   * Install a marketplace skill to local registry.
   */
  async install(skill: MarketplaceSkill): Promise<InstallResult> {
    try {
      const existing = await this.getInstalledSkill(skill.id);
      if (existing) {
        return { success: false, skillId: skill.id, error: 'Already installed' };
      }
      const definition = this.toSkillDefinition(skill);
      await saveCustomSkill(definition);
      await skillRegistry.loadSkills();
      return { success: true, skillId: skill.id, version: skill.version };
    } catch (err) {
      return { success: false, skillId: skill.id, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Update an installed skill to a newer version from the marketplace.
   */
  async update(skill: MarketplaceSkill): Promise<UpdateResult> {
    try {
      const existing = await this.getInstalledSkill(skill.id);
      if (!existing) {
        return { success: false, skillId: skill.id, fromVersion: '', toVersion: '', error: 'Not installed' };
      }
      const fromVersion = existing.version;
      if (!this.isNewer(skill.version, fromVersion)) {
        return { success: false, skillId: skill.id, fromVersion, toVersion: skill.version, error: 'Not newer' };
      }
      const definition = this.toSkillDefinition(skill);
      await saveCustomSkill(definition);
      await skillRegistry.loadSkills();
      return { success: true, skillId: skill.id, fromVersion, toVersion: skill.version };
    } catch (err) {
      return { success: false, skillId: skill.id, fromVersion: '', toVersion: skill.version, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Uninstall a locally installed skill.
   */
  async uninstall(skillId: string): Promise<UninstallResult> {
    try {
      const existing = await this.getInstalledSkill(skillId);
      if (!existing) return { success: false, skillId, error: 'Not installed' };
      const isPreset = await this.isPresetSkill(skillId);
      if (isPreset) return { success: false, skillId, error: 'Cannot uninstall preset skill' };
      await deleteCustomSkill(skillId);
      await skillRegistry.loadSkills();
      return { success: true, skillId };
    } catch (err) {
      return { success: false, skillId, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async isInstalled(skillId: string): Promise<boolean> {
    const skill = await this.getInstalledSkill(skillId);
    return skill !== null;
  }

  async getInstalledMarketplaceSkills(): Promise<SkillDefinition[]> {
    const customSkills = await getCustomSkills();
    return customSkills.filter((s) => s.id.startsWith('marketplace-') || s.id.startsWith('markettplace-'));
  }

  private async getInstalledSkill(skillId: string): Promise<SkillDefinition | null> {
    return skillRegistry.getSkill(skillId) ?? null;
  }

  private async isPresetSkill(skillId: string): Promise<boolean> {
    const { presetSkills } = await import('../skills/presetSkills');
    return presetSkills.some((p) => p.id === skillId);
  }

  private toSkillDefinition(skill: MarketplaceSkill): SkillDefinition {
    return {
      id: skill.id, name: skill.name, description: skill.description, icon: skill.icon,
      version: skill.version, author: skill.author, category: skill.category, tags: skill.tags,
      chatTriggerable: skill.chatTriggerable, chatKeywords: skill.chatKeywords, order: skill.order,
      enabled: true, systemPrompt: skill.systemPrompt, examplePrompts: skill.examplePrompts,
      requiredContext: skill.requiredContext, optionalContext: skill.optionalContext,
      maxSteps: skill.maxSteps, showSteps: skill.showSteps,
    };
  }

  private isNewer(a: string, b: string): boolean {
    const ap = a.split('.').map(Number);
    const bp = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const av = ap[i] ?? 0;
      const bv = bp[i] ?? 0;
      if (av > bv) return true;
      if (av < bv) return false;
    }
    return false;
  }
}

export const skillInstaller = new SkillInstallerImpl();
export { SkillInstallerImpl };
export default skillInstaller;
