/**
 * Protocol Adapter
 * nanobot-design Protocol Adapter - Register + Adapt + Stats
 */

export interface Protocol {
  id: string;
  name: string;
  transform: (data: unknown) => unknown;
  created: number;
  usageCount: number;
  enabled: boolean;
}

export interface AdapterStats {
  protocols: number;
  transforms: number;
  errors: number;
  routes: number;
}

export class ProtocolAdapter {
  private protocols: Map<string, Protocol> = new Map();
  private transforms = 0;
  private errors = 0;
  private routes = 0;

  register(protocol: Omit<Protocol, 'created' | 'usageCount' | 'enabled'> & { enabled?: boolean }): boolean {
    if (this.protocols.has(protocol.id)) return false;
    this.protocols.set(protocol.id, {
      ...protocol,
      created: Date.now(),
      usageCount: 0,
      enabled: protocol.enabled ?? true,
    });
    return true;
  }

  adapt(fromId: string, toId: string, data: unknown): unknown {
    this.routes++;
    const from = this.protocols.get(fromId);
    const to = this.protocols.get(toId);
    if (!from || !to || !from.enabled || !to.enabled) {
      this.errors++;
      return undefined;
    }
    try {
      const intermediate = from.transform(data);
      const result = to.transform(intermediate);
      this.transforms++;
      from.usageCount++;
      to.usageCount++;
      return result;
    } catch {
      this.errors++;
      return undefined;
    }
  }

  transform(protocolId: string, data: unknown): unknown {
    const p = this.protocols.get(protocolId);
    if (!p || !p.enabled) return undefined;
    this.transforms++;
    p.usageCount++;
    return p.transform(data);
  }

  getStats(): AdapterStats {
    return {
      protocols: this.protocols.size,
      transforms: this.transforms,
      errors: this.errors,
      routes: this.routes,
    };
  }

  getProtocol(id: string): Protocol | undefined {
    return this.protocols.get(id);
  }

  getAllProtocols(): Protocol[] {
    return Array.from(this.protocols.values());
  }

  removeProtocol(id: string): boolean {
    return this.protocols.delete(id);
  }

  hasProtocol(id: string): boolean {
    return this.protocols.has(id);
  }

  getCount(): number {
    return this.protocols.size;
  }

  getName(id: string): string | undefined {
    return this.protocols.get(id)?.name;
  }

  isEnabled(id: string): boolean {
    return this.protocols.get(id)?.enabled ?? false;
  }

  setEnabled(id: string, enabled: boolean): boolean {
    const p = this.protocols.get(id);
    if (!p) return false;
    p.enabled = enabled;
    return true;
  }

  getUsageCount(id: string): number {
    return this.protocols.get(id)?.usageCount ?? 0;
  }

  getTransformCount(): number {
    return this.transforms;
  }

  getErrorCount(): number {
    return this.errors;
  }

  getRouteCount(): number {
    return this.routes;
  }

  getCreatedAt(id: string): number {
    return this.protocols.get(id)?.created ?? 0;
  }

  getMostUsed(): Protocol | null {
    const all = Array.from(this.protocols.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.usageCount > max.usageCount ? p : max);
  }

  getEnabledProtocols(): Protocol[] {
    return Array.from(this.protocols.values()).filter(p => p.enabled);
  }

  getDisabledProtocols(): Protocol[] {
    return Array.from(this.protocols.values()).filter(p => !p.enabled);
  }

  resetStats(): void {
    this.transforms = 0;
    this.errors = 0;
    this.routes = 0;
  }

  clearAll(): void {
    this.protocols.clear();
    this.transforms = 0;
    this.errors = 0;
    this.routes = 0;
  }
}

export default ProtocolAdapter;