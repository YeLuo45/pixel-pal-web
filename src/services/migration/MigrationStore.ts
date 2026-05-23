/**
 * V141: MigrationStore — IndexedDB log of migration history
 */
export interface MigrationRecord {
  id?: number;
  type: 'export' | 'import';
  skillId: string;
  skillVersion: string;
  platform: 'web' | 'ios' | 'android' | 'desktop';
  timestamp: string;
  packSizeBytes: number;
  success: boolean;
  errorMessage?: string;
}

const DB_NAME = 'pixelpal_migration';
const DB_VERSION = 1;
const STORE_NAME = 'migration_records';

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

export async function logMigration(record: Omit<MigrationRecord, 'id'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).add(record);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getMigrationHistory(limit = 50): Promise<MigrationRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const all = req.result as MigrationRecord[];
      resolve(all.slice(-limit).reverse());
    };
    req.onerror = () => reject(req.error);
  });
}