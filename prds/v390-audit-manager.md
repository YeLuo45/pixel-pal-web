# PRD: PixelPal V390 — Thunderbolt Audit Manager (Direction E Iteration 40)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-321 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v390-audit-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 40 = Audit Manager**，来源：thunderbolt-design。

本迭代实现审计管理器：审计日志记录、审计查询、审计统计。

## 功能规格

### 1. 审计管理器架构

```
AuditRecorder → AuditQuerier → AuditReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/au/AuditManager.ts` | 审计管理器 |
| `src/au/__tests__/AuditManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: number;
}

class AuditManager {
  record(actor: string, action: string, target: string): string;
  query(actor?: string, action?: string): AuditEntry[];
  getStats(): { entries: number; actors: number; actions: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/au/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/au/__tests__/AuditManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v390-audit-manager` 分支