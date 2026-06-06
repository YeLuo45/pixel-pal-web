# PRD: PixelPal V417 — Nanobot Server Manager (Direction B Iteration 46)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-430 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v417-server-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 46 = Server Manager**，来源：nanobot-design。

本迭代实现服务器管理器：服务器注册、服务器处理、服务器统计。

## 功能规格

### 1. 服务器管理器架构

```
ServerRegistrar → ServerHandler → ServerReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sm3/ServerManager.ts` | 服务器管理器 |
| `src/sm3/__tests__/ServerManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Server {
  id: string;
  host: string;
  port: number;
  requests: number;
  healthy: boolean;
}

class ServerManager {
  register(host: string, port: number): string;
  handle(id: string, success: boolean): boolean;
  setHealth(id: string, healthy: boolean): boolean;
  getStats(): { servers: number; totalRequests: number; healthy: number; unhealthy: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sm3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sm3/__tests__/ServerManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v417-server-manager` 分支