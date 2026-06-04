/**
 * Task Allocation v2
 * chatdev-design Task Allocation v2 - Queue + Strategy + Workload + Score
 */

export interface Worker {
  id: string;
  capacity: number;
  currentLoad: number;
  skills: string[];
}

export interface Task {
  id: string;
  requiredSkills: string[];
  priority: number;
}

export interface Allocation {
  taskId: string;
  workerId: string;
  priority: number;
}

export class TaskAllocationV2 {
  private workers: Map<string, Worker> = new Map();
  private tasks: Map<string, Task> = new Map();
  private allocations: Allocation[] = [];

  addWorker(worker: Worker): void {
    this.workers.set(worker.id, { ...worker, skills: [...worker.skills] });
  }

  addTask(taskId: string, requiredSkills: string[]): void {
    this.tasks.set(taskId, {
      id: taskId,
      requiredSkills: [...requiredSkills],
      priority: 1,
    });
  }

  allocate(): Allocation[] {
    this.allocations = [];

    // Sort tasks by priority
    const sortedTasks = Array.from(this.tasks.values()).sort((a, b) => b.priority - a.priority);

    for (const task of sortedTasks) {
      const bestWorker = this.findBestWorker(task);
      if (bestWorker) {
        const allocation: Allocation = {
          taskId: task.id,
          workerId: bestWorker.id,
          priority: task.priority,
        };
        this.allocations.push(allocation);
        bestWorker.currentLoad++;
      }
    }
    return [...this.allocations];
  }

  private findBestWorker(task: Task): Worker | null {
    let best: Worker | null = null;
    let bestScore = -1;

    for (const worker of this.workers.values()) {
      if (worker.currentLoad >= worker.capacity) continue;

      // Score based on skill match and available capacity
      const skillMatch = task.requiredSkills.filter(s => worker.skills.includes(s)).length;
      const available = (worker.capacity - worker.currentLoad) / worker.capacity;
      const score = skillMatch * 10 + available * 5;

      if (score > bestScore) {
        bestScore = score;
        best = worker;
      }
    }

    return best;
  }

  rebalance(): number {
    let moves = 0;
    const workers = Array.from(this.workers.values());
    if (workers.length === 0) return 0;

    // Find overloaded and underloaded workers
    const avgLoad = workers.reduce((sum, w) => sum + w.currentLoad, 0) / workers.length;
    const overloaded = workers.filter(w => w.currentLoad > avgLoad + 1);
    const underloaded = workers.filter(w => w.currentLoad < avgLoad - 1);

    for (const over of overloaded) {
      for (const under of underloaded) {
        if (over.currentLoad > avgLoad) {
          // Move allocations
          const toMove = this.allocations.find(a => a.workerId === over.id);
          if (toMove) {
            toMove.workerId = under.id;
            over.currentLoad--;
            under.currentLoad++;
            moves++;
          }
        }
      }
    }
    return moves;
  }

  getWorkerLoad(id: string): number {
    return this.workers.get(id)?.currentLoad ?? 0;
  }

  getAllocationScore(): number {
    if (this.allocations.length === 0) return 0;
    let totalScore = 0;
    for (const alloc of this.allocations) {
      const worker = this.workers.get(alloc.workerId);
      if (worker) {
        const task = this.tasks.get(alloc.taskId);
        if (task) {
          const skillMatch = task.requiredSkills.filter(s => worker.skills.includes(s)).length;
          totalScore += skillMatch * 10 + alloc.priority * 5;
        }
      }
    }
    return Math.round(totalScore / this.allocations.length);
  }

  getWorker(id: string): Worker | undefined {
    return this.workers.get(id);
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllWorkers(): Worker[] {
    return Array.from(this.workers.values());
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getAllocations(): Allocation[] {
    return [...this.allocations];
  }

  setTaskPriority(taskId: string, priority: number): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.priority = priority;
    return true;
  }

  getTaskPriority(taskId: string): number {
    return this.tasks.get(taskId)?.priority ?? 0;
  }

  addWorkerSkill(workerId: string, skill: string): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) return false;
    if (!worker.skills.includes(skill)) {
      worker.skills.push(skill);
    }
    return true;
  }

  removeWorkerSkill(workerId: string, skill: string): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) return false;
    const idx = worker.skills.indexOf(skill);
    if (idx === -1) return false;
    worker.skills.splice(idx, 1);
    return true;
  }

  getWorkerSkills(workerId: string): string[] {
    return [...(this.workers.get(workerId)?.skills ?? [])];
  }

  removeWorker(id: string): boolean {
    return this.workers.delete(id);
  }

  removeTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getWorkerCount(): number {
    return this.workers.size;
  }

  getTaskCount(): number {
    return this.tasks.size;
  }

  hasWorker(id: string): boolean {
    return this.workers.has(id);
  }

  hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  getAvailableWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.currentLoad < w.capacity);
  }

  getAverageLoad(): number {
    if (this.workers.size === 0) return 0;
    const sum = Array.from(this.workers.values()).reduce((acc, w) => acc + w.currentLoad, 0);
    return Math.round(sum / this.workers.size * 100) / 100;
  }

  getCapacityUtilization(): number {
    if (this.workers.size === 0) return 0;
    const totalCap = Array.from(this.workers.values()).reduce((sum, w) => sum + w.capacity, 0);
    const totalLoad = Array.from(this.workers.values()).reduce((sum, w) => sum + w.currentLoad, 0);
    return totalCap > 0 ? Math.round(totalLoad / totalCap * 100) / 100 : 0;
  }

  clearAll(): void {
    this.workers.clear();
    this.tasks.clear();
    this.allocations = [];
  }
}

export default TaskAllocationV2;