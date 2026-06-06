# PRD: PixelPal V375 — Thunderbolt Cache Engine (Direction E Iteration 37)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-266 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v375-cache-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 37 = Cache Engine**，来源：thunderbolt-design。

本迭代实现缓存引擎：键值设置、键值获取、键值过期、键值统计。

## 功能规格

### 1. 缓存引擎架构

```
KeySetter → ValueGetter → ExpirationChecker → CacheReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ce/CacheEngine.ts` | 缓存引擎 |
| `src/ce/__tests__/CacheEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface CacheEntry {
  key: string;
  value: unknown;
  expires: number;
  hits: number;
}

class CacheEngine {
  set(key: string, value: unknown, ttl?: number): boolean;
  get(key: string): unknown;
  delete(key: string): boolean;
  getStats(): { keys: number; totalHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ce/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ce/__tests__/CacheEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v375-cache-engine` 分支