/**
 * V131 L1 InsightIndexer — fast routing index for L3 skills
 * Maps task keywords → skillId[] for quick lookup.
 */

export interface InsightEntry {
  skillId: string;
  keywords: string[];
  taskTypes: string[];
  lastUpdated: number;
}

const DB_KEY = 'pixelpal_insight_index';

class InsightIndexerImpl {
  /** Build an InsightEntry for a skill */
  buildIndex(skill: { id: string; name: string; trigger: string }): InsightEntry {
    const triggerLower = skill.trigger.toLowerCase();
    const nameLower = skill.name.toLowerCase();
    // Extract keywords from name and trigger (split on spaces/_/camelCase)
    const rawWords = `${skill.name} ${skill.trigger}`.split(/[\s_]+|(?=[A-Z])/);
    const keywords = rawWords
      .map((w) => w.toLowerCase().trim())
      .filter((w) => w.length > 2);

    return {
      skillId: skill.id,
      keywords,
      taskTypes: [skill.trigger],
      lastUpdated: Date.now(),
    };
  }

  /** Search for skillIds matching a taskType query */
  search(taskType: string): string[] {
    const index = this.loadIndex();
    const query = taskType.toLowerCase();
    return index
      .filter(
        (entry) =>
          entry.taskTypes.some((t) => t.toLowerCase().includes(query)) ||
          entry.keywords.some((k) => k.includes(query))
      )
      .map((e) => e.skillId);
  }

  /** Upsert an entry into the index */
  upsert(entry: InsightEntry): void {
    const index = this.loadIndex();
    const idx = index.findIndex((e) => e.skillId === entry.skillId);
    if (idx >= 0) {
      index[idx] = entry;
    } else {
      index.push(entry);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(index));
  }

  /** Get all indexed entries */
  getAll(): InsightEntry[] {
    return this.loadIndex();
  }

  private loadIndex(): InsightEntry[] {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const insightIndexer = new InsightIndexerImpl();