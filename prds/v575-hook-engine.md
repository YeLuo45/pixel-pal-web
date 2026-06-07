# PRD: PixelPal V575 — Claude Code Hook Engine (Direction A Iteration 78)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-306 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v575-hook-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 78 = Hook Engine**，来源：claude-code-design。

本迭代实现钩子引擎：注册、触发、统计（5 种事件：before/after/success/error/always）。

## 功能规格

### 1. 钩子引擎架构

```
HookRegister → Triggers → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/hoe/HookEngine.ts` | 钩子引擎 |
| `src/hoe/__tests__/HookEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type HookEvent = 'before' | 'after' | 'success' | 'error' | 'always';

class HookEngine {
  register(name: string, event: HookEvent, target: string, callback: string): string;
  trigger(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { hooks: number; totalAdded: number; totalTriggered: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/hoe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/hoe/__tests__/HookEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v575-hook-engine` 分支