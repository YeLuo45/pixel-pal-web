# PRD: PixelPal V591 — Nanobot Mesh Engine (Direction B Iteration 81)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-014 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v591-mesh-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 81 = Mesh Engine**，来源：nanobot-design。

本迭代实现网格引擎：添加节点、连接、断开、错误、统计（4 种状态：connected/disconnected/connecting/error）。

## 功能规格

### 1. 网格引擎架构

```
NodeAdder → Connecter → Disconnecter → ErrorSetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mhe/MeshEngine.ts` | 网格引擎 |
| `src/mhe/__tests__/MeshEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type MeshLinkState = 'connected' | 'disconnected' | 'connecting' | 'error';

class MeshEngine {
  addNode(name: string): string;
  connect(id: string, peerCount: number): boolean;
  disconnect(id: string): boolean;
  error(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { nodes: number; totalAdded: number; totalConnected: number; totalDisconnected: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mhe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mhe/__tests__/MeshEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v591-mesh-engine` 分支