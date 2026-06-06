# PRD: PixelPal V462 — Nanobot Slot Manager (Direction B Iteration 55)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-034 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v462-slot-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 55 = Slot Manager**，来源：nanobot-design。

本迭代实现槽位管理器：槽位添加、槽位预留、槽位释放、统计。

## 功能规格

### 1. 槽位管理器架构

```
SlotAdder → SlotReserver → SlotReleaser
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/slm/SlotManager.ts` | 槽位管理器 |
| `src/slm/__tests__/SlotManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Slot {
  id: string;
  name: string;
  reserved: boolean;
  owner: string;
}

class SlotManager {
  add(name: string): string;
  reserve(id: string, owner: string): boolean;
  release(id: string): boolean;
  getStats(): { slots: number; reserved: number; totalReserves: number; totalReleases: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/slm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/slm/__tests__/SlotManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v462-slot-manager` 分支