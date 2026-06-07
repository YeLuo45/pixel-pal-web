# PRD: PixelPal V496 — Nanobot Connection Engine (Direction B Iteration 62)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-157 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v496-connection-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 62 = Connection Engine**，来源：nanobot-design。

本迭代实现连接引擎：连接、发送、关闭、半开、统计。

## 功能规格

### 1. 连接引擎架构

```
ConnectionOpener → DataSender → ConnectionCloser
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cne/ConnectionEngine.ts` | 连接引擎 |
| `src/cne/__tests__/ConnectionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ConnStatus = 'open' | 'closed' | 'half-open';

class ConnectionEngine {
  connect(from: string, to: string): string;
  send(id: string, bytes: number): boolean;
  close(id: string): boolean;
  halfOpen(id: string): boolean;
  getStats(): { connections: number; totalOpened: number; totalClosed: number; totalBytes: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cne/__tests__/ConnectionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v496-connection-engine` 分支