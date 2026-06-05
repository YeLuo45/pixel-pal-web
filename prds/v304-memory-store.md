# PRD: PixelPal V304 — Generic-Agent Memory Store (Direction D Iteration 23)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-039 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v304-memory-store |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 23 = Memory Store**，来源：generic-agent-design。

本迭代实现记忆存储：记忆写入、记忆读取、记忆搜索、记忆归档。

## 功能规格

### 1. 记忆存储架构

```
MemoryWriter → MemoryReader → MemorySearcher → MemoryArchiver
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mem/MemoryStore.ts` | 记忆存储 |
| `src/mem/__tests__/MemoryStore.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Memory {
  id: string;
  key: string;
  value: unknown;
  tags: string[];
  created: number;
  archived: boolean;
}

class MemoryStore {
  write(key: string, value: unknown, tags?: string[]): string;
  read(id: string): Memory | null;
  search(query: string): Memory[];
  archive(id: string): boolean;
  getStats(): { memories: number; archived: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mem/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mem/__tests__/MemoryStore.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v304-memory-store` 分支