/**
 * Formatter Engine
 * claude-code-design Formatter Engine - Format + Unformat + Stats
 */

export type FormatType = 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab';

export interface Formatter {
  id: string;
  name: string;
  type: FormatType;
  input: string;
  output: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface FteStats {
  formatters: number;
  totalFormatted: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  upper: number;
  lower: number;
  title: number;
  camel: number;
  snake: number;
  kebab: number;
  totalInputLength: number;
  totalOutputLength: number;
  avgInputLength: number;
  avgOutputLength: number;
  maxInputLength: number;
  maxOutputLength: number;
}

function formatString(s: string, type: FormatType): string {
  switch (type) {
    case 'upper': return s.toUpperCase();
    case 'lower': return s.toLowerCase();
    case 'title': return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    case 'camel': return s.split(/[\s_-]+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake': return s.split(/[\s-]+/).join('_').toLowerCase();
    case 'kebab': return s.split(/[\s_]+/).join('-').toLowerCase();
  }
}

export class FormatterEngine {
  private formatters: Map<string, Formatter> = new Map();
  private counter = 0;
  private totalFormatted = 0;

  format(name: string, type: FormatType, input: string): string {
    const id = `fte-${++this.counter}`;
    const output = formatString(input, type);
    this.formatters.set(id, {
      id,
      name,
      type,
      input,
      output,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalFormatted++;
    return output;
  }

  reFormat(id: string): string | null {
    const f = this.formatters.get(id);
    if (!f) return null;
    f.output = formatString(f.input, f.type);
    f.updated = Date.now();
    f.hits++;
    return f.output;
  }

  remove(id: string): boolean {
    return this.formatters.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const f = this.formatters.get(id);
    if (!f) return false;
    f.active = active;
    f.updated = Date.now();
    return true;
  }

  setInput(id: string, input: string): boolean {
    const f = this.formatters.get(id);
    if (!f) return false;
    f.input = input;
    f.output = formatString(input, f.type);
    f.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const f of this.formatters.values()) {
      f.active = true;
      f.hits = 0;
    }
    this.totalFormatted = 0;
  }

  getStats(): FteStats {
    const all = Array.from(this.formatters.values());
    const inputLengths = all.map(f => f.input.length);
    const outputLengths = all.map(f => f.output.length);
    return {
      formatters: all.length,
      totalFormatted: this.totalFormatted,
      active: all.filter(f => f.active).length,
      inactive: all.filter(f => !f.active).length,
      totalHits: all.reduce((s, f) => s + f.hits, 0),
      uniqueNames: new Set(all.map(f => f.name)).size,
      upper: all.filter(f => f.type === 'upper').length,
      lower: all.filter(f => f.type === 'lower').length,
      title: all.filter(f => f.type === 'title').length,
      camel: all.filter(f => f.type === 'camel').length,
      snake: all.filter(f => f.type === 'snake').length,
      kebab: all.filter(f => f.type === 'kebab').length,
      totalInputLength: all.reduce((s, f) => s + f.input.length, 0),
      totalOutputLength: all.reduce((s, f) => s + f.output.length, 0),
      avgInputLength: all.length > 0 ? Math.round((inputLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgOutputLength: all.length > 0 ? Math.round((outputLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxInputLength: inputLengths.length > 0 ? Math.max(...inputLengths) : 0,
      maxOutputLength: outputLengths.length > 0 ? Math.max(...outputLengths) : 0,
    };
  }

  getFormatter(id: string): Formatter | undefined {
    return this.formatters.get(id);
  }

  getAllFormatters(): Formatter[] {
    return Array.from(this.formatters.values());
  }

  hasFormatter(id: string): boolean {
    return this.formatters.has(id);
  }

  getCount(): number {
    return this.formatters.size;
  }

  getName(id: string): string | undefined {
    return this.formatters.get(id)?.name;
  }

  getType(id: string): FormatType | undefined {
    return this.formatters.get(id)?.type;
  }

  getInput(id: string): string | undefined {
    return this.formatters.get(id)?.input;
  }

  getOutput(id: string): string | undefined {
    return this.formatters.get(id)?.output;
  }

  getInputLength(id: string): number {
    return this.formatters.get(id)?.input.length ?? 0;
  }

  getOutputLength(id: string): number {
    return this.formatters.get(id)?.output.length ?? 0;
  }

  getHits(id: string): number {
    return this.formatters.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.formatters.get(id)?.active ?? false;
  }

  getByType(type: FormatType): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.type === type);
  }

  getActiveFormatters(): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.active);
  }

  getInactiveFormatters(): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => !f.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.formatters.values()).map(f => f.name))];
  }

  getNewest(): Formatter | null {
    const all = Array.from(this.formatters.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.created > max.created ? f : max);
  }

  getOldest(): Formatter | null {
    const all = Array.from(this.formatters.values());
    if (all.length === 0) return null;
    return all.reduce((min, f) => f.created < min.created ? f : min);
  }

  getCreatedAt(id: string): number {
    return this.formatters.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.formatters.get(id)?.updated ?? 0;
  }

  getTotalFormatted(): number {
    return this.totalFormatted;
  }

  clearAll(): void {
    this.formatters.clear();
    this.counter = 0;
    this.totalFormatted = 0;
  }
}

export default FormatterEngine;