/**
 * Agent Role Types
 */

export type RoleType = 'designer' | 'executor' | 'reviewer' | 'coordinator';

export interface RoleSpec {
  roleId: string;
  roleType: RoleType;
  capabilities: string[];
  maxConcurrentTasks: number;
  currentLoad: number;
}

export interface Task {
  id: string;
  roleType: RoleType;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  createdAt: number;
  assignedTo?: string;
}

export type AgentMessageType = 'task' | 'result' | 'review' | 'error' | 'notification';

export type MessagePriority = 'low' | 'normal' | 'high';

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: AgentMessageType;
  payload: unknown;
  timestamp: number;
  priority?: MessagePriority;
}

export interface Subscription {
  agentId: string;
  messageTypes: AgentMessageType[];
  callback: (message: AgentMessage) => void;
}