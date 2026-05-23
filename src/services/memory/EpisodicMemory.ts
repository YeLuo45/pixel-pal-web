/**
 * V131 L4 EpisodicMemory — task logs with pattern matching
 * Persisted in IndexedDB via localStorage-compatible API.
 */

export interface EpisodicEntry {
  id: string;
  timestamp: number;
  taskType: string; // e.g. "git_workflow", "code_search"
  inputs: Record<string, unknown>;
  outcome: 'success' | 'partial' | 'failed';
  agents: string[];      // which agents participated
  skillIds: string[];   // which skills were used
  patternSignature: string; // hash of input pattern for L4→L3 crystallization
}

const DB_KEY = 'pixelpal_episodic';

class EpisodicMemoryImpl {
  /** Write a new episodic entry, returns the assigned id */
  async write(entry: Omit<EpisodicEntry, 'id'>): Promise<string> {
    const records = this.loadRecords();
    const id = crypto.randomUUID();
    const full: EpisodicEntry = { ...entry, id };
    records.push(full);
    // Keep last 500 entries
    if (records.length > 500) records.splice(0, records.length - 500);
    localStorage.setItem(DB_KEY, JSON.stringify(records));
    return id;
  }

  /** Query entries by taskType, most recent first */
  async query(taskType: string, limit = 20): Promise<EpisodicEntry[]> {
    const records = this.loadRecords();
    return records
      .filter((r) => r.taskType === taskType)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /** Find entries with the same pattern signature */
  async findSimilar(patternSignature: string, minCount = 3): Promise<EpisodicEntry[]> {
    const records = this.loadRecords();
    return records.filter((r) => r.patternSignature === patternSignature);
  }

  private loadRecords(): EpisodicEntry[] {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const episodicMemory = new EpisodicMemoryImpl();