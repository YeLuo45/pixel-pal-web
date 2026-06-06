/**
 * Formatter Engine
 * claude-code-design Formatter Engine - Define + Format + Stats
 */

export type Format = 'json' | 'xml' | 'yaml' | 'csv';

function doFormat(format: Format, input: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify({ value: input });
    case 'xml':
      return `<value>${input}</value>`;
    case 'yaml':
      return `value: ${input}`;
    case 'csv':
      return `value\n${input}`;
  }
}

export interface Formatter {
  id: string;
  name: string;
  format: Format;
  input: string;
  output: string;
  applications: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface FmeStats {
  formatters: number;
  totalApplications: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueFormats: number;
  json: number;
  xml: number;
  yaml: number;
  csv: number;
  avgApplications: number;
  maxApplications: number;
  minApplications: number;
  avgInputLength: number;
  avgOutputLength: number;
}

export class FormatterEngine {
  private formatters: Map<string, Formatter> = new Map();
  private counter = 0;
  private totalApplications = 0;

  define(name: string, format: Format = 'json'): string {
    const id = `fme-${++this.counter}`;
    this.formatters.set(id, {
      id,
      name,
      format,
      input: '',
      output: '',
      applications: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  format(id: string, input: string): string | null {
    const f = this.formatters.get(id);
    if (!f) return null;
    if (!f.active) return null;
    const output = doFormat(f.format, input);
    f.input = input;
    f.output = output;
    f.applications++;
    f.history.push(Date.now());
    f.updated = Date.now();
    f.hits++;
    this.totalApplications++;
    return output;
  }

  reset(id: string): boolean {
    const f = this.formatters.get(id);
    if (!f) return false;
    f.applications = 0;
    f.history = [];
    f.updated = Date.now();
    return true;
  }

  getStats(): FmeStats {
    const all = Array.from(this.formatters.values());
    const appValues = all.map(f => f.applications);
    return {
      formatters: all.length,
      totalApplications: this.totalApplications,
      active: all.filter(f => f.active).length,
      inactive: all.filter(f => !f.active).length,
      totalHits: all.reduce((s, f) => s + f.hits, 0),
      uniqueNames: new Set(all.map(f => f.name)).size,
      uniqueFormats: new Set(all.map(f => f.format)).size,
      json: all.filter(f => f.format === 'json').length,
      xml: all.filter(f => f.format === 'xml').length,
      yaml: all.filter(f => f.format === 'yaml').length,
      csv: all.filter(f => f.format === 'csv').length,
      avgApplications: all.length > 0 ? Math.round((appValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxApplications: appValues.length > 0 ? Math.max(...appValues) : 0,
      minApplications: appValues.length > 0 ? Math.min(...appValues) : 0,
      avgInputLength: all.length > 0 ? Math.round((all.reduce((s, f) => s + f.input.length, 0) / all.length) * 100) / 100 : 0,
      avgOutputLength: all.length > 0 ? Math.round((all.reduce((s, f) => s + f.output.length, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getFormatter(id: string): Formatter | undefined {
    return this.formatters.get(id);
  }

  getAllFormatters(): Formatter[] {
    return Array.from(this.formatters.values());
  }

  removeFormatter(id: string): boolean {
    return this.formatters.delete(id);
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

  getFormat(id: string): Format | undefined {
    return this.formatters.get(id)?.format;
  }

  getInput(id: string): string | undefined {
    return this.formatters.get(id)?.input;
  }

  getOutput(id: string): string | undefined {
    return this.formatters.get(id)?.output;
  }

  getApplications(id: string): number {
    return this.formatters.get(id)?.applications ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.formatters.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.formatters.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.formatters.get(id)?.active ?? false;
  }

  isJson(id: string): boolean {
    return this.formatters.get(id)?.format === 'json';
  }

  isXml(id: string): boolean {
    return this.formatters.get(id)?.format === 'xml';
  }

  isYaml(id: string): boolean {
    return this.formatters.get(id)?.format === 'yaml';
  }

  isCsv(id: string): boolean {
    return this.formatters.get(id)?.format === 'csv';
  }

  setActive(id: string, active: boolean): boolean {
    const f = this.formatters.get(id);
    if (!f) return false;
    f.active = active;
    f.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const f = this.formatters.get(id);
    if (!f) return false;
    f.name = name;
    f.updated = Date.now();
    return true;
  }

  setFormat(id: string, format: Format): boolean {
    const f = this.formatters.get(id);
    if (!f) return false;
    f.format = format;
    f.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const f of this.formatters.values()) {
      f.applications = 0;
      f.hits = 0;
      f.history = [];
      f.active = true;
    }
    this.totalApplications = 0;
  }

  getByName(name: string): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.name === name);
  }

  getByFormat(format: Format): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.format === format);
  }

  getJsonFormatters(): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.format === 'json');
  }

  getXmlFormatters(): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.format === 'xml');
  }

  getYamlFormatters(): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.format === 'yaml');
  }

  getCsvFormatters(): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.format === 'csv');
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

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinApplications(min: number): Formatter[] {
    return Array.from(this.formatters.values()).filter(f => f.applications >= min);
  }

  getMostApplications(): Formatter | null {
    const all = Array.from(this.formatters.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.applications > max.applications ? f : max);
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

  getTotalApplications(): number {
    return this.totalApplications;
  }

  clearAll(): void {
    this.formatters.clear();
    this.counter = 0;
    this.totalApplications = 0;
  }
}

export default FormatterEngine;