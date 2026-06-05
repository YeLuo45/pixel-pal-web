/**
 * Template Engine
 * claude-code-design Template Engine - Register + Render + Inherit + List
 */

export interface Template {
  id: string;
  content: string;
  variables: string[];
  parent?: string;
}

export interface RenderContext {
  [key: string]: unknown;
}

export class TemplateEngine {
  private templates: Map<string, Template> = new Map();

  register(template: Template): boolean {
    if (this.templates.has(template.id)) return false;
    this.templates.set(template.id, { ...template, variables: [...template.variables] });
    return true;
  }

  render(id: string, context: RenderContext = {}): string {
    const template = this.templates.get(id);
    if (!template) return '';

    let content = template.content;
    // Inherit from parent
    if (template.parent) {
      const parent = this.templates.get(template.parent);
      if (parent) {
        content = parent.content + '\n' + content;
      }
    }

    // Replace variables: {{name}}
    content = content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      if (key in context) {
        return String(context[key]);
      }
      return match; // Leave unchanged if not found
    });

    // Handle conditionals: {{#if name}}...{{/if}}
    content = content.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, body) => {
      const value = context[key];
      if (value) return body;
      return '';
    });

    return content;
  }

  hasTemplate(id: string): boolean {
    return this.templates.has(id);
  }

  listTemplates(): string[] {
    return [...this.templates.keys()];
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  removeTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  getCount(): number {
    return this.templates.size;
  }

  getVariables(id: string): string[] {
    return [...(this.templates.get(id)?.variables ?? [])];
  }

  hasVariable(id: string, variable: string): boolean {
    return this.templates.get(id)?.variables.includes(variable) ?? false;
  }

  getParent(id: string): string | undefined {
    return this.templates.get(id)?.parent;
  }

  hasParent(id: string): boolean {
    return !!this.templates.get(id)?.parent;
  }

  getChildren(parentId: string): string[] {
    return Array.from(this.templates.values())
      .filter(t => t.parent === parentId)
      .map(t => t.id);
  }

  getRoots(): string[] {
    return Array.from(this.templates.values())
      .filter(t => !t.parent)
      .map(t => t.id);
  }

  getRootsCount(): number {
    return this.getRoots().length;
  }

  addVariable(id: string, variable: string): boolean {
    const t = this.templates.get(id);
    if (!t) return false;
    if (!t.variables.includes(variable)) {
      t.variables.push(variable);
    }
    return true;
  }

  removeVariable(id: string, variable: string): boolean {
    const t = this.templates.get(id);
    if (!t) return false;
    const idx = t.variables.indexOf(variable);
    if (idx === -1) return false;
    t.variables.splice(idx, 1);
    return true;
  }

  updateContent(id: string, content: string): boolean {
    const t = this.templates.get(id);
    if (!t) return false;
    t.content = content;
    return true;
  }

  updateParent(id: string, parent: string): boolean {
    const t = this.templates.get(id);
    if (!t) return false;
    if (!this.templates.has(parent)) return false;
    t.parent = parent;
    return true;
  }

  getContent(id: string): string | undefined {
    return this.templates.get(id)?.content;
  }

  clearAll(): void {
    this.templates.clear();
  }
}

export default TemplateEngine;