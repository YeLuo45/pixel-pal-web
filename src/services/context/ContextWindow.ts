export interface ContextItem {
  id: string;
  content: string;
  importance: number;  // 0-1
  timestamp: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface WindowConfig {
  maxItems: number;
  maxTokens: number;
  importanceThreshold: number;
  autoPrune: boolean;
}

let idCounter = 0;
function generateId(): string {
  idCounter++;
  return `ctx_${Date.now()}_${idCounter}_${Math.random().toString(36).substring(2, 11)}`;
}

function estimateTokens(content: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(content.length / 4);
}

export class ContextWindow {
  private items: ContextItem[] = [];
  private config: WindowConfig;
  
  constructor(config?: Partial<WindowConfig>) {
    this.config = {
      maxItems: config?.maxItems ?? 100,
      maxTokens: config?.maxTokens ?? 4000,
      importanceThreshold: config?.importanceThreshold ?? 0.3,
      autoPrune: config?.autoPrune ?? true,
    };
  }
  
  add(item: Omit<ContextItem, 'id' | 'timestamp'>): ContextItem {
    const newItem: ContextItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    };
    
    this.items.push(newItem);
    
    if (this.config.autoPrune && this.items.length > this.config.maxItems) {
      this.pruneToMaxItems();
    }
    
    return newItem;
  }
  
  remove(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.items.splice(index, 1);
    return true;
  }
  
  clear(): void {
    this.items = [];
  }
  
  getItems(): ContextItem[] {
    return [...this.items];
  }
  
  getByCategory(category: string): ContextItem[] {
    return this.items.filter(item => item.category === category);
  }
  
getRecent(limit: number): ContextItem[] {
    if (limit <= 0) return [];
    
    // Sort by timestamp descending, then by id descending to handle equal timestamps (later ids first)
    const sorted = [...this.items].sort((a, b) => {
      if (b.timestamp !== a.timestamp) {
        return b.timestamp - a.timestamp;
      }
      // Higher id means later addition, so we want descending order (b before a)
      return b.id.localeCompare(a.id);
    });
    return sorted.slice(0, limit);
  }
  
  search(query: string): ContextItem[] {
    if (!query) return this.getItems();
    
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item => 
      item.content.toLowerCase().includes(lowerQuery)
    );
  }
  
  prune(): number {
    const belowThreshold = this.items.filter(
      item => item.importance < this.config.importanceThreshold
    );
    
    const initialLength = this.items.length;
    
    this.items = this.items.filter(
      item => item.importance >= this.config.importanceThreshold
    );
    
    return initialLength - this.items.length;
  }
  
  private pruneToMaxItems(): void {
    if (this.items.length <= this.config.maxItems) return;
    
    // Sort by importance (ascending) and timestamp (ascending) to get lowest priority items first
    const sorted = [...this.items].sort((a, b) => {
      if (a.importance !== b.importance) {
        return a.importance - b.importance;
      }
      return a.timestamp - b.timestamp;
    });
    
    const removeCount = this.items.length - this.config.maxItems;
    const toRemove = new Set(sorted.slice(0, removeCount).map(item => item.id));
    
    this.items = this.items.filter(item => !toRemove.has(item.id));
  }
  
  resize(maxItems: number): void {
    this.config.maxItems = maxItems;
    
    if (this.items.length > maxItems) {
      this.pruneToMaxItems();
    }
  }
  
  getStats(): { count: number; estimatedTokens: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    let estimatedTokens = 0;
    
    for (const item of this.items) {
      estimatedTokens += estimateTokens(item.content);
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }
    
    return {
      count: this.items.length,
      estimatedTokens,
      byCategory,
    };
  }
}