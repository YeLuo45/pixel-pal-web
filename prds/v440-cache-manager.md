# PRD: PixelPal V440 — Thunderbolt Cache Manager (Direction E Iteration 50)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-517 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v440-cache-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 50 = Cache Manager**，来源：thunderbolt-design。

本迭代实现缓存管理器：缓存设置、缓存获取、缓存统计。

## 功能规格

### 1. 缓存管理器架构

```
CacheSetter → CacheGetter → CacheReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cam/CacheManager.ts` | 缓存管理器 |
| `src/cam/__tests__/CacheManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface CacheItem {
  id: string;
  key: string;
  value: string;
  hits: number;
  expires: number;
}

class CacheManager {
  set(key: string, value: string, ttl?: number): string;
  get(key: string): string | null;
  delete(key: string): boolean;
  clear(): void;
  getStats(): { items: number; hits: number; misses: number; expired: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cam/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cam/__tests__/CacheManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v440-cache-manager` 分支