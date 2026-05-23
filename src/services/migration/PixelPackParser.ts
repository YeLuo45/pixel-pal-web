/**
 * V141: PixelPackParser — parses .pixelpack + verifies HMAC signature
 */
import type { PixelPack } from './PixelPackBuilder';

const HMAC_KEY = 'pixelpal-skill-migration-v1';

async function verifyHmac(data: string, signature: string, key: string): Promise<boolean> {
  const enc = new TextEncoder();
  const keyData = enc.encode(key);
  const expected = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(cryptoKey => crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data)));
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  const expBytes = new Uint8Array(expected);
  if (sigBytes.length !== expBytes.length) return false;
  return sigBytes.every((b, i) => b === expBytes[i]);
}

export async function parsePixelPack(buffer: ArrayBuffer): Promise<PixelPack> {
  const dec = new TextDecoder();
  const json = dec.decode(buffer);
  const pack = JSON.parse(json) as PixelPack;
  if (!pack.version || !pack.signature) throw new Error('Invalid .pixelpack format');
  return pack;
}

export async function verifyPackSignature(pack: PixelPack): Promise<{ valid: boolean; error?: string }> {
  try {
    const dataToSign = JSON.stringify({ skillId: pack.skillId, version: pack.version, manifest: pack.manifest, genome: pack.genome });
    const valid = await verifyHmac(dataToSign, pack.signature, HMAC_KEY);
    return { valid };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function checkPlatformCompatibility(pack: PixelPack, targetPlatform: string): { compatible: boolean; issues: string[] } {
  const issues: string[] = [];
  if (pack.platformSource !== targetPlatform) {
    issues.push(`Pack from ${pack.platformSource}, targeting ${targetPlatform} — some API adapters may be needed`);
  }
  return { compatible: issues.length === 0, issues };
}