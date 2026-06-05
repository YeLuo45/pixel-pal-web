# PRD: PixelPal V307 — Nanobot Protocol Adapter (Direction B Iteration 24)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-045 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v307-protocol-adapter |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 24 = Protocol Adapter**，来源：nanobot-design。

本迭代实现协议适配器：协议注册、协议转换、协议路由、协议统计。

## 功能规格

### 1. 协议适配器架构

```
ProtocolRegistrar → ProtocolConverter → ProtocolRouter → ProtocolStatistics
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/proto/ProtocolAdapter.ts` | 协议适配器 |
| `src/proto/__tests__/ProtocolAdapter.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Protocol {
  id: string;
  name: string;
  transform: (data: unknown) => unknown;
}

class ProtocolAdapter {
  register(protocol: Protocol): boolean;
  adapt(fromId: string, toId: string, data: unknown): unknown;
  getStats(): { protocols: number; transforms: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/proto/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/proto/__tests__/ProtocolAdapter.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v307-protocol-adapter` 分支