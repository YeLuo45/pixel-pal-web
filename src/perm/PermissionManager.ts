/**
 * Permission Manager
 * chatdev-design Permission Manager - Role + Check + Inheritance + Audit
 */

export interface Permission {
  resource: string;
  action: string;
}

export interface Role {
  name: string;
  permissions: Permission[];
  parent?: string;
}

export interface AuditEntry {
  role: string;
  permission: Permission;
  granted: boolean;
  timestamp: number;
}

export class PermissionManager {
  private roles: Map<string, Role> = new Map();
  private auditLog: AuditEntry[] = [];

  addRole(role: Role): void {
    this.roles.set(role.name, {
      ...role,
      permissions: role.permissions.map(p => ({ ...p })),
    });
  }

  grant(role: string, permission: Permission): boolean {
    const r = this.roles.get(role);
    if (!r) {
      this.audit(role, permission, false);
      return false;
    }
    if (!this.hasPermission(r.permissions, permission)) {
      r.permissions.push({ ...permission });
    }
    this.audit(role, permission, true);
    return true;
  }

  revoke(role: string, permission: Permission): boolean {
    const r = this.roles.get(role);
    if (!r) return false;
    const idx = r.permissions.findIndex(p => p.resource === permission.resource && p.action === permission.action);
    if (idx === -1) return false;
    r.permissions.splice(idx, 1);
    return true;
  }

  check(role: string, permission: Permission): boolean {
    // Direct check
    const r = this.roles.get(role);
    if (!r) return false;
    if (this.hasPermission(r.permissions, permission)) return true;

    // Check parent (inheritance)
    if (r.parent) return this.check(r.parent, permission);
    return false;
  }

  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  getRole(name: string): Role | undefined {
    return this.roles.get(name);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values()).map(r => ({ ...r, permissions: r.permissions.map(p => ({ ...p })) }));
  }

  removeRole(name: string): boolean {
    return this.roles.delete(name);
  }

  hasRole(name: string): boolean {
    return this.roles.has(name);
  }

  getRoleCount(): number {
    return this.roles.size;
  }

  getPermissionsOfRole(name: string): Permission[] {
    return [...(this.roles.get(name)?.permissions ?? [])];
  }

  getAllPermissions(): Permission[] {
    const perms = new Set<string>();
    const result: Permission[] = [];
    for (const role of this.roles.values()) {
      for (const p of role.permissions) {
        const key = `${p.resource}:${p.action}`;
        if (!perms.has(key)) {
          perms.add(key);
          result.push({ ...p });
        }
      }
    }
    return result;
  }

  getRolesWithPermission(permission: Permission): string[] {
    return Array.from(this.roles.entries())
      .filter(([_, role]) => this.hasPermission(role.permissions, permission))
      .map(([name]) => name);
  }

  getAuditCount(): number {
    return this.auditLog.length;
  }

  getGrantedAuditCount(): number {
    return this.auditLog.filter(a => a.granted).length;
  }

  getDeniedAuditCount(): number {
    return this.auditLog.filter(a => !a.granted).length;
  }

  getAuditByRole(role: string): AuditEntry[] {
    return this.auditLog.filter(a => a.role === role);
  }

  setParent(role: string, parent: string): boolean {
    const r = this.roles.get(role);
    if (!r) return false;
    r.parent = parent;
    return true;
  }

  getParent(role: string): string | undefined {
    return this.roles.get(role)?.parent;
  }

  getChildRoles(role: string): string[] {
    return Array.from(this.roles.entries())
      .filter(([_, r]) => r.parent === role)
      .map(([name]) => name);
  }

  getEffectivePermissions(role: string): Permission[] {
    const r = this.roles.get(role);
    if (!r) return [];
    const result: Permission[] = [];
    const seen = new Set<string>();
    let current: Role | undefined = r;
    while (current) {
      for (const p of current.permissions) {
        const key = `${p.resource}:${p.action}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ ...p });
        }
      }
      current = current.parent ? this.roles.get(current.parent) : undefined;
    }
    return result;
  }

  clearAuditLog(): void {
    this.auditLog = [];
  }

  clearAll(): void {
    this.roles.clear();
    this.auditLog = [];
  }

  private hasPermission(permissions: Permission[], permission: Permission): boolean {
    return permissions.some(p => p.resource === permission.resource && p.action === permission.action);
  }

  private audit(role: string, permission: Permission, granted: boolean): void {
    this.auditLog.push({
      role,
      permission: { ...permission },
      granted,
      timestamp: Date.now(),
    });
  }
}

export default PermissionManager;