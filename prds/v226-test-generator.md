# PRD: PixelPal V226 — Claude Code Test Generator (Direction A Iteration 8/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-026 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v226-test-generator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 8/9 = Test Generator**，来源：claude-code-design。

本迭代实现测试生成器：单元测试生成、边界检测、覆盖率分析、测试模板。

## 功能规格

### 1. 测试生成器架构

```
TestTemplateEngine → BoundaryDetector → CoverageAnalyzer → TestGenerator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/testgen/TestGenerator.ts` | 测试生成器 |
| `src/testgen/__tests__/TestGenerator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface FunctionSpec {
  name: string;
  params: { name: string; type: string }[];
  returnType: string;
}

class TestGenerator {
  generateTests(spec: FunctionSpec): string;
  detectBoundaries(spec: FunctionSpec): string[];
  getCoverageEstimate(spec: FunctionSpec): number;
  generateTestName(spec: FunctionSpec): string;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/testgen/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/testgen/__tests__/TestGenerator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v226-test-generator` 分支