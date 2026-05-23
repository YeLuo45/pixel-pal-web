/**
 * V135: GraphStore — IndexedDB + localStorage persistence for skill collaboration graph
 */

export interface GraphEvent {
  id?: number;
  from: string;       // skillId or userId
  to: string;         // skillId
  edgeType: 'USES' | 'TRIGGERS' | 'SIMILAR';
  weight: number;      // 0.0 - 1.0
  timestamp: string;
}

const DB_NAME = 'pixelpal_graph';
const DB_VERSION = 1;
const STORE_NAME = 'graph_events';
const SNAPSHOT_KEY = 'pixelpal_graph_snapshot';

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

export async function addGraphEvent(event: Omit<GraphEvent, 'id'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(event);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getGraphEvents(limit = 1000): Promise<GraphEvent[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const all = req.result as GraphEvent[];
      resolve(all.slice(-limit));
    };
    req.onerror = () => reject(req.error);
  });
}

export function saveGraphSnapshot(nodes: string[], edges: [string, string, number][]): void {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ nodes, edges, savedAt: new Date().toISOString() }));
}

export function loadGraphSnapshot(): { nodes: string[]; edges: [string, string, number][] } | null {
  const stored = localStorage.getItem(SNAPSHOT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}