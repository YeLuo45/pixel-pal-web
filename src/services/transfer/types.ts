/**
 * V134: Skill transfer types
 */
export interface SkillTransferPackage {
  id: string;
  version: string;
  author: string;
  transferredAt: string;
  genome: Record<string, unknown>;
  manifest: Record<string, unknown>;
  signature: string;
}
