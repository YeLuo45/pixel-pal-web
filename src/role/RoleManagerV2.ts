/**
 * Role Manager v2
 * chatdev-design Role Manager v2 - Lifecycle + Sync + Version + Analyze
 */

export type RoleStatus = 'active' | 'inactive' | 'deprecated';

export interface RoleSpec {
  id: string;
  name: string;
  capabilities: string[];
  version: number;
  status: RoleStatus;
  created: number;
  updated: number;
}

export interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  deprecated: number;
}

export class RoleManagerV2 {
  private roles: Map<string, RoleSpec> = new Map();
  private history: Map<string, RoleSpec[]> = new Map();
  private counter = 0;

  createRole(spec: Omit<RoleSpec, 'id' | 'version'>): string {
    const id = `role-${++this.counter}`;
    this.roles.set(id, {
      ...spec,
      id,
      version: 1,
      capabilities: [...spec.capabilities],
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  activate(id: string): boolean {
    const role = this.roles.get(id);
    if (!role) return false;
    this.saveHistory(role);
    role.status = 'active';
    role.version++;
    role.updated = Date.now();
    return true;
  }

  deprecate(id: string): boolean {
    const role = this.roles.get(id);
    if (!role) return false;
    this.saveHistory(role);
    role.status = 'deprecated';
    role.version++;
    role.updated = Date.now();
    return true;
  }

  deactivate(id: string): boolean {
    const role = this.roles.get(id);
    if (!role) return false;
    this.saveHistory(role);
    role.status = 'inactive';
    role.version++;
    role.updated = Date.now();
    return true;
  }

  sync(id: string, capabilities: string[]): boolean {
    const role = this.roles.get(id);
    if (!role) return false;
    this.saveHistory(role);
    role.capabilities = [...capabilities];
    role.version++;
    role.updated = Date.now();
    return true;
  }

  getStats(): RoleStats {
    const all = Array.from(this.roles.values());
    return {
      total: all.length,
      active: all.filter(r => r.status === 'active').length,
      inactive: all.filter(r => r.status === 'inactive').length,
      deprecated: all.filter(r => r.status === 'deprecated').length,
    };
  }

  getRole(id: string): RoleSpec | undefined {
    return this.roles.get(id);
  }

  getAllRoles(): RoleSpec[] {
    return Array.from(this.roles.values());
  }

  removeRole(id: string): boolean {
    return this.roles.delete(id);
  }

  hasRole(id: string): boolean {
    return this.roles.has(id);
  }

  getCount(): number {
    return this.roles.size;
  }

  getActive(): RoleSpec[] {
    return Array.from(this.roles.values()).filter(r => r.status === 'active');
  }

  getInactive(): RoleSpec[] {
    return Array.from(this.roles.values()).filter(r => r.status === 'inactive');
  }

  getDeprecated(): RoleSpec[] {
    return Array.from(this.roles.values()).filter(r => r.status === 'deprecated');
  }

  getByName(name: string): RoleSpec | undefined {
    return Array.from(this.roles.values()).find(r => r.name === name);
  }

  getCapabilities(id: string): string[] {
    return [...(this.roles.get(id)?.capabilities ?? [])];
  }

  addCapability(id: string, capability: string): boolean {
    const role = this.roles.get(id);
    if (!role) return false;
    if (!role.capabilities.includes(capability)) {
      this.saveHistory(role);
      role.capabilities.push(capability);
      role.version++;
      role.updated = Date.now();
    }
    return true;
  }

  removeCapability(id: string, capability: string): boolean {
    const role = this.roles.get(id);
    if (!role) return false;
    const idx = role.capabilities.indexOf(capability);
    if (idx === -1) return false;
    this.saveHistory(role);
    role.capabilities.splice(idx, 1);
    role.version++;
    role.updated = Date.now();
    return true;
  }

  getHistory(id: string): RoleSpec[] {
    return [...(this.history.get(id) ?? [])];
  }

  getVersion(id: string): number {
    return this.roles.get(id)?.version ?? 0;
  }

  rollback(id: string, version: number): boolean {
    const history = this.history.get(id) ?? [];
    const target = history.find(r => r.version === version);
    if (!target) return false;
    const current = this.roles.get(id);
    if (!current) return false;
    this.saveHistory(current);
    current.capabilities = [...target.capabilities];
    current.status = target.status;
    current.version++;
    current.updated = Date.now();
    return true;
  }

  getByStatus(status: RoleStatus): RoleSpec[] {
    return Array.from(this.roles.values()).filter(r => r.status === status);
  }

  getHistoryCount(id: string): number {
    return this.history.get(id)?.length ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.roles.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.roles.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.roles.clear();
    this.history.clear();
    this.counter = 0;
  }

  private saveHistory(role: RoleSpec): void {
    if (!this.history.has(role.id)) this.history.set(role.id, []);
    this.history.get(role.id)!.push({ ...role, capabilities: [...role.capabilities] });
  }
}

export default RoleManagerV2;