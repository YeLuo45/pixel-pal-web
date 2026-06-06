# PRD: PixelPal V400 — Thunderbolt Signal Manager (Direction E Iteration 42)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-338 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v400-signal-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 42 = Signal Manager**，来源：thunderbolt-design。

本迭代实现信号管理器：信号发送、信号接收、信号路由、信号统计。

## 功能规格

### 1. 信号管理器架构

```
SignalEmitter → SignalRouter → SignalHandler → SignalReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sm2/SignalManager.ts` | 信号管理器 |
| `src/sm2/__tests__/SignalManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Signal {
  id: string;
  name: string;
  sender: string;
  receiver: string;
  delivered: boolean;
}

class SignalManager {
  send(name: string, sender: string, receiver: string): string;
  deliver(id: string): boolean;
  getStats(): { signals: number; delivered: number; pending: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sm2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sm2/__tests__/SignalManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v400-signal-manager` 分支