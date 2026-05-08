/**
 * PluginRegistry — singleton that manages all plugins (preset + user-installed)
 *
 * Load order:
 *   1. Register preset plugins (always enabled, always available)
 *   2. Load user plugins from IndexedDB and register those that are enabled
 */

import type { Plugin } from '../../types/plugin';
import { presetPlugins } from './presetPlugins';
import * as pluginStorage from '../storage/pluginStorage';

class PluginRegistryImpl {
  private plugins = new Map<string, Plugin>();

  /** Load all plugins — call once at app startup */
  async loadPlugins(): Promise<void> {
    // 1. Register preset plugins (always)
    for (const plugin of presetPlugins) {
      this.plugins.set(plugin.id, plugin);
    }

    // 2. Load user-installed plugins from IndexedDB
    try {
      const userPlugins = await pluginStorage.getPlugins();
      for (const plugin of userPlugins) {
        if (plugin.enabled) {
          this.plugins.set(plugin.id, plugin);
        }
      }
    } catch (err) {
      console.error('[PluginRegistry] Failed to load user plugins:', err);
    }
  }

  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter((p) => p.enabled);
  }

  async enablePlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    plugin.enabled = true;
    this.plugins.set(id, plugin);

    // Persist if user-installed (not a preset)
    if (!presetPlugins.find((p) => p.id === id)) {
      await pluginStorage.setEnabled(id, true);
    }
  }

  async disablePlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    plugin.enabled = false;
    this.plugins.set(id, plugin);

    if (!presetPlugins.find((p) => p.id === id)) {
      await pluginStorage.setEnabled(id, false);
    }
  }

  /** Execute a plugin action by pluginId + actionId */
  async executeAction(
    pluginId: string,
    actionId: string,
    params: Record<string, string>
  ): Promise<string> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`[PluginRegistry] Plugin "${pluginId}" not found`);
    }

    if (!plugin.enabled) {
      throw new Error(`[PluginRegistry] Plugin "${pluginId}" is disabled`);
    }

    const action = plugin.actions.find((a) => a.id === actionId);
    if (!action) {
      throw new Error(`[PluginRegistry] Action "${actionId}" not found on plugin "${pluginId}"`);
    }

    try {
      return await action.handler(params);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`[PluginRegistry] Action "${actionId}" failed: ${msg}`);
    }
  }
}

export const pluginRegistry = new PluginRegistryImpl();
