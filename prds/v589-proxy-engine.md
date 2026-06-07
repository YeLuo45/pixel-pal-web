# PRD: PixelPal V589 — Thunderbolt Proxy Engine (Direction E Iteration 80)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-008 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v589-proxy-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 80 = Proxy Engine**，来源：thunderbolt-design。

本迭代实现代理引擎：添加、转发、拒绝、关闭、重置、统计（4 种状态：idle/forwarding/rejected/closed）。

## 功能规格

### 1. 代理引擎架构

```
ProxyAdder → Forwarder → Rejecter → Closer → Reseter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pxe/ProxyEngine.ts` | 代理引擎 |
| `src/pxe/__tests__/ProxyEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ProxyStatus = 'idle' | 'forwarding' | 'rejected' | 'closed';

class ProxyEngine {
  add(name: string, source: string, target: string): string;
  forward(id: string): boolean;
  reject(id: string): boolean;
  close(id: string): boolean;
  reset(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { proxies: number; totalAdded: number; totalForwarded: number; totalRejected: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pxe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pxe/__tests__/ProxyEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v589-proxy-engine` 分支