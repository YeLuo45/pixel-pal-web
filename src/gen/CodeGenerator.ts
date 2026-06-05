/**
 * Code Generator
 * claude-code-design Code Generator - AddTemplate + Generate + Stats
 */

export interface GenTemplate {
  id: string;
  language: string;
  template: string;
  description: string;
  created: number;
  usageCount: number;
}

export interface GeneratedCode {
  id: string;
  templateId: string;
  code: string;
  variables: Record<string, string>;
  timestamp: number;
}

export interface GenStats {
  templates: number;
  generated: number;
  languages: number;
}

export class CodeGenerator {
  private templates: Map<string, GenTemplate> = new Map();
  private generated: GeneratedCode[] = [];
  private cache: Map<string, GeneratedCode> = new Map();
  private counter = 0;

  addTemplate(template: Omit<GenTemplate, 'created' | 'usageCount'>): boolean {
    if (this.templates.has(template.id)) return false;
    this.templates.set(template.id, {
      ...template,
      created: Date.now(),
      usageCount: 0,
    });
    return true;
  }

  generate(templateId: string, vars: Record<string, string>): GeneratedCode | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const cacheKey = `${templateId}:${JSON.stringify(vars)}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const result: GeneratedCode = { ...cached, id: `gen-${++this.counter}`, timestamp: Date.now() };
      this.generated.push(result);
      return result;
    }

    let code = template.template;
    for (const [key, value] of Object.entries(vars)) {
      code = code.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
    }

    template.usageCount++;
    const result: GeneratedCode = {
      id: `gen-${++this.counter}`,
      templateId,
      code,
      variables: { ...vars },
      timestamp: Date.now(),
    };
    this.generated.push(result);
    this.cache.set(cacheKey, result);
    return result;
  }

  getStats(): GenStats {
    return {
      templates: this.templates.size,
      generated: this.generated.length,
      languages: this.getAllLanguages().length,
    };
  }

  getTemplate(id: string): GenTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): GenTemplate[] {
    return Array.from(this.templates.values());
  }

  removeTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  hasTemplate(id: string): boolean {
    return this.templates.has(id);
  }

  getCount(): number {
    return this.templates.size;
  }

  getLanguage(id: string): string | undefined {
    return this.templates.get(id)?.language;
  }

  getDescription(id: string): string | undefined {
    return this.templates.get(id)?.description;
  }

  getUsageCount(id: string): number {
    return this.templates.get(id)?.usageCount ?? 0;
  }

  updateTemplate(id: string, template: string): boolean {
    const t = this.templates.get(id);
    if (!t) return false;
    t.template = template;
    return true;
  }

  updateLanguage(id: string, language: string): boolean {
    const t = this.templates.get(id);
    if (!t) return false;
    t.language = language;
    return true;
  }

  getAllLanguages(): string[] {
    return [...new Set(Array.from(this.templates.values()).map(t => t.language))];
  }

  getByLanguage(language: string): GenTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.language === language);
  }

  getGenerated(): GeneratedCode[] {
    return [...this.generated];
  }

  getGeneratedByTemplate(templateId: string): GeneratedCode[] {
    return this.generated.filter(g => g.templateId === templateId);
  }

  getGeneratedCount(): number {
    return this.generated.length;
  }

  getCreatedAt(id: string): number {
    return this.templates.get(id)?.created ?? 0;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearGenerated(): void {
    this.generated = [];
  }

  clearAll(): void {
    this.templates.clear();
    this.generated = [];
    this.cache.clear();
    this.counter = 0;
  }
}

export default CodeGenerator;