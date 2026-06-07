# PRD: PixelPal V514 — Thunderbolt Sentinel Engine (Direction E Iteration 65)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-251 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v514-sentinel-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 65 = Sentinel Engine**，来源：thunderbolt-design。

本迭代实现哨兵引擎：哨兵添加、守卫、检查、统计（3 种模式：normal/strict/lax）。

## 功能规格

### 1. 哨兵引擎架构

```
SentinelAdder → GuardExecuter → Inspector
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sse2/SentinelEngine.ts` | 哨兵引擎 |
| `src/sse2/__tests__/SentinelEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type SentinelMode = 'normal' | 'strict' | 'lax';

class SentinelEngine {
  add(name: string, mode: SentinelMode): string;
  guard(id: string, allow: boolean): boolean;
  inspect(id: string): boolean;
  getStats(): { sentinels: number; totalAdded: number; totalBlocks: number; totalAllows: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sse2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sse2/__tests__/SentinelEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v514-sentinel-engine` 分支