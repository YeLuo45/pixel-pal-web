/**
 * Configuration Manager
 * claude-code-design Configuration Manager - Define + Load + Validate + Export
 */

export type ConfigType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ConfigSchema {
  key: string;
  type: ConfigType;
  required: boolean;
  default?: unknown;
}

export interface Config {
  key: string;
  value: unknown;
  schema?: ConfigSchema;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ConfigurationManager {
  private configs: Map<string, Config> = new Map();
  private schemas: Map<string, ConfigSchema> = new Map();

  defineSchema(schema: ConfigSchema): void {
    this.schemas.set(schema.key, { ...schema });
    if (schema.default !== undefined && !this.configs.has(schema.key)) {
      this.configs.set(schema.key, { key: schema.key, value: schema.default, schema });
    }
  }

  set(key: string, value: unknown): boolean {
    const schema = this.schemas.get(key);
    if (schema) {
      if (!this.checkType(value, schema.type)) return false;
    }
    this.configs.set(key, { key, value, ...(schema ? { schema } : {}) });
    return true;
  }

  get<T = unknown>(key: string): T | undefined {
    return this.configs.get(key)?.value as T | undefined;
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    for (const [key, schema] of this.schemas.entries()) {
      const config = this.configs.get(key);
      if (schema.required && !config) {
        errors.push(`Required config '${key}' is missing`);
        continue;
      }
      if (config && !this.checkType(config.value, schema.type)) {
        errors.push(`Config '${key}' has wrong type`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  export(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, config] of this.configs.entries()) {
      result[key] = config.value;
    }
    return result;
  }

  import(data: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(data)) {
      if (!this.set(key, value)) return false;
    }
    return true;
  }

  has(key: string): boolean {
    return this.configs.has(key);
  }

  remove(key: string): boolean {
    return this.configs.delete(key);
  }

  clear(): void {
    this.configs.clear();
  }

  getCount(): number {
    return this.configs.size;
  }

  getAll(): Config[] {
    return Array.from(this.configs.values());
  }

  getAllKeys(): string[] {
    return [...this.configs.keys()];
  }

  getSchema(key: string): ConfigSchema | undefined {
    return this.schemas.get(key);
  }

  hasSchema(key: string): boolean {
    return this.schemas.has(key);
  }

  getSchemaCount(): number {
    return this.schemas.size;
  }

  removeSchema(key: string): boolean {
    return this.schemas.delete(key);
  }

  getType(key: string): ConfigType | undefined {
    return this.schemas.get(key)?.type;
  }

  isRequired(key: string): boolean {
    return this.schemas.get(key)?.required ?? false;
  }

  getDefault(key: string): unknown {
    return this.schemas.get(key)?.default;
  }

  resetToDefault(key: string): boolean {
    const schema = this.schemas.get(key);
    if (!schema || schema.default === undefined) return false;
    this.configs.set(key, { key, value: schema.default, schema });
    return true;
  }

  resetAllToDefaults(): number {
    let count = 0;
    for (const [key, schema] of this.schemas.entries()) {
      if (schema.default !== undefined) {
        this.configs.set(key, { key, value: schema.default, schema });
        count++;
      }
    }
    return count;
  }

  private checkType(value: unknown, type: ConfigType): boolean {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number' && !isNaN(value);
      case 'boolean': return typeof value === 'boolean';
      case 'array': return Array.isArray(value);
      case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
      default: return false;
    }
  }

  getByType(type: ConfigType): Config[] {
    return Array.from(this.configs.values()).filter(c => c.schema?.type === type);
  }

  getRequiredConfigs(): string[] {
    return [...this.schemas.values()].filter(s => s.required).map(s => s.key);
  }

  getMissingRequired(): string[] {
    return this.getRequiredConfigs().filter(k => !this.configs.has(k));
  }

  isValid(): boolean {
    return this.validate().valid;
  }

  getErrors(): string[] {
    return this.validate().errors;
  }
}

export default ConfigurationManager;