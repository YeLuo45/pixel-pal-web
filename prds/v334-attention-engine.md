# PRD: PixelPal V334 — Generic-Agent Attention Engine (Direction D Iteration 29)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-122 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v334-attention-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 29 = Attention Engine**，来源：generic-agent-design。

本迭代实现注意力引擎：焦点定义、焦点切换、焦点权重、注意力统计。

## 功能规格

### 1. 注意力引擎架构

```
FocusDefiner → FocusSwitcher → FocusWeighter → AttentionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/att/AttentionEngine.ts` | 注意力引擎 |
| `src/att/__tests__/AttentionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Focus {
  id: string;
  name: string;
  weight: number;
  active: boolean;
}

class AttentionEngine {
  define(name: string, weight: number): string;
  focus(id: string): boolean;
  getCurrent(): Focus | null;
  getStats(): { focuses: number; total: number; active: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/att/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/att/__tests__/AttentionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v334-attention-engine` 分支