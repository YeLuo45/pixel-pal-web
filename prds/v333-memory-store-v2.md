# PRD: PixelPal V333 — Chatdev Memory Store v2 (Direction C Iteration 29)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-121 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v333-memory-store-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 29 = Memory Store v2**，来源：chatdev-design。

本迭代实现记忆存储 v2：记忆写入、记忆读取、记忆关联、记忆统计。

## 功能规格

### 1. 记忆存储 v2 架构

```
MemoryWriter → MemoryReader → MemoryAssociator → MemoryReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mem2/MemoryStoreV2.ts` | 记忆存储 v2 |
| `src/mem2/__tests__/MemoryStoreV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Memory {
  id: string;
  key: string;
  value: unknown;
  related: string[];
  hits: number;
}

class MemoryStoreV2 {
  write(key: string, value: unknown): string;
  read(id: string): Memory | null;
  relate(id1: string, id2: string): boolean;
  getStats(): { memories: number; totalHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mem2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mem2/__tests__/MemoryStoreV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v333-memory-store-v2` 分支