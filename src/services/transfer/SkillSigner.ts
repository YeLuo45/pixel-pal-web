/**
 * V134: SkillSigner — HMAC-SHA256 signing and verification for Skill Transfer Packages
 * Uses Web Crypto API for cross-platform secure signing.
 */

const encoder = new TextEncoder();

async function deriveKey(userSecret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userSecret),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('pixel-pal-skill-transfer-v134'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign', 'verify']
  );
}

export async function signPackage(pkg: object, userSecret: string): Promise<string> {
  const key = await deriveKey(userSecret);
  const data = encoder.encode(JSON.stringify(pkg));
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function verifySignature(pkg: object, signature: string, userSecret: string): Promise<boolean> {
  try {
    const key = await deriveKey(userSecret);
    const data = encoder.encode(JSON.stringify(pkg));
    const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sigBytes, data);
  } catch {
    return false;
  }
}

export function getUserSigningSecret(): string {
  const stored = localStorage.getItem('pixelpal_user_secret');
  if (stored) return stored;
  const secret = crypto.randomUUID();
  localStorage.setItem('pixelpal_user_secret', secret);
  return secret;
}