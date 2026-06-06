# PRD: PixelPal V435 — Thunderbolt Buffer Manager (Direction E Iteration 49)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-506 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v435-buffer-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 49 = Buffer Manager**，来源：thunderbolt-design。

本迭代实现缓冲区管理器：缓冲创建、缓冲写入、缓冲统计。

## 功能规格

### 1. 缓冲区管理器架构

```
BufferCreator → BufferWriter → BufferReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bfm/BufferManager.ts` | 缓冲区管理器 |
| `src/bfm/__tests__/BufferManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Buffer {
  id: string;
  name: string;
  size: number;
  capacity: number;
  used: number;
}

class BufferManager {
  create(name: string, capacity: number): string;
  write(id: string, data: string): boolean;
  read(id: string): string;
  clear(id: string): boolean;
  getStats(): { buffers: number; totalUsed: number; totalCapacity: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bfm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bfm/__tests__/BufferManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v435-buffer-manager` 分支