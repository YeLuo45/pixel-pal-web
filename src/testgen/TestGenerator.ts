/**
 * Test Generator
 * claude-code-design Test Generator - Template + Boundary + Coverage + Name
 */

export interface ParamSpec {
  name: string;
  type: string;
}

export interface FunctionSpec {
  name: string;
  params: ParamSpec[];
  returnType: string;
}

export class TestGenerator {
  generateTests(spec: FunctionSpec): string {
    const testName = this.generateTestName(spec);
    const lines: string[] = [];
    lines.push(`describe('${spec.name}', () => {`);
    lines.push(`  it('${testName}', () => {`);
    lines.push(`    const result = ${spec.name}(${this.generateTestArgs(spec)});`);
    lines.push(`    expect(result).toBeDefined();`);
    lines.push(`  });`);
    lines.push(`});`);
    return lines.join('\n');
  }

  detectBoundaries(spec: FunctionSpec): string[] {
    const boundaries: string[] = [];
    for (const param of spec.params) {
      if (param.type === 'number') {
        boundaries.push(`${param.name}: 0`);
        boundaries.push(`${param.name}: -1`);
        boundaries.push(`${param.name}: 1`);
        boundaries.push(`${param.name}: Number.MAX_SAFE_INTEGER`);
      } else if (param.type === 'string') {
        boundaries.push(`${param.name}: ''`);
        boundaries.push(`${param.name}: 'a'`);
      } else if (param.type === 'array' || param.type.includes('[]')) {
        boundaries.push(`${param.name}: []`);
        boundaries.push(`${param.name}: [null]`);
      } else if (param.type === 'boolean') {
        boundaries.push(`${param.name}: true`);
        boundaries.push(`${param.name}: false`);
      }
    }
    return boundaries;
  }

  getCoverageEstimate(spec: FunctionSpec): number {
    if (spec.params.length === 0) return 100;
    // Each param adds coverage cases (1 base + 2 boundary = 3 cases)
    const baseCases = 1;
    const boundaryCasesPerParam = 3;
    return Math.min(100, Math.round((baseCases + spec.params.length * boundaryCasesPerParam) / 10));
  }

  generateTestName(spec: FunctionSpec): string {
    return `should call ${spec.name} successfully`;
  }

  generateTestArgs(spec: FunctionSpec): string {
    return spec.params.map(p => this.getDefaultValue(p)).join(', ');
  }

  private getDefaultValue(param: ParamSpec): string {
    if (param.type === 'number') return '0';
    if (param.type === 'string') return "''";
    if (param.type === 'boolean') return 'false';
    if (param.type === 'array' || param.type.includes('[]')) return '[]';
    if (param.type.includes('{') || param.type === 'object') return '{}';
    return 'null';
  }

  getParamCount(spec: FunctionSpec): number {
    return spec.params.length;
  }

  hasParams(spec: FunctionSpec): boolean {
    return spec.params.length > 0;
  }

  getReturnType(spec: FunctionSpec): string {
    return spec.returnType;
  }

  getParamNames(spec: FunctionSpec): string[] {
    return spec.params.map(p => p.name);
  }

  getParamTypes(spec: FunctionSpec): string[] {
    return spec.params.map(p => p.type);
  }

  getNumberTypeParamNames(spec: FunctionSpec): string[] {
    return spec.params.filter(p => p.type === 'number').map(p => p.name);
  }

  getStringTypeParamNames(spec: FunctionSpec): string[] {
    return spec.params.filter(p => p.type === 'string').map(p => p.name);
  }

  getBoundaryCount(spec: FunctionSpec): number {
    return this.detectBoundaries(spec).length;
  }

  generateMockImport(spec: FunctionSpec): string {
    return `import { ${spec.name} } from './${spec.name}';`;
  }

  generateSuiteName(spec: FunctionSpec): string {
    return `${spec.name} Suite`;
  }

  generateEmptyTest(spec: FunctionSpec): string {
    return `it('${spec.name} test', () => {});`;
  }

  isValidSpec(spec: FunctionSpec): boolean {
    return !!spec.name && spec.params !== undefined && !!spec.returnType;
  }

  getComplexityScore(spec: FunctionSpec): number {
    return spec.params.length * 2 + (spec.returnType === 'void' ? 0 : 1);
  }
}

export default TestGenerator;