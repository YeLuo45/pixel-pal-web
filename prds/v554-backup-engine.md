# PRD: PixelPal V554 — Thunderbolt Backup Engine (Direction E Iteration 73)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-218 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v554-backup-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 73 = Backup Engine**，来源：thunderbolt-design。

本迭代实现备份引擎：创建、完成、恢复、验证、失败、统计（4 种状态：pending/completed/failed/verified）。

## 功能规格

### 1. 备份引擎架构

```
BackupCreator → Completer → Restorer → Verifier → Failer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bue2/BackupEngine.ts` | 备份引擎 |
| `src/bue2/__tests__/BackupEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BackupStatus = 'pending' | 'completed' | 'failed' | 'verified';

class BackupEngine {
  create(name: string, size: number): string;
  complete(id: string): boolean;
  restore(id: string): boolean;
  verify(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { backups: number; totalCreated: number; totalRestored: number; totalVerified: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bue2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bue2/__tests__/BackupEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v554-backup-engine` 分支