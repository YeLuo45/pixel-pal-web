export interface TokenAllocation {
  category: string;
  budget: number;
  used: number;
}

export class TokenBudget {
  private allocations: Map<string, TokenAllocation> = new Map();
  private totalBudget: number;
  
  constructor(totalBudget: number) {
    this.totalBudget = totalBudget;
  }
  
  setAllocation(category: string, budget: number): void {
    const existing = this.allocations.get(category);
    if (existing) {
      existing.budget = budget;
    } else {
      this.allocations.set(category, { category, budget, used: 0 });
    }
  }
  
  getAllocation(category: string): TokenAllocation | null {
    return this.allocations.get(category) || null;
  }
  
  getAllAllocations(): TokenAllocation[] {
    return Array.from(this.allocations.values()).sort((a, b) => 
      a.category.localeCompare(b.category)
    );
  }
  
  allocate(category: string, tokens: number): boolean {
    const allocation = this.allocations.get(category);
    if (!allocation) return false;
    
    if (allocation.used + tokens > allocation.budget) {
      return false;
    }
    
    allocation.used += tokens;
    return true;
  }
  
  free(category: string, tokens: number): void {
    const allocation = this.allocations.get(category);
    if (!allocation) return;
    
    allocation.used = Math.max(0, allocation.used - tokens);
  }
  
  reset(category?: string): void {
    if (category) {
      const allocation = this.allocations.get(category);
      if (allocation) {
        allocation.used = 0;
      }
    } else {
      for (const allocation of this.allocations.values()) {
        allocation.used = 0;
      }
    }
  }
  
  getTotalBudget(): number {
    return this.totalBudget;
  }
  
  getTotalUsed(): number {
    let total = 0;
    for (const allocation of this.allocations.values()) {
      total += allocation.used;
    }
    return total;
  }
  
  getAvailable(): number {
    // If no allocations set, return total budget
    if (this.allocations.size === 0) {
      return this.totalBudget;
    }
    // Available = sum of (budget - used) for each category
    let available = 0;
    for (const allocation of this.allocations.values()) {
      available += (allocation.budget - allocation.used);
    }
    return available;
  }
  
  canAllocate(category: string, tokens: number): boolean {
    const allocation = this.allocations.get(category);
    if (!allocation) return false;
    
    return allocation.used + tokens <= allocation.budget;
  }
}