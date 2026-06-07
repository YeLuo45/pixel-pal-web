# PRD: PixelPal V565 — Claude Code Inspector Engine (Direction A Iteration 76)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-268 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v565-inspector-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 76 = Inspector Engine**，来源：claude-code-design。

本迭代实现检查器引擎：添加、检查、统计（6 种类型：object/array/function/string/number/boolean）。

## 功能规格

### 1. 检查器引擎架构

```
InspectorAdder → Inspecter → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ise/InspectorEngine.ts` | 检查器引擎 |
| `src/ise/__tests__/InspectorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type InspectKind = 'object' | 'array' | 'function' | 'string' | 'number' | 'boolean';

class InspectorEngine {
  add(name: string, value: unknown): string;
  inspect(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { entries: number; totalAdded: number; totalInspected: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ise/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ise/__tests__/InspectorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v565-inspector-engine` 分支