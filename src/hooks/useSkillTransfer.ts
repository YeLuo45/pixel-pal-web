/**
 * V134: useSkillTransfer hook
 */
import { useState, useCallback } from 'react';
import { generateTransferLink, parseTransferLink, bundleSkillPackage } from '../services/transfer';
import { verifySignature, getUserSigningSecret } from '../services/transfer';
import type { SkillTransferPackage } from '../services/transfer/types';

export function useSkillTransfer() {
  const [sending, setSending] = useState(false);
  const [receiving, setReceiving] = useState(false);

  const sendLink = useCallback(async (skillId: string, version: string, author: string, genome: Record<string, unknown>, manifest: Record<string, unknown>) => {
    setSending(true);
    try {
      const pkg = await bundleSkillPackage(skillId, version, author, genome, manifest);
      return generateTransferLink(pkg);
    } finally {
      setSending(false);
    }
  }, []);

  const verifyAndInstall = useCallback(async (link: string) => {
    setReceiving(true);
    try {
      const pkg = parseTransferLink(link);
      if (!pkg) throw new Error('Invalid link');
      const secret = getUserSigningSecret();
      const valid = await verifySignature({ id: pkg.id, version: pkg.version, author: pkg.author }, pkg.signature, secret);
      if (!valid) throw new Error('Signature verification failed');
      return pkg;
    } finally {
      setReceiving(false);
    }
  }, []);

  return { sendLink, verifyAndInstall, sending, receiving };
}
