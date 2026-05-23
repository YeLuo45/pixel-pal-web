/**
 * V136: ProvenanceStore — IndexedDB + localStorage for Skill provenance & lineage
 */
export interface SkillProvenance {
  id?: number;
  skillId: string;
  version: string;
  parentId: string | null;
  parentVersion: string | null;
  forkedFrom: string | null;
  createdBy: string;
  createdAt: string;
  evolutionNotes: string;
  genomeSnapshot: Record<string, unknown>;
  signature: string;
  forkCount: number;
  downloadCount: number;
}

const DB_NAME = 'pixelpal_provenance';
const DB_VERSION = 1;
const STORE_NAME = 'provenance';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProvenance(p: Omit<SkillProvenance, 'id'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).add(p);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getProvenanceBySkill(skillId: string): Promise<SkillProvenance[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const all = req.result as SkillProvenance[];
      resolve(all.filter(p => p.skillId === skillId));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllProvenances(): Promise<SkillProvenance[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as SkillProvenance[]);
    req.onerror = () => reject(req.error);
  });
}

export async function incrementForkCount(skillId: string, version: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const all = req.result as SkillProvenance[];
      const target = all.find(p => p.skillId === skillId && p.version === version);
      if (target) {
        const store = tx.objectStore(STORE_NAME);
        store.put({ ...target, forkCount: target.forkCount + 1 });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}