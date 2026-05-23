/**
 * V138: CompressionStore — IndexedDB log of compression events
 */
export interface CompressionLog {
  id?: number;
  triggeredBy: 'auto' | 'manual' | 'scheduled';
  timestamp: string;
  entriesProcessed: number;
  originalBytes: number;
  compressedBytes: number;
  reductionRatio: number;
  notes: string;
}

const DB_NAME = 'pixelpal_compression';
const DB_VERSION = 1;
const STORE_NAME = 'compression_logs';

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

export async function logCompression(log: Omit<CompressionLog, 'id'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).add(log);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getCompressionLogs(limit = 50): Promise<CompressionLog[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const all = req.result as CompressionLog[];
      resolve(all.slice(-limit).reverse());
    };
    req.onerror = () => reject(req.error);
  });
}