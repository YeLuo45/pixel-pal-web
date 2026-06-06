# PRD: PixelPal V428 — Chatdev Voice Engine (Direction C Iteration 48)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-477 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v428-voice-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 48 = Voice Engine**，来源：chatdev-design。

本迭代实现语音引擎：语音通道、语音广播、语音统计。

## 功能规格

### 1. 语音引擎架构

```
VoiceChannel → VoiceBroadcaster → VoiceReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/vo2/VoiceEngine.ts` | 语音引擎 |
| `src/vo2/__tests__/VoiceEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type VoiceState = 'idle' | 'speaking' | 'muted' | 'deafened';

interface Voice {
  id: string;
  user: string;
  state: VoiceState;
  speaking: boolean;
}

class VoiceEngine {
  join(user: string): string;
  leave(id: string): boolean;
  setState(id: string, state: VoiceState): boolean;
  startSpeaking(id: string): boolean;
  stopSpeaking(id: string): boolean;
  getStats(): { voices: number; speaking: number; muted: number; deafened: number; idle: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/vo2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/vo2/__tests__/VoiceEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v428-voice-engine` 分支