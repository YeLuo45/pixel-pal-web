# PRD: PixelPal V470 — Claude Code Token Bucket Engine (Direction A Iteration 57)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-081 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v470-token-bucket-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 57 = Token Bucket Engine**，来源：claude-code-design。

本迭代实现令牌桶引擎：桶创建、令牌消费、令牌补充、统计。

## 功能规格

### 1. 令牌桶引擎架构

```
BucketCreator → TokenConsumer → TokenRefiller
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tbe/TokenBucketEngine.ts` | 令牌桶引擎 |
| `src/tbe/__tests__/TokenBucketEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Bucket {
  id: string;
  name: string;
  capacity: number;
  tokens: number;
  refillRate: number;
}

class TokenBucketEngine {
  create(name: string, capacity: number, refillRate: number): string;
  consume(id: string, amount: number): boolean;
  refill(id: string, amount: number): boolean;
  getStats(): { buckets: number; totalConsumed: number; totalRefilled: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tbe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tbe/__tests__/TokenBucketEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v470-token-bucket-engine` 分支