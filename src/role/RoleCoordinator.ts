/**
 * Role Coordinator
 * chatdev-design Role Coordinator - Register + Assign + Release + Stats
 */

export interface Role {
  id: string;
  name: string;
  capabilities: string[];
  assigned: string | null;
  created: number;
  updated: number;
  active: boolean;
}

export interface RoleStats {
  roles: number;
  assigned: number;
  available: number;
  active: number;
  inactive: number;
}

export class RoleCoordinator {
  private roles: Map<string, Role> = new Map();
  private counter = 0;

  register(name: string, capabilities: string[]): string {
    const id = `role-${++this.counter}`;
    this.roles.set(id, {
      id,
      name,
      capabilities: [...capabilities],
      assigned: null,
      created: Date.now(),
      updated: Date.now(),
      active: true,
    });
    return id;
  }

  assign(roleId: string, member: string): boolean {
    const r = this.roles.get(roleId);
    if (!r) return false;
    if (r.assigned !== null) return false;
    r.assigned = member;
    r.updated = Date.now();
    return true;
  }

  release(roleId: string): boolean {
    const r = this.roles.get(roleId);
    if (!r) return false;
    if (r.assigned === null) return false;
    r.assigned = null;
    r.updated = Date.now();
    return true;
  }

  getStats(): RoleStats {
    const all = Array.from(this.roles.values());
    return {
      roles: all.length,
      assigned: all.filter(r => r.assigned !== null).length,
      available: all.filter(r => r.assigned === null).length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
    };
  }

  getRole(id: string): Role | undefined {
    return this.roles.get(id);
  }

  getAllRoles(): Role[] {
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

  getName(id: string): string | undefined {
    return this.roles.get(id)?.name;
  }

  getCapabilities(id: string): string[] {
    return [...(this.roles.get(id)?.capabilities ?? [])];
  }

  getAssigned(id: string): string | null {
    return this.roles.get(id)?.assigned ?? null;
  }

  isAssigned(id: string): boolean {
    return this.roles.get(id)?.assigned !== null;
  }

  isAvailable(id: string): boolean {
    return this.roles.get(id)?.assigned === null;
  }

  hasCapability(id: string, capability: string): boolean {
    return this.roles.get(id)?.capabilities.includes(capability) ?? false;
  }

  addCapability(id: string, capability: string): boolean {
    const r = this.roles.get(id);
    if (!r) return false;
    if (!r.capabilities.includes(capability)) r.capabilities.push(capability);
    return true;
  }

  removeCapability(id: string, capability: string): boolean {
    const r = this.roles.get(id);
    if (!r) return false;
    const idx = r.capabilities.indexOf(capability);
    if (idx === -1) return false;
    r.capabilities.splice(idx, 1);
    return true;
  }

  isActive(id: string): boolean {
    return this.roles.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.roles.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  getByName(name: string): Role[] {
    return Array.from(this.roles.values()).filter(r => r.name === name);
  }

  getByMember(member: string): Role[] {
    return Array.from(this.roles.values()).filter(r => r.assigned === member);
  }

  getByCapability(capability: string): Role[] {
    return Array.from(this.roles.values()).filter(r => r.capabilities.includes(capability));
  }

  getAssignedRoles(): Role[] {
    return Array.from(this.roles.values()).filter(r => r.assigned !== null);
  }

  getAvailableRoles(): Role[] {
    return Array.from(this.roles.values()).filter(r => r.assigned === null);
  }

  getActiveRoles(): Role[] {
    return Array.from(this.roles.values()).filter(r => r.active);
  }

  getInactiveRoles(): Role[] {
    return Array.from(this.roles.values()).filter(r => !r.active);
  }

  getCreatedAt(id: string): number {
    return this.roles.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.roles.get(id)?.updated ?? 0;
  }

  getAllMembers(): string[] {
    return [...new Set(Array.from(this.roles.values()).filter(r => r.assigned !== null).map(r => r.assigned as string))];
  }

  getMemberCount(): number {
    return this.getAllMembers().length;
  }

  getRolesForMember(member: string): number {
    return this.getByMember(member).length;
  }

  getCapabilityCount(id: string): number {
    return this.roles.get(id)?.capabilities.length ?? 0;
  }

  clearAll(): void {
    this.roles.clear();
    this.counter = 0;
  }
}

export default RoleCoordinator;