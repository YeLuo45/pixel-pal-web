/**
 * Validator Engine
 * claude-code-design Validator Engine - Add + Validate + Stats
 */

export type ValidationResult = 'pending' | 'valid' | 'invalid';

export interface Validation {
  id: string;
  field: string;
  value: string;
  result: ValidationResult;
  reason: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface VleStats {
  validations: number;
  totalAdded: number;
  totalValid: number;
  totalInvalid: number;
  pending: number;
  valid: number;
  invalid: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueFields: number;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidUrl(s: string): boolean {
  return /^https?:\/\//.test(s);
}

function isValidNumber(s: string): boolean {
  return !isNaN(Number(s)) && s.trim() !== '';
}

function isValidLength(s: string, min: number, max: number): boolean {
  return s.length >= min && s.length <= max;
}

function validate(field: string, value: string): { result: ValidationResult; reason: string } {
  if (field === 'email') {
    return isValidEmail(value)
      ? { result: 'valid', reason: 'email format' }
      : { result: 'invalid', reason: 'bad email format' };
  }
  if (field === 'url') {
    return isValidUrl(value)
      ? { result: 'valid', reason: 'url format' }
      : { result: 'invalid', reason: 'bad url format' };
  }
  if (field === 'number') {
    return isValidNumber(value)
      ? { result: 'valid', reason: 'number format' }
      : { result: 'invalid', reason: 'bad number format' };
  }
  if (field === 'non-empty') {
    return isValidLength(value, 1, 10000)
      ? { result: 'valid', reason: 'non-empty' }
      : { result: 'invalid', reason: 'empty' };
  }
  return { result: 'pending', reason: 'unknown field' };
}

export class ValidatorEngine {
  private validations: Map<string, Validation> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalValid = 0;
  private totalInvalid = 0;

  add(field: string, value: string): string {
    const id = `vle-${++this.counter}`;
    this.validations.set(id, {
      id,
      field,
      value,
      result: 'pending',
      reason: '',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  validate(id: string): boolean {
    const v = this.validations.get(id);
    if (!v) return false;
    if (!v.active) return false;
    const r = validate(v.field, v.value);
    v.result = r.result;
    v.reason = r.reason;
    v.updated = Date.now();
    v.hits++;
    if (r.result === 'valid') this.totalValid++;
    else if (r.result === 'invalid') this.totalInvalid++;
    return true;
  }

  remove(id: string): boolean {
    return this.validations.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const v = this.validations.get(id);
    if (!v) return false;
    v.active = active;
    v.updated = Date.now();
    return true;
  }

  setField(id: string, field: string): boolean {
    const v = this.validations.get(id);
    if (!v) return false;
    v.field = field;
    v.updated = Date.now();
    return true;
  }

  setValue(id: string, value: string): boolean {
    const v = this.validations.get(id);
    if (!v) return false;
    v.value = value;
    v.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const v of this.validations.values()) {
      v.result = 'pending';
      v.reason = '';
      v.active = true;
      v.hits = 0;
    }
    this.totalAdded = 0;
    this.totalValid = 0;
    this.totalInvalid = 0;
  }

  getStats(): VleStats {
    const all = Array.from(this.validations.values());
    return {
      validations: all.length,
      totalAdded: this.totalAdded,
      totalValid: this.totalValid,
      totalInvalid: this.totalInvalid,
      pending: all.filter(v => v.result === 'pending').length,
      valid: all.filter(v => v.result === 'valid').length,
      invalid: all.filter(v => v.result === 'invalid').length,
      active: all.filter(v => v.active).length,
      inactive: all.filter(v => !v.active).length,
      totalHits: all.reduce((s, v) => s + v.hits, 0),
      uniqueFields: new Set(all.map(v => v.field)).size,
    };
  }

  getValidation(id: string): Validation | undefined {
    return this.validations.get(id);
  }

  getAllValidations(): Validation[] {
    return Array.from(this.validations.values());
  }

  hasValidation(id: string): boolean {
    return this.validations.has(id);
  }

  getCount(): number {
    return this.validations.size;
  }

  getField(id: string): string | undefined {
    return this.validations.get(id)?.field;
  }

  getValue(id: string): string | undefined {
    return this.validations.get(id)?.value;
  }

  getResult(id: string): ValidationResult | undefined {
    return this.validations.get(id)?.result;
  }

  getReason(id: string): string | undefined {
    return this.validations.get(id)?.reason;
  }

  getHits(id: string): number {
    return this.validations.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.validations.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.validations.get(id)?.result === 'pending';
  }

  isValid(id: string): boolean {
    return this.validations.get(id)?.result === 'valid';
  }

  isInvalid(id: string): boolean {
    return this.validations.get(id)?.result === 'invalid';
  }

  getByResult(result: ValidationResult): Validation[] {
    return Array.from(this.validations.values()).filter(v => v.result === result);
  }

  getByField(field: string): Validation[] {
    return Array.from(this.validations.values()).filter(v => v.field === field);
  }

  getActiveValidations(): Validation[] {
    return Array.from(this.validations.values()).filter(v => v.active);
  }

  getInactiveValidations(): Validation[] {
    return Array.from(this.validations.values()).filter(v => !v.active);
  }

  getAllFields(): string[] {
    return [...new Set(Array.from(this.validations.values()).map(v => v.field))];
  }

  getNewest(): Validation | null {
    const all = Array.from(this.validations.values());
    if (all.length === 0) return null;
    return all.reduce((max, v) => v.created > max.created ? v : max);
  }

  getOldest(): Validation | null {
    const all = Array.from(this.validations.values());
    if (all.length === 0) return null;
    return all.reduce((min, v) => v.created < min.created ? v : min);
  }

  getCreatedAt(id: string): number {
    return this.validations.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.validations.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalValid(): number {
    return this.totalValid;
  }

  getTotalInvalid(): number {
    return this.totalInvalid;
  }

  clearAll(): void {
    this.validations.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalValid = 0;
    this.totalInvalid = 0;
  }
}

export default ValidatorEngine;