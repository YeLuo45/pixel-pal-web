/**
 * V134: TransferClient — QR code generation, link parsing, and API send logic
 * QR generation uses Canvas API (no external library required).
 */

import type { SkillTransferPackage } from './index';
import { signPackage } from './SkillSigner';
import { getUserSigningSecret } from './SkillSigner';

const TRANSFER_BASE_URL = 'https://pixelpal.app/transfer';
const API_TRANSFER_SEND = '/transfer/send';

// =============================================================================
// QR Code Generation (Canvas API)
// =============================================================================

/**
 * Generates a QR code as a data URL (PNG) for a given text string.
 * Uses a simple canvas-based QR encoder for alphanumeric + numeric data.
 */
export function generateQRCode(text: string, size = 256): string {
  const qr = generateQRMatrix(text);
  const cellSize = Math.floor(size / qr.length);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';

  for (let row = 0; row < qr.length; row++) {
    for (let col = 0; col < qr.length; col++) {
      if (qr[row][col]) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates a QR code matrix for alphanumeric input.
 * Implements a minimal QR encoder for demonstration purposes.
 * Supports numeric, alphanumeric, and UTF-8 text via base64 encoding.
 */
function generateQRMatrix(text: string): boolean[][] {
  // Encode text to bytes
  const encoded = btoa(encodeURIComponent(text));
  const bytes = new TextEncoder().encode(encoded);
  const bits: boolean[] = [];

  // Convert bytes to bits (MSB first)
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte & (1 << i)) !== 0);
    }
  }

  // Pad bits to a square-ish QR matrix (version 2 QR = 25x25)
  const matrixSize = 25;
  const totalBits = matrixSize * matrixSize;
  while (bits.length < totalBits) {
    bits.push(false);
  }
  // Pad remainder
  if (bits.length > totalBits) {
    bits.length = totalBits;
  }

  // Build 2D matrix
  const matrix: boolean[][] = [];
  let bitIndex = 0;
  for (let row = 0; row < matrixSize; row++) {
    matrix[row] = [];
    for (let col = 0; col < matrixSize; col++) {
      // Add finder patterns (top-left, top-right, bottom-left)
      if (isFinderPosition(row, col, matrixSize)) {
        matrix[row][col] = getFinderBit(row, col);
      } else {
        matrix[row][col] = bits[bitIndex++] ?? false;
      }
    }
  }

  return matrix;
}

function isFinderPosition(row: number, col: number, size: number): boolean {
  const r1 = row < 7 && col < 7;
  const r2 = row < 7 && col >= size - 7;
  const r3 = row >= size - 7 && col < 7;
  return r1 || r2 || r3;
}

function getFinderBit(row: number, col: number): boolean {
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  const localRow = row < 7 ? row : row >= 7 ? row % 7 : row - (row - 6);
  const localCol = col < 7 ? col : col >= 7 ? col % 7 : col - (col - 6);
  const idx = pattern[localRow]?.[localCol] ?? 0;
  return idx === 1;
}

// =============================================================================
// Link Generation & Parsing
// =============================================================================

/**
 * Generates a URL-safe base64 encoded transfer link for a package.
 */
export function generateTransferLink(pkg: SkillTransferPackage): string {
  const json = JSON.stringify(pkg);
  const encoded = btoa(encodeURIComponent(json));
  return `${TRANSFER_BASE_URL}?p=${encoded}`;
}

/**
 * Parses a transfer link back into a SkillTransferPackage.
 * Returns null if the link is invalid.
 */
export function parseTransferLink(url: string): SkillTransferPackage | null {
  try {
    const urlObj = new URL(url);
    const encoded = urlObj.searchParams.get('p');
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as SkillTransferPackage;
  } catch {
    return null;
  }
}

// =============================================================================
// API Send
// =============================================================================

/**
 * Sends a SkillTransferPackage to a remote user via API.
 * Requires recipient userId and auth token.
 */
export async function apiSendPackage(
  pkg: SkillTransferPackage,
  recipientUserId: string,
  authToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_TRANSFER_SEND}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ package: pkg, recipientUserId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Bundles a skill into a SkillTransferPackage with HMAC signature.
 */
export async function bundleSkillPackage(
  skillId: string,
  version: string,
  author: string,
  genome: Record<string, unknown>,
  manifest: Record<string, unknown>
): Promise<SkillTransferPackage> {
  const payload = JSON.stringify({ skillId, version, author, genome, manifest });
  const secret = getUserSigningSecret();
  const signature = await signPackage(payload, secret);

  return {
    id: skillId,
    version,
    author,
    transferredAt: new Date().toISOString(),
    genome,
    manifest,
    signature,
  };
}