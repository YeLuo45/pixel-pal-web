/**
 * V137: useVerification hook
 */
import { useState, useCallback } from 'react';
import { verifySkill, type SkillGenome } from '../services/verification/VerificationEngine';
import { saveVerificationReport, getLatestReport } from '../services/verification/CertificationStore';
import type { VerificationReport } from '../services/verification/types';

export function useVerification() {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [running, setRunning] = useState(false);

  const runVerification = useCallback(async (skillId: string, version: string, genome: SkillGenome) => {
    setRunning(true);
    try {
      const regReport = verifySkill(skillId, version, genome);
      await saveVerificationReport(regReport);
      setReport(regReport);
      return regReport;
    } finally {
      setRunning(false);
    }
  }, []);

  const loadLatest = useCallback(async (skillId: string) => {
    const r = await getLatestReport(skillId);
    if (r) setReport(r);
    return r;
  }, []);

  return { report, running, runVerification, loadLatest };
}