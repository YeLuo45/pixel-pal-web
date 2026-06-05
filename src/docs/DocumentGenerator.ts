/**
 * Document Generator
 * claude-code-design Document Generator - Template + Render + Validate + Export
 */

export interface Template {
  name: string;
  sections: string[];
}

export interface DocSection {
  name: string;
  body: string;
}

export interface Document {
  title: string;
  content: string;
  sections: DocSection[];
}

export type ExportFormat = 'md' | 'json' | 'html';

export class DocumentGenerator {
  private templates: Map<string, Template> = new Map();

  addTemplate(template: Template): void {
    this.templates.set(template.name, { ...template, sections: [...template.sections] });
  }

  generate(name: string, data: Record<string, string>): Document {
    const template = this.templates.get(name);
    if (!template) {
      return { title: '', content: '', sections: [] };
    }

    const sections: DocSection[] = template.sections.map(sectionName => ({
      name: sectionName,
      body: data[sectionName] ?? '',
    }));

    const content = sections.map(s => `## ${s.name}\n${s.body}`).join('\n\n');
    const title = data.title ?? name;

    return { title, content, sections };
  }

  validate(doc: Document): boolean {
    if (!doc.title || doc.title.trim() === '') return false;
    if (doc.sections.length === 0) return false;
    return doc.sections.every(s => s.name && s.name.trim() !== '');
  }

  export(doc: Document, format: ExportFormat): string {
    if (format === 'json') {
      return JSON.stringify(doc, null, 2);
    }
    if (format === 'md') {
      const parts = [`# ${doc.title}`, ''];
      for (const section of doc.sections) {
        parts.push(`## ${section.name}`);
        parts.push(section.body);
        parts.push('');
      }
      return parts.join('\n');
    }
    if (format === 'html') {
      const parts = [`<h1>${doc.title}</h1>`];
      for (const section of doc.sections) {
        parts.push(`<h2>${section.name}</h2>`);
        parts.push(`<p>${section.body}</p>`);
      }
      return parts.join('\n');
    }
    return doc.content;
  }

  getTemplate(name: string): Template | undefined {
    return this.templates.get(name);
  }

  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  removeTemplate(name: string): boolean {
    return this.templates.delete(name);
  }

  hasTemplate(name: string): boolean {
    return this.templates.has(name);
  }

  getTemplateCount(): number {
    return this.templates.size;
  }

  getSectionCount(templateName: string): number {
    return this.templates.get(templateName)?.sections.length ?? 0;
  }

  addSection(templateName: string, section: string): boolean {
    const template = this.templates.get(templateName);
    if (!template) return false;
    if (!template.sections.includes(section)) {
      template.sections.push(section);
    }
    return true;
  }

  removeSection(templateName: string, section: string): boolean {
    const template = this.templates.get(templateName);
    if (!template) return false;
    const idx = template.sections.indexOf(section);
    if (idx === -1) return false;
    template.sections.splice(idx, 1);
    return true;
  }

  getSections(templateName: string): string[] {
    return [...(this.templates.get(templateName)?.sections ?? [])];
  }

  validateTemplate(template: Template): boolean {
    return template.name.trim() !== '' && template.sections.length > 0;
  }

  generateSummary(doc: Document): string {
    const wordCount = doc.content.split(/\s+/).filter(w => w.length > 0).length;
    return `Title: ${doc.title}, Sections: ${doc.sections.length}, Words: ${wordCount}`;
  }

  searchSections(doc: Document, query: string): DocSection[] {
    const lower = query.toLowerCase();
    return doc.sections.filter(s => s.body.toLowerCase().includes(lower));
  }

  getSectionNames(doc: Document): string[] {
    return doc.sections.map(s => s.name);
  }

  getSectionBody(doc: Document, name: string): string | undefined {
    return doc.sections.find(s => s.name === name)?.body;
  }

  updateSection(doc: Document, name: string, body: string): Document {
    const sections = doc.sections.map(s => s.name === name ? { ...s, body } : s);
    return { ...doc, sections };
  }

  clearAll(): void {
    this.templates.clear();
  }
}

export default DocumentGenerator;