import { ContextWindow, WindowConfig } from './ContextWindow';
import { TokenBudget } from './TokenBudget';

export interface ContextItem {
  id: string;
  content: string;
  importance: number;
  timestamp: number;
  category: string;
  metadata?: Record<string, any>;
}

export class ContextManager {
  private window: ContextWindow;
  private budget: TokenBudget;
  
  constructor(windowConfig?: Partial<WindowConfig>, tokenBudget?: number) {
    this.window = new ContextWindow(windowConfig);
    this.budget = new TokenBudget(tokenBudget ?? 4000);
  }
  
  addContext(content: string, category: string, importance: number = 0.5): ContextItem {
    return this.window.add({ content, category, importance });
  }
  
  removeContext(id: string): boolean {
    return this.window.remove(id);
  }
  
  getActiveContext(): ContextItem[] {
    return this.window.getItems();
  }
  
  getContextByCategory(category: string): ContextItem[] {
    return this.window.getByCategory(category);
  }
  
  getSummarizableContext(): ContextItem[] {
    return this.window.getItems().filter(
      item => item.importance >= this.window['config'].importanceThreshold
    );
  }
  
  optimize(): void {
    this.window.prune();
  }
  
  summarize(): string {
    const items = this.getActiveContext();
    if (items.length === 0) return '';
    
    return items
      .map(item => `[${item.category}] ${item.content}`)
      .join('\n');
  }
  
  getStats(): {
    count: number;
    categories: Record<string, number>;
    totalBudget: number;
    usedBudget: number;
    availableBudget: number;
    estimatedTokens: number;
    highImportanceCount: number;
    mediumImportanceCount: number;
    lowImportanceCount: number;
  } {
    const stats = this.window.getStats();
    const items = this.getActiveContext();
    
    const highImportanceCount = items.filter(i => i.importance >= 0.7).length;
    const mediumImportanceCount = items.filter(i => i.importance >= 0.4 && i.importance < 0.7).length;
    const lowImportanceCount = items.filter(i => i.importance < 0.4).length;
    
    return {
      count: stats.count,
      categories: stats.byCategory,
      totalBudget: this.budget.getTotalBudget(),
      usedBudget: this.budget.getTotalUsed(),
      availableBudget: this.budget.getAvailable(),
      estimatedTokens: stats.estimatedTokens,
      highImportanceCount,
      mediumImportanceCount,
      lowImportanceCount,
    };
  }
}