/**
 * Code Formatter
 * claude-code-design Code Formatter - Indent + Space + LineBreak + Preset
 */

export interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  maxLineLength: number;
  trimTrailingWhitespace: boolean;
  ensureFinalNewline: boolean;
}

export class CodeFormatter {
  private options: FormatOptions = {
    indentSize: 2,
    useTabs: false,
    maxLineLength: 80,
    trimTrailingWhitespace: true,
    ensureFinalNewline: true,
  };
  private presets: Map<string, FormatOptions> = new Map();

  format(code: string, options?: Partial<FormatOptions>): string {
    const opts = { ...this.options, ...options };
    let lines = code.split('\n');

    if (opts.trimTrailingWhitespace) {
      lines = lines.map(l => l.replace(/\s+$/, ''));
    }

    lines = lines.map((line, idx) => this.formatLine(line, idx, lines, opts));

    if (opts.ensureFinalNewline && lines.length > 0 && lines[lines.length - 1] !== '') {
      lines.push('');
    }

    return lines.join('\n');
  }

  private formatLine(line: string, _idx: number, _allLines: string[], opts: FormatOptions): string {
    // Apply max line length warning (just a marker, no actual wrap)
    if (line.length > opts.maxLineLength) {
      // For now, don't wrap, just keep
    }
    return line;
  }

  setOptions(options: FormatOptions): void {
    this.options = { ...options };
  }

  getOptions(): FormatOptions {
    return { ...this.options };
  }

  registerPreset(name: string, options: FormatOptions): void {
    this.presets.set(name, { ...options });
  }

  applyPreset(name: string): boolean {
    const preset = this.presets.get(name);
    if (!preset) return false;
    this.options = { ...preset };
    return true;
  }

  getPreset(name: string): FormatOptions | undefined {
    return this.presets.get(name) ? { ...this.presets.get(name)! } : undefined;
  }

  getAllPresets(): string[] {
    return [...this.presets.keys()];
  }

  removePreset(name: string): boolean {
    return this.presets.delete(name);
  }

  hasPreset(name: string): boolean {
    return this.presets.has(name);
  }

  getPresetCount(): number {
    return this.presets.size;
  }

  resetOptions(): void {
    this.options = {
      indentSize: 2,
      useTabs: false,
      maxLineLength: 80,
      trimTrailingWhitespace: true,
      ensureFinalNewline: true,
    };
  }

  getIndent(): string {
    return this.options.useTabs ? '\t' : ' '.repeat(this.options.indentSize);
  }

  getIndentSize(): number {
    return this.options.indentSize;
  }

  getMaxLineLength(): number {
    return this.options.maxLineLength;
  }

  usesTabs(): boolean {
    return this.options.useTabs;
  }

  isTrimTrailingWhitespace(): boolean {
    return this.options.trimTrailingWhitespace;
  }

  isEnsureFinalNewline(): boolean {
    return this.options.ensureFinalNewline;
  }

  setIndentSize(size: number): void {
    this.options.indentSize = Math.max(0, size);
  }

  setUseTabs(use: boolean): void {
    this.options.useTabs = use;
  }

  setMaxLineLength(length: number): void {
    this.options.maxLineLength = Math.max(1, length);
  }

  setTrimTrailingWhitespace(trim: boolean): void {
    this.options.trimTrailingWhitespace = trim;
  }

  setEnsureFinalNewline(ensure: boolean): void {
    this.options.ensureFinalNewline = ensure;
  }

  formatLineLength(line: string): number {
    return line.length;
  }

  exceedsMaxLength(line: string): boolean {
    return line.length > this.options.maxLineLength;
  }

  clearPresets(): void {
    this.presets.clear();
  }
}

export default CodeFormatter;