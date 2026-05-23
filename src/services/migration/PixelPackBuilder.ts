/**
 * V141: PixelPackBuilder — builds .pixelpack package with HMAC signature
 */
import type { SkillManifest, SkillGenome } from '../skills/types';
import type { SkillProvenance } from '../provenance/types';
import type { VerificationReport } from '../verification/types';

export interface LayerSnapshot {
  layer: string;
  data: Record<string, unknown>;
  encrypted: boolean;
}

export interface PixelPack {
  version: string;
  skillId: string;
  platformSource: 'web' | 'ios' | 'android' | 'desktop';
  exportedAt: string;
  manifest: SkillManifest;
  genome: SkillGenome;
  memorySnapshot: {
    layers: LayerSnapshot[];
    encrypted: boolean;
    encryptionKey?: string;
  };
  provenanceChain: SkillProvenance[];
  verificationReport?: VerificationReport;
  signature: string;
}

const HMAC_KEY = 'pixelpal-skill-migration-v1'; // In production, derive from user password

function hmacSign(data: string, key: string): string {
  // Simplified HMAC-SHA256 using Web Crypto API
  const enc = new TextEncoder();
  const keyData = enc.encode(key);
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(cryptoKey => crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data)))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
}

export async function buildPixelPack(opts: {
  skillId: string;
  manifest: SkillManifest;
  genome: SkillGenome;
  memorySnapshot: LayerSnapshot[];
  provenanceChain: SkillProvenance[];
  verificationReport?: VerificationReport;
  encrypted?: boolean;
  encryptionPassword?: string;
  platformSource?: 'web' | 'ios' | 'android' | 'desktop';
}): Promise<PixelPack> {
  const pack: PixelPack = {
    version: '1.0',
    skillId: opts.skillId,
    platformSource: opts.platformSource ?? 'web',
    exportedAt: new Date().toISOString(),
    manifest: opts.manifest,
    genome: opts.genome,
    memorySnapshot: {
      layers: opts.memorySnapshot,
      encrypted: opts.encrypted ?? false,
      encryptionKey: opts.encryptionPassword,
    },
    provenanceChain: opts.provenanceChain,
    verificationReport: opts.verificationReport,
    signature: '',
  };
  const dataToSign = JSON.stringify({ skillId: pack.skillId, version: pack.version, manifest: pack.manifest, genome: pack.genome });
  pack.signature = await hmacSign(dataToSign, HMAC_KEY);
  return pack;
}

export function serializePack(pack: PixelPack): ArrayBuffer {
  const json = JSON.stringify(pack);
  const enc = new TextEncoder();
  const buf = enc.encode(json);
  return buf.buffer;
}

export async function exportAsFile(pack: PixelPack, filename: string): Promise<void> {
  const buf = serializePack(pack);
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pixelpack') ? filename : `${filename}.pixelpack`;
  a.click();
  URL.revokeObjectURL(url);
}