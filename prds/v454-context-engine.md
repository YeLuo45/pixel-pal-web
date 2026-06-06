# PRD: PixelPal V454 — Generic-Agent Context Engine (Direction D Iteration 53)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-567 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v454-context-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 53 = Context Engine**，来源：generic-agent-design。

本迭代实现上下文引擎：上下文设置、上下文获取、上下文切换、上下文统计。

## 功能规格

### 1. 上下文引擎架构

```
ContextSetter → ContextGetter → ContextSwitcher
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cxe/ContextEngine.ts` | 上下文引擎 |
| `src/cxe/__tests__/ContextEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ContextItem {
  id: string;
  key: string;
  value: string;
  priority: number;
}

class ContextEngine {
  set(key: string, value: string, priority: number): string;
  get(id: string): string;
  switch(id: string, newValue: string): boolean;
  getStats(): { contexts: number; totalGets: number; totalSets: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cxe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cxe/__tests__/ContextEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v454-context-engine` 分支