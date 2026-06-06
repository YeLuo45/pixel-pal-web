# PRD: PixelPal V340 — Thunderbolt Failure Manager (Direction E Iteration 30)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-149 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v340-failure-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 30 = Failure Manager**，来源：thunderbolt-design。

本迭代实现故障管理器：故障记录、故障分类、故障解决、故障报告。

## 功能规格

### 1. 故障管理器架构

```
FailureRecorder → FailureClassifier → FailureResolver → FailureReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/fm/FailureManager.ts` | 故障管理器 |
| `src/fm/__tests__/FailureManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Failure {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

class FailureManager {
  record(message: string, severity: string): string;
  resolve(id: string): boolean;
  getStats(): { failures: number; resolved: number; unresolved: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/fm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/fm/__tests__/FailureManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v340-failure-manager` 分支