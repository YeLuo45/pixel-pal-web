/**
 * V141: PlatformAdapter — platform-specific memory/API adaptation
 */
import type { LayerSnapshot } from './PixelPackBuilder';

export type Platform = 'web' | 'ios' | 'android' | 'desktop';

export interface PlatformAdapter {
  platform: Platform;
  mapMemoryLayer(snapshot: LayerSnapshot): LayerSnapshot;
  adaptAPIs(skillCode: string): string;
  getStoragePath(skillId: string): string;
}

function genericAdapter(source: Platform): PlatformAdapter {
  return {
    platform: source,
    mapMemoryLayer(snapshot: LayerSnapshot): LayerSnapshot {
      // For now, all platforms use the same format
      return snapshot;
    },
    adaptAPIs(skillCode: string): string {
      // Replace platform-specific API calls with compatible equivalents
      return skillCode
        .replace(/window\.localStorage/g, 'localStorage')
        .replace(/navigator\.userAgent/g, '"web"');
    },
    getStoragePath(skillId: string): string {
      return `skills/${skillId}/`;
    },
  };
}

export function getPlatformAdapter(platform: Platform): PlatformAdapter {
  return genericAdapter(platform);
}