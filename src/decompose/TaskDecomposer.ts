/**
 * Task Decomposer
 * chatdev-design Task Decomposer - Define + Split + Dependency + Schedule
 */

export interface SubTask {
  id: string;
  name: string;
  parent: string | null;
  dependencies: string[];
  order: number;
  completed: boolean;
  created: number;
}

export interface TaskTree {
  task: SubTask;
  children: SubTask[];
}

export class TaskDecomposer {
  private tasks: Map<string, SubTask> = new Map();
  private counter = 0;

  defineTask(name: string): string {
    const id = `task-${++this.counter}`;
    this.tasks.set(id, {
      id,
      name,
      parent: null,
      dependencies: [],
      order: 0,
      completed: false,
      created: Date.now(),
    });
    return id;
  }

  decompose(taskId: string, subtaskNames: string[]): string[] {
    const parent = this.tasks.get(taskId);
    if (!parent) return [];
    const ids: string[] = [];
    let order = 0;
    for (const name of subtaskNames) {
      const id = `sub-${++this.counter}`;
      this.tasks.set(id, {
        id,
        name,
        parent: taskId,
        dependencies: [],
        order: order++,
        completed: false,
        created: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  }

  addDependency(subtaskId: string, dependsOn: string): boolean {
    const subtask = this.tasks.get(subtaskId);
    if (!subtask) return false;
    if (!this.tasks.has(dependsOn)) return false;
    if (!subtask.dependencies.includes(dependsOn)) {
      subtask.dependencies.push(dependsOn);
    }
    return true;
  }

  getOrder(taskId: string): SubTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.parent === taskId)
      .sort((a, b) => a.order - b.order);
  }

  getSubtask(id: string): SubTask | undefined {
    return this.tasks.get(id);
  }

  getAllSubtasks(): SubTask[] {
    return Array.from(this.tasks.values());
  }

  removeSubtask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    if (task.parent) return false; // Can only remove root tasks
    // Remove all children
    for (const [tid, t] of this.tasks.entries()) {
      if (t.parent === id) this.tasks.delete(tid);
    }
    return this.tasks.delete(id);
  }

  hasSubtask(id: string): boolean {
    return this.tasks.has(id);
  }

  getCount(): number {
    return this.tasks.size;
  }

  markComplete(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.completed = true;
    return true;
  }

  markIncomplete(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.completed = false;
    return true;
  }

  isComplete(id: string): boolean {
    return this.tasks.get(id)?.completed ?? false;
  }

  getDependencies(id: string): string[] {
    return [...(this.tasks.get(id)?.dependencies ?? [])];
  }

  hasDependency(id: string, dependsOn: string): boolean {
    return this.tasks.get(id)?.dependencies.includes(dependsOn) ?? false;
  }

  getDependents(id: string): SubTask[] {
    return Array.from(this.tasks.values()).filter(t => t.dependencies.includes(id));
  }

  getChildren(parentId: string): SubTask[] {
    return Array.from(this.tasks.values()).filter(t => t.parent === parentId);
  }

  getRoots(): SubTask[] {
    return Array.from(this.tasks.values()).filter(t => t.parent === null);
  }

  getRootsCount(): number {
    return this.getRoots().length;
  }

  getCompletedCount(): number {
    return Array.from(this.tasks.values()).filter(t => t.completed).length;
  }

  getPendingCount(): number {
    return Array.from(this.tasks.values()).filter(t => !t.completed).length;
  }

  getCompletionRate(): number {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return 0;
    const completed = all.filter(t => t.completed).length;
    return Math.round((completed / all.length) * 100) / 100;
  }

  isReadyToExecute(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    if (task.completed) return false;
    return task.dependencies.every(dep => this.tasks.get(dep)?.completed ?? false);
  }

  getReadySubtasks(): SubTask[] {
    return Array.from(this.tasks.values()).filter(t => this.isReadyToExecute(t.id));
  }

  getByParent(parentId: string | null): SubTask[] {
    return Array.from(this.tasks.values()).filter(t => t.parent === parentId);
  }

  renameSubtask(id: string, name: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.name = name;
    return true;
  }

  getName(id: string): string | undefined {
    return this.tasks.get(id)?.name;
  }

  getCreatedAt(id: string): number {
    return this.tasks.get(id)?.created ?? 0;
  }

  clearAll(): void {
    this.tasks.clear();
    this.counter = 0;
  }
}

export default TaskDecomposer;