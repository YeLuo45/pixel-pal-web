/**
 * V136: LineageEngine — DAG construction, ancestor chain, contribution scoring
 */
import type { SkillProvenance } from './ProvenanceStore';

export interface LineageNode {
  skillId: string;
  version: string;
  author: string;
  createdAt: string;
  parentId: string | null;
  forkCount: number;
  depth: number;
}

export function buildAncestorChain(provenances: SkillProvenance[]): LineageNode[] {
  const sorted = [...provenances].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const chain: LineageNode[] = [];
  const visited = new Set<string>();
  let current = sorted.find(p => !p.parentId && !p.forkedFrom);

  while (current) {
    const key = `${current.skillId}@${current.version}`;
    if (visited.has(key)) break;
    visited.add(key);
    chain.push({
      skillId: current.skillId,
      version: current.version,
      author: current.createdBy,
      createdAt: current.createdAt,
      parentId: current.parentId,
      forkCount: current.forkCount,
      depth: chain.length,
    });
    // follow child chain
    const next = sorted.find(p =>
      p.parentId === current!.skillId && p.parentVersion === current!.version
    );
    if (!next) break;
    current = next;
  }
  return chain;
}

export function computeContributionScore(provenances: SkillProvenance[], userId: string): number {
  const userProvs = provenances.filter(p => p.createdBy === userId);
  const originSkills = userProvs.filter(p => !p.parentId && !p.forkedFrom).length;
  const forks = userProvs.filter(p => p.parentId || p.forkedFrom).length;
  const versionsPublished = userProvs.length;
  const timesAdopted = provenances.filter(p =>
    p.parentId && provenances.some(par =>
      par.skillId === p.parentId && par.createdBy === userId
    )
  ).length;

  return originSkills * 10 + forks * 5 + versionsPublished * 2 + timesAdopted * 3;
}

export function buildFamilyTree(provenances: SkillProvenance[]): Map<string, LineageNode[]> {
  const tree = new Map<string, LineageNode[]>();
  for (const p of provenances) {
    const parentKey = p.parentId ? `${p.parentId}@${p.parentVersion}` : 'ROOT';
    if (!tree.has(parentKey)) tree.set(parentKey, []);
    tree.get(parentKey)!.push({
      skillId: p.skillId,
      version: p.version,
      author: p.createdBy,
      createdAt: p.createdAt,
      parentId: p.parentId,
      forkCount: p.forkCount,
      depth: 0,
    });
  }
  return tree;
}