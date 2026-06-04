# PRD: PixelPal V231 — Claude Code Dependency Analyzer (Direction A Iteration 9/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-032 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v231-dependency-analyzer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 9/9 = Dependency Analyzer**，来源：claude-code-design。

本迭代实现依赖分析器：依赖检测、循环检测、版本管理、依赖报告。

## 功能规格

### 1. 依赖分析器架构

```
DependencyGraph → CycleDetector → VersionChecker → DependencyReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/dep/DependencyAnalyzer.ts` | 依赖分析器 |
| `src/dep/__tests__/DependencyAnalyzer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Dependency {
  name: string;
  version: string;
  dependencies: string[];
}

interface DependencyReport {
  total: number;
  cycles: string[][];
  outdated: string[];
}

class DependencyAnalyzer {
  addDependency(dep: Dependency): void;
  detectCycles(): string[][];
  checkOutdated(current: Record<string, string>): string[];
  generateReport(): DependencyReport;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/dep/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/dep/__tests__/DependencyAnalyzer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v231-dependency-analyzer` 分支