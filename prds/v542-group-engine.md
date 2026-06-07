# PRD: PixelPal V542 — Chatdev Group Engine (Direction C Iteration 71)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-156 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v542-group-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 71 = Group Engine**，来源：chatdev-design。

本迭代实现群组引擎：创建群组、添加成员、移除成员、删除、统计（3 种类型：public/private/secret）。

## 功能规格

### 1. 群组引擎架构

```
GroupCreator → MemberAdder → MemberRemover
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/gpe/GroupEngine.ts` | 群组引擎 |
| `src/gpe/__tests__/GroupEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type GroupType = 'public' | 'private' | 'secret';

class GroupEngine {
  create(name: string, type: GroupType, maxSize: number): string;
  addMember(id: string): boolean;
  removeMember(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { groups: number; totalCreated: number; totalAdded: number; totalRemoved: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/gpe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/gpe/__tests__/GroupEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v542-group-engine` 分支