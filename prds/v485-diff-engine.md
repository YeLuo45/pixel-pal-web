# PRD: PixelPal V485 — Claude Code Diff Engine (Direction A Iteration 60)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-141 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v485-diff-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 60 = Diff Engine**，来源：claude-code-design。

本迭代实现差异比较引擎：差异计算、差异应用、统计。

## 功能规格

### 1. 差异引擎架构

```
DiffComputer → DiffApplier → DiffStats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/dfe/DiffEngine.ts` | 差异引擎 |
| `src/dfe/__tests__/DiffEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type DiffOp = 'add' | 'remove' | 'same';

class DiffEngine {
  compute(oldText: string, newText: string): string[];
  apply(id: string): boolean;
  getStats(): { diffs: number; totalAdds: number; totalRemoves: number; totalSames: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/dfe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/dfe/__tests__/DiffEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v485-diff-engine` 分支