# PRD: PixelPal V381 — Claude Code Patch Engine (Direction A Iteration 39)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-292 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v381-patch-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 39 = Patch Engine**，来源：claude-code-design。

本迭代实现补丁引擎：补丁创建、补丁应用、补丁回滚、补丁统计。

## 功能规格

### 1. 补丁引擎架构

```
PatchCreator → PatchApplier → PatchRoller → PatchReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pe2/PatchEngine.ts` | 补丁引擎 |
| `src/pe2/__tests__/PatchEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Patch {
  id: string;
  name: string;
  hunks: string[];
  applied: boolean;
  reversible: boolean;
}

class PatchEngine {
  create(name: string, hunks: string[]): string;
  apply(id: string): boolean;
  rollback(id: string): boolean;
  getStats(): { patches: number; applied: number; rolled: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pe2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pe2/__tests__/PatchEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v381-patch-engine` 分支