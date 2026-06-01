import { describe, it, expect, beforeEach } from 'vitest';
import { TokenBudget, TokenAllocation } from '../TokenBudget';

describe('TokenBudget', () => {
  let budget: TokenBudget;

  describe('constructor', () => {
    it('should create with specified total budget', () => {
      budget = new TokenBudget(4000);
      expect(budget).toBeDefined();
    });

    it('should create with different budget sizes', () => {
      budget = new TokenBudget(1000);
      expect(budget).toBeDefined();
      
      budget = new TokenBudget(100000);
      expect(budget).toBeDefined();
    });

    it('should initialize with zero allocations', () => {
      budget = new TokenBudget(4000);
      
      expect(budget.getAllAllocations()).toEqual([]);
    });
  });

  describe('setAllocation', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should set allocation for a new category', () => {
      budget.setAllocation('work', 2000);
      
      const allocation = budget.getAllocation('work');
      expect(allocation).not.toBeNull();
      expect(allocation!.budget).toBe(2000);
      expect(allocation!.used).toBe(0);
    });

    it('should update existing allocation', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('work', 1500);
      
      const allocation = budget.getAllocation('work');
      expect(allocation!.budget).toBe(1500);
    });

    it('should handle multiple categories', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('personal', 1000);
      budget.setAllocation('urgent', 500);
      
      expect(budget.getAllocation('work')!.budget).toBe(2000);
      expect(budget.getAllocation('personal')!.budget).toBe(1000);
      expect(budget.getAllocation('urgent')!.budget).toBe(500);
    });

    it('should allow setting zero budget', () => {
      budget.setAllocation('empty', 0);
      
      const allocation = budget.getAllocation('empty');
      expect(allocation!.budget).toBe(0);
    });

    it('should allow setting very large budget', () => {
      budget.setAllocation('large', 1000000);
      
      const allocation = budget.getAllocation('large');
      expect(allocation!.budget).toBe(1000000);
    });
  });

  describe('getAllocation', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should return null for non-existent category', () => {
      const allocation = budget.getAllocation('non-existent');
      
      expect(allocation).toBeNull();
    });

    it('should return allocation after setting', () => {
      budget.setAllocation('work', 2000);
      
      const allocation = budget.getAllocation('work');
      
      expect(allocation).not.toBeNull();
      expect(allocation!.category).toBe('work');
    });

    it('should return allocation with correct used value after allocation', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 500);
      
      const allocation = budget.getAllocation('work');
      
      expect(allocation!.used).toBe(500);
    });
  });

  describe('getAllAllocations', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should return empty array when no allocations set', () => {
      const allocations = budget.getAllAllocations();
      
      expect(allocations).toEqual([]);
    });

    it('should return all allocations', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('personal', 1000);
      budget.setAllocation('urgent', 500);
      
      const allocations = budget.getAllAllocations();
      
      expect(allocations.length).toBe(3);
    });

    it('should include used amount in each allocation', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 500);
      
      const allocations = budget.getAllAllocations();
      
      expect(allocations[0].used).toBe(500);
    });

    it('should return allocations sorted by category', () => {
      budget.setAllocation('zzz', 100);
      budget.setAllocation('aaa', 200);
      budget.setAllocation('mmm', 300);
      
      const allocations = budget.getAllAllocations();
      
      expect(allocations[0].category).toBe('aaa');
      expect(allocations[1].category).toBe('mmm');
      expect(allocations[2].category).toBe('zzz');
    });
  });

  describe('allocate', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should successfully allocate within budget', () => {
      budget.setAllocation('work', 2000);
      
      const result = budget.allocate('work', 500);
      
      expect(result).toBe(true);
      expect(budget.getAllocation('work')!.used).toBe(500);
    });

    it('should return false when exceeding category budget', () => {
      budget.setAllocation('work', 2000);
      
      const result = budget.allocate('work', 2500);
      
      expect(result).toBe(false);
      expect(budget.getAllocation('work')!.used).toBe(0);
    });

    it('should return false for unallocated category', () => {
      const result = budget.allocate('unknown', 100);
      
      expect(result).toBe(false);
    });

    it('should handle exact budget allocation', () => {
      budget.setAllocation('work', 2000);
      
      const result = budget.allocate('work', 2000);
      
      expect(result).toBe(true);
      expect(budget.getAllocation('work')!.used).toBe(2000);
    });

    it('should allow multiple allocations up to budget', () => {
      budget.setAllocation('work', 2000);
      
      budget.allocate('work', 500);
      budget.allocate('work', 500);
      budget.allocate('work', 500);
      budget.allocate('work', 500);
      
      expect(budget.getAllocation('work')!.used).toBe(2000);
    });

    it('should reject allocation that would exceed budget', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 1500);
      
      const result = budget.allocate('work', 600);
      
      expect(result).toBe(false);
      expect(budget.getAllocation('work')!.used).toBe(1500);
    });

    it('should handle zero allocation', () => {
      budget.setAllocation('work', 2000);
      
      const result = budget.allocate('work', 0);
      
      expect(result).toBe(true);
    });
  });

  describe('free', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should reduce used amount', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 500);
      
      budget.free('work', 200);
      
      expect(budget.getAllocation('work')!.used).toBe(300);
    });

    it('should not go below zero', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 500);
      
      budget.free('work', 1000);
      
      expect(budget.getAllocation('work')!.used).toBe(0);
    });

    it('should handle freeing from unallocated category', () => {
      budget.free('unknown', 100);
      
      expect(budget.getAvailable()).toBeDefined();
    });

    it('should allow re-allocation after freeing', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 1500);
      budget.free('work', 500);
      
      const result = budget.allocate('work', 1000);
      
      expect(result).toBe(true);
      expect(budget.getAllocation('work')!.used).toBe(2000);
    });

    it('should handle freeing exact amount', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 500);
      
      budget.free('work', 500);
      
      expect(budget.getAllocation('work')!.used).toBe(0);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should reset specific category to zero used', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 1500);
      
      budget.reset('work');
      
      expect(budget.getAllocation('work')!.used).toBe(0);
      expect(budget.getAllocation('work')!.budget).toBe(2000);
    });

    it('should reset all categories when no argument provided', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('personal', 1000);
      budget.allocate('work', 1500);
      budget.allocate('personal', 500);
      
      budget.reset();
      
      expect(budget.getAllocation('work')!.used).toBe(0);
      expect(budget.getAllocation('personal')!.used).toBe(0);
    });

    it('should handle resetting non-existent category', () => {
      budget.reset('unknown');
      
      expect(budget.getTotalUsed()).toBe(0);
    });

    it('should preserve budget amounts after reset', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 1500);
      
      budget.reset('work');
      
      expect(budget.getAllocation('work')!.budget).toBe(2000);
    });
  });

  describe('getTotalBudget', () => {
    it('should return constructor value', () => {
      budget = new TokenBudget(4000);
      
      expect(budget.getTotalBudget()).toBe(4000);
    });

    it('should return different budget sizes', () => {
      budget = new TokenBudget(1000);
      expect(budget.getTotalBudget()).toBe(1000);
      
      budget = new TokenBudget(100000);
      expect(budget.getTotalBudget()).toBe(100000);
    });
  });

  describe('getTotalUsed', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should return zero when nothing allocated', () => {
      expect(budget.getTotalUsed()).toBe(0);
    });

    it('should return sum of all category usage', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('personal', 1000);
      budget.allocate('work', 500);
      budget.allocate('personal', 300);
      
      expect(budget.getTotalUsed()).toBe(800);
    });

    it('should update when allocations change', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 500);
      
      expect(budget.getTotalUsed()).toBe(500);
      
      budget.allocate('work', 300);
      
      expect(budget.getTotalUsed()).toBe(800);
    });
  });

  describe('getAvailable', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should return total budget when nothing allocated', () => {
      expect(budget.getAvailable()).toBe(4000);
    });

    it('should return remaining after allocations', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('personal', 1000);
      budget.allocate('work', 500);
      budget.allocate('personal', 300);
      
      expect(budget.getAvailable()).toBe(2200);
    });

    it('should account for unallocated categories', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('personal', 1000);
      budget.allocate('work', 2000);  // use all work
      
      // personal category has 1000 budget but 0 used
      // work category has 2000 budget, 2000 used
      // total available = 1000 (remaining personal)
      const available = budget.getAvailable();
      expect(available).toBe(1000); // Only from personal (2000+1000+1000=4000 total, 3000 allocated, 1000 available)
    });
  });

  describe('canAllocate', () => {
    beforeEach(() => {
      budget = new TokenBudget(4000);
    });

    it('should return true when enough budget available', () => {
      budget.setAllocation('work', 2000);
      
      expect(budget.canAllocate('work', 1000)).toBe(true);
    });

    it('should return false when not enough budget', () => {
      budget.setAllocation('work', 2000);
      
      expect(budget.canAllocate('work', 2500)).toBe(false);
    });

    it('should return false for unknown category', () => {
      expect(budget.canAllocate('unknown', 100)).toBe(false);
    });

    it('should return true for exact budget match', () => {
      budget.setAllocation('work', 2000);
      
      expect(budget.canAllocate('work', 2000)).toBe(true);
    });

    it('should return true for zero allocation', () => {
      budget.setAllocation('work', 2000);
      
      expect(budget.canAllocate('work', 0)).toBe(true);
    });

    it('should consider current usage', () => {
      budget.setAllocation('work', 2000);
      budget.allocate('work', 1500);
      
      expect(budget.canAllocate('work', 600)).toBe(false);
      expect(budget.canAllocate('work', 500)).toBe(true);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      budget = new TokenBudget(10000);
    });

    it('should handle very small budgets', () => {
      budget = new TokenBudget(10);
      budget.setAllocation('tiny', 5);
      
      expect(budget.canAllocate('tiny', 5)).toBe(true);
      expect(budget.canAllocate('tiny', 6)).toBe(false);
    });

    it('should handle very large budgets', () => {
      budget = new TokenBudget(1000000);
      budget.setAllocation('huge', 500000);
      
      expect(budget.canAllocate('huge', 500000)).toBe(true);
    });

    it('should handle many categories', () => {
      for (let i = 0; i < 50; i++) {
        budget.setAllocation(`category${i}`, 100);
      }
      
      const allocations = budget.getAllAllocations();
      expect(allocations.length).toBe(50);
    });

    it('should handle rapid allocate/free cycles', () => {
      budget.setAllocation('work', 2000);
      
      for (let i = 0; i < 100; i++) {
        budget.allocate('work', 10);
        budget.free('work', 10);
      }
      
      expect(budget.getAllocation('work')!.used).toBe(0);
    });

    it('should maintain data integrity after many operations', () => {
      budget.setAllocation('work', 2000);
      budget.setAllocation('personal', 1000);
      
      budget.allocate('work', 500);
      budget.allocate('personal', 300);
      budget.free('work', 200);
      budget.reset('work');
      budget.allocate('personal', 200);
      
      expect(budget.getTotalUsed()).toBe(500);
      expect(budget.getAllocation('work')!.used).toBe(0);
      expect(budget.getAllocation('personal')!.used).toBe(500);
    });
  });
});