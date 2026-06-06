# PRD: PixelPal V404 — Generic-Agent Tool Manager (Direction D Iteration 43)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-367 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v404-tool-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 43 = Tool Manager**，来源：generic-agent-design。

本迭代实现工具管理器：工具注册、工具调用、工具统计。

## 功能规格

### 1. 工具管理器架构

```
ToolRegistrar → ToolInvoker → ToolReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tm/ToolManager.ts` | 工具管理器 |
| `src/tm/__tests__/ToolManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  invocations: number;
  successes: number;
  failures: number;
}

class ToolManager {
  register(name: string, description: string): string;
  invoke(id: string, success: boolean): boolean;
  getStats(): { tools: number; totalInvocations: number; totalSuccess: number; totalFailures: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tm/__tests__/ToolManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v404-tool-manager` 分支