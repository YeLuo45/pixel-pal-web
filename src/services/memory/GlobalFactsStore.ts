/**
 * V131 L2 GlobalFactsStore — cross-session user preferences, IndexedDB
 * Persists via localStorage for simplicity and reliability.
 */

export interface GlobalFact {
  key: string;
  value: unknown;
  source: 'user' | 'persona' | 'system';
  updatedAt: number;
}

const DB_KEY = 'pixelpal_global_facts';

class GlobalFactsStoreImpl {
  async get(key: string): Promise<unknown> {
    const facts = this.loadFacts();
    return facts.find((f) => f.key === key)?.value ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    const facts = this.loadFacts();
    const idx = facts.findIndex((f) => f.key === key);
    const fact: GlobalFact = { key, value, source: 'user', updatedAt: Date.now() };
    if (idx >= 0) {
      facts[idx] = fact;
    } else {
      facts.push(fact);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(facts));
  }

  async getAll(): Promise<GlobalFact[]> {
    return this.loadFacts();
  }

  private loadFacts(): GlobalFact[] {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const globalFactsStore = new GlobalFactsStoreImpl();