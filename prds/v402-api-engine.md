# PRD: PixelPal V402 — Nanobot API Engine (Direction B Iteration 43)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-362 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v402-api-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 43 = API Engine**，来源：nanobot-design。

本迭代实现 API 引擎：API 注册、API 调用、API 统计。

## 功能规格

### 1. API 引擎架构

```
APIRegistrar → APIInvoker → APILogger → APIReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/api/APIEngine.ts` | API 引擎 |
| `src/api/__tests__/APIEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface API {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  calls: number;
  errors: number;
}

class APIEngine {
  register(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE'): string;
  call(id: string, success: boolean): boolean;
  getStats(): { apis: number; totalCalls: number; totalErrors: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/api/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/api/__tests__/APIEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v402-api-engine` 分支