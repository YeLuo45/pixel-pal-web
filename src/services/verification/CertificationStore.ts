/**
 * V137: CertificationStore — IndexedDB persistence for SkillVerificationReport
 */
import type { VerificationReport } from './types';

const DB_NAME = 'pixelpal_certification';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: ['skillId', 'version'] });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVerificationReport(report: VerificationReport): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(report);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getVerificationReport(skillId: string, version: string): Promise<VerificationReport | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get([skillId, version]);
    req.onsuccess = () => resolve((req.result as VerificationReport) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getLatestReport(skillId: string): Promise<VerificationReport | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const all = (req.result as VerificationReport[]).filter(r => r.skillId === skillId);
      if (!all.length) { resolve(null); return; }
      const latest = all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      resolve(latest);
    };
    req.onerror = () => reject(req.error);
  });
}