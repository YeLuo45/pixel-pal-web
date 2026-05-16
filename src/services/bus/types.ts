/**
 * Bus Event Types
 * V101: UnifiedMessageBus for multi-channel support
 */

export type Channel = 'web' | 'telegram' | 'discord' | 'email' | 'qq' | 'feishu' | 'dingtalk' | 'slack';

export interface RawMessage {
  channel: Channel;
  userId: string;
  channelUserId: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface UnifiedMessage {
  id: string;
  channel: Channel;
  userId: string;
  content: string;
  timestamp: number;
  sessionId: string;
  direction: 'inbound' | 'outbound';
  metadata?: Record<string, unknown>;
}

export interface BusEvents {
  'message:received': UnifiedMessage;
  'message:sent': UnifiedMessage;
  'message:delivered': { messageId: string; channel: Channel };
  'user:identified': { userId: string; channel: Channel };
  'channel:connected': { channel: Channel };
  'channel:disconnected': { channel: Channel };
}