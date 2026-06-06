# PRD: PixelPal V395 — Thunderbolt Hook Engine (Direction E Iteration 41)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-335 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v395-hook-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 41 = Hook Engine**，来源：thunderbolt-design。

本迭代实现钩子引擎：钩子注册、钩子触发、钩子统计。

## 功能规格

### 1. 钩子引擎架构

```
HookRegistrar → HookTrigger → HookReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/he/HookEngine.ts` | 钩子引擎 |
| `src/he/__tests__/HookEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Hook {
  id: string;
  event: string;
  handler: string;
  fired: number;
}

class HookEngine {
  register(event: string, handler: string): string;
  fire(id: string): boolean;
  getStats(): { hooks: number; totalFired: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/he/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/he/__tests__/HookEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v395-hook-engine` 分支