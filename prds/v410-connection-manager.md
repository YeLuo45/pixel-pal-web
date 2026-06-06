# PRD: PixelPal V410 — Thunderbolt Connection Manager (Direction E Iteration 44)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-389 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v410-connection-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 44 = Connection Manager**，来源：thunderbolt-design。

本迭代实现连接管理器：连接创建、消息交换、连接统计。

## 功能规格

### 1. 连接管理器架构

```
ConnectionCreator → MessageExchanger → ConnectionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cm/ConnectionManager.ts` | 连接管理器 |
| `src/cm/__tests__/ConnectionManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Connection {
  id: string;
  from: string;
  to: string;
  open: boolean;
  messages: number;
}

class ConnectionManager {
  create(from: string, to: string): string;
  exchange(id: string): boolean;
  close(id: string): boolean;
  getStats(): { connections: number; open: number; closed: number; totalMessages: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cm/__tests__/ConnectionManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v410-connection-manager` 分支