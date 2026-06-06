# PRD: PixelPal V422 — Nanobot Proxy Manager (Direction B Iteration 47)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-462 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v422-proxy-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 47 = Proxy Manager**，来源：nanobot-design。

本迭代实现代理管理器：代理注册、代理转发、代理统计。

## 功能规格

### 1. 代理管理器架构

```
ProxyRegistrar → ProxyForwarder → ProxyReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pxy/ProxyManager.ts` | 代理管理器 |
| `src/pxy/__tests__/ProxyManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Proxy {
  id: string;
  name: string;
  url: string;
  forwards: number;
}

class ProxyManager {
  register(name: string, url: string): string;
  forward(id: string): boolean;
  getStats(): { proxies: number; totalForwards: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pxy/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pxy/__tests__/ProxyManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v422-proxy-manager` 分支