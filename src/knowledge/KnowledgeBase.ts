/**
 * Knowledge Base
 * generic-agent-design Knowledge Base - Store + Retrieve + Update + Version
 */

export interface Knowledge {
  id: string;
  topic: string;
  content: string;
  version: number;
  updated: number;
  tags: string[];
}

export class KnowledgeBase {
  private knowledge: Map<string, Knowledge> = new Map();
  private history: Map<string, Knowledge[]> = new Map();
  private counter = 0;

  addKnowledge(knowledge: Omit<Knowledge, 'id'>): string {
    const id = `kb-${++this.counter}`;
    const k: Knowledge = {
      ...knowledge,
      id,
      tags: [...(knowledge.tags ?? [])],
    };
    this.knowledge.set(id, k);
    return id;
  }

  update(id: string, content: string): Knowledge | null {
    const k = this.knowledge.get(id);
    if (!k) return null;

    // Save to history
    if (!this.history.has(id)) this.history.set(id, []);
    this.history.get(id)!.push({ ...k });

    k.content = content;
    k.version++;
    k.updated = Date.now();

    return { ...k, tags: [...k.tags] };
  }

  search(query: string): Knowledge[] {
    const lower = query.toLowerCase();
    return Array.from(this.knowledge.values())
      .filter(k => k.content.toLowerCase().includes(lower) || k.topic.toLowerCase().includes(lower))
      .map(k => ({ ...k, tags: [...k.tags] }));
  }

  getByTag(tag: string): Knowledge[] {
    return Array.from(this.knowledge.values())
      .filter(k => k.tags.includes(tag))
      .map(k => ({ ...k, tags: [...k.tags] }));
  }

  getHistory(id: string): Knowledge[] {
    return [...(this.history.get(id) ?? [])];
  }

  getKnowledge(id: string): Knowledge | undefined {
    return this.knowledge.get(id);
  }

  getAllKnowledge(): Knowledge[] {
    return Array.from(this.knowledge.values());
  }

  removeKnowledge(id: string): boolean {
    return this.knowledge.delete(id);
  }

  hasKnowledge(id: string): boolean {
    return this.knowledge.has(id);
  }

  getKnowledgeCount(): number {
    return this.knowledge.size;
  }

  getByTopic(topic: string): Knowledge[] {
    return Array.from(this.knowledge.values())
      .filter(k => k.topic === topic)
      .map(k => ({ ...k, tags: [...k.tags] }));
  }

  getByVersion(id: string, version: number): Knowledge | undefined {
    const history = this.history.get(id) ?? [];
    return history.find(k => k.version === version);
  }

  getLatestVersion(id: string): Knowledge | undefined {
    return this.knowledge.get(id);
  }

  addTag(id: string, tag: string): boolean {
    const k = this.knowledge.get(id);
    if (!k) return false;
    if (!k.tags.includes(tag)) k.tags.push(tag);
    return true;
  }

  removeTag(id: string, tag: string): boolean {
    const k = this.knowledge.get(id);
    if (!k) return false;
    const idx = k.tags.indexOf(tag);
    if (idx === -1) return false;
    k.tags.splice(idx, 1);
    return true;
  }

  getTags(id: string): string[] {
    return [...(this.knowledge.get(id)?.tags ?? [])];
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    for (const k of this.knowledge.values()) {
      for (const tag of k.tags) tags.add(tag);
    }
    return [...tags];
  }

  getTopics(): string[] {
    return [...new Set(Array.from(this.knowledge.values()).map(k => k.topic))];
  }

  rollback(id: string, version: number): boolean {
    const k = this.knowledge.get(id);
    const target = this.getByVersion(id, version);
    if (!k || !target) return false;
    k.content = target.content;
    k.version++;
    k.updated = Date.now();
    return true;
  }

  getHistoryCount(id: string): number {
    return this.history.get(id)?.length ?? 0;
  }

  clearAll(): void {
    this.knowledge.clear();
    this.history.clear();
    this.counter = 0;
  }
}

export default KnowledgeBase;