/**
 * AgentStudio Tests
 * chatdev-design Multi-Agent Studio v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentStudio } from '../AgentStudio';

describe('AgentStudio', () => {
  let studio: AgentStudio;

  beforeEach(() => {
    studio = new AgentStudio();
  });

  afterEach(() => {
    studio.clearAll();
  });

  // ============================================================
  // createAgent
  // ============================================================
  describe('createAgent', () => {
    it('should create agent with unique id', () => {
      const a1 = studio.createAgent('Alice', 'coder');
      const a2 = studio.createAgent('Bob', 'designer');
      expect(a1.id).not.toBe(a2.id);
      expect(a1.name).toBe('Alice');
      expect(a1.role).toBe('coder');
      expect(a1.status).toBe('idle');
    });

    it('should allow many agents', () => {
      for (let i = 0; i < 50; i++) studio.createAgent(`Agent${i}`, 'role');
      expect(studio.getAllAgents()).toHaveLength(50);
    });

    it('should store agent for retrieval', () => {
      const agent = studio.createAgent('Test', 'dev');
      expect(studio.getAgent(agent.id)).toBeDefined();
    });
  });

  // ============================================================
  // assignTask
  // ============================================================
  describe('assignTask', () => {
    it('should assign task to agent', () => {
      const agent = studio.createAgent('A', 'dev');
      const result = studio.assignTask(agent.id, {
        description: 'Build feature',
        status: 'pending',
        priority: 1,
      });
      expect(result).toBe(true);
      expect(studio.getAgentTasks(agent.id)).toHaveLength(1);
    });

    it('should set agent status to busy', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T', status: 'pending', priority: 1 });
      expect(studio.getAgent(agent.id)?.status).toBe('busy');
    });

    it('should fail for unknown agent', () => {
      expect(studio.assignTask('unknown', { description: 'T', status: 'pending', priority: 1 })).toBe(false);
    });

    it('should assign multiple tasks', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T1', status: 'pending', priority: 1 });
      studio.assignTask(agent.id, { description: 'T2', status: 'pending', priority: 2 });
      expect(studio.getAgentTasks(agent.id)).toHaveLength(2);
    });
  });

  // ============================================================
  // sendMessage
  // ============================================================
  describe('sendMessage', () => {
    it('should send message between agents', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      const result = studio.sendMessage(a1.id, a2.id, 'Hello');
      expect(result).toBe(true);
      // a1's sent message appears in a1's inbox (from=a1, to=a2)
      const msgs = studio.getMessages(a1.id);
      expect(msgs).toHaveLength(1);
      expect(msgs[0].content).toBe('Hello');
    });

    it('should record message with timestamp', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      studio.sendMessage(a1.id, a2.id, 'Hi');
      const msgs = studio.getMessages(a1.id);
      expect(msgs[0].timestamp).toBeDefined();
    });

    it('should fail for unknown sender', () => {
      const a = studio.createAgent('A', 'dev');
      expect(studio.sendMessage('unknown', a.id, 'Hi')).toBe(false);
    });

    it('should fail for unknown receiver', () => {
      const a = studio.createAgent('A', 'dev');
      expect(studio.sendMessage(a.id, 'unknown', 'Hi')).toBe(false);
    });
  });

  // ============================================================
  // getAgentTasks
  // ============================================================
  describe('getAgentTasks', () => {
    it('should return tasks for agent', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T1', status: 'pending', priority: 1 });
      expect(studio.getAgentTasks(agent.id)[0].description).toBe('T1');
    });

    it('should return empty for agent with no tasks', () => {
      const agent = studio.createAgent('A', 'dev');
      expect(studio.getAgentTasks(agent.id)).toHaveLength(0);
    });
  });

  // ============================================================
  // getMessages
  // ============================================================
  describe('getMessages', () => {
    it('should return all messages for agent', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      studio.sendMessage(a1.id, a2.id, 'msg1');
      studio.sendMessage(a2.id, a1.id, 'msg2');
      const msgs = studio.getMessages(a1.id);
      expect(msgs).toHaveLength(2);
    });
  });

  // ============================================================
  // getWorkspaceStats
  // ============================================================
  describe('getWorkspaceStats', () => {
    it('should return correct counts', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      studio.assignTask(a1.id, { description: 'T', status: 'pending', priority: 1 });
      studio.sendMessage(a1.id, a2.id, 'Hi');
      const stats = studio.getWorkspaceStats();
      expect(stats.agentCount).toBe(2);
      expect(stats.taskCount).toBe(1);
      expect(stats.messageCount).toBe(1);
    });

    it('should show zero for empty workspace', () => {
      const stats = studio.getWorkspaceStats();
      expect(stats.agentCount).toBe(0);
      expect(stats.taskCount).toBe(0);
      expect(stats.messageCount).toBe(0);
    });
  });

  // ============================================================
  // getAllAgents / getAllTasks
  // ============================================================
  describe('getAllAgents / getAllTasks', () => {
    it('should return all agents', () => {
      studio.createAgent('A', 'dev');
      studio.createAgent('B', 'dev');
      expect(studio.getAllAgents()).toHaveLength(2);
    });

    it('should return all tasks', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T1', status: 'pending', priority: 1 });
      studio.assignTask(agent.id, { description: 'T2', status: 'pending', priority: 2 });
      expect(studio.getAllTasks()).toHaveLength(2);
    });
  });

  // ============================================================
  // updateTaskStatus
  // ============================================================
  describe('updateTaskStatus', () => {
    it('should update task status', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T', status: 'pending', priority: 1 });
      const taskId = studio.getAgentTasks(agent.id)[0].id;
      studio.updateTaskStatus(taskId, 'completed');
      expect(studio.getTask(taskId)?.status).toBe('completed');
    });

    it('should mark agent idle when task completed', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T', status: 'pending', priority: 1 });
      const taskId = studio.getAgentTasks(agent.id)[0].id;
      studio.updateTaskStatus(taskId, 'completed');
      expect(studio.getAgent(agent.id)?.status).toBe('idle');
    });

    it('should keep agent busy with other tasks', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T1', status: 'pending', priority: 1 });
      studio.assignTask(agent.id, { description: 'T2', status: 'pending', priority: 2 });
      const tasks = studio.getAgentTasks(agent.id);
      studio.updateTaskStatus(tasks[0].id, 'completed');
      expect(studio.getAgent(agent.id)?.status).toBe('busy');
    });

    it('should fail for unknown task', () => {
      expect(studio.updateTaskStatus('unknown', 'completed')).toBe(false);
    });
  });

  // ============================================================
  // removeAgent
  // ============================================================
  describe('removeAgent', () => {
    it('should remove agent', () => {
      const agent = studio.createAgent('A', 'dev');
      expect(studio.removeAgent(agent.id)).toBe(true);
      expect(studio.getAgent(agent.id)).toBeUndefined();
    });

    it('should unassign tasks from removed agent', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T', status: 'pending', priority: 1 });
      studio.removeAgent(agent.id);
      const tasks = studio.getAgentTasks(agent.id);
      expect(tasks).toHaveLength(0);
    });

    it('should return false for unknown agent', () => {
      expect(studio.removeAgent('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getPendingTasks / getInProgressTasks / getCompletedTasks
  // ============================================================
  describe('getPendingTasks / getInProgressTasks / getCompletedTasks', () => {
    it('should filter by status', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T1', status: 'pending', priority: 1 });
      studio.assignTask(agent.id, { description: 'T2', status: 'in_progress', priority: 2 });
      studio.assignTask(agent.id, { description: 'T3', status: 'completed', priority: 3 });
      expect(studio.getPendingTasks()).toHaveLength(1);
      expect(studio.getInProgressTasks()).toHaveLength(1);
      expect(studio.getCompletedTasks()).toHaveLength(1);
    });
  });

  // ============================================================
  // getMessageCount
  // ============================================================
  describe('getMessageCount', () => {
    it('should return count of messages between agents', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      studio.sendMessage(a1.id, a2.id, 'm1');
      studio.sendMessage(a1.id, a2.id, 'm2');
      studio.sendMessage(a2.id, a1.id, 'm3');
      expect(studio.getMessageCount(a1.id, a2.id)).toBe(2);
    });
  });

  // ============================================================
  // getAgentsByRole / getAgentsByStatus
  // ============================================================
  describe('getAgentsByRole / getAgentsByStatus', () => {
    it('should filter by role', () => {
      studio.createAgent('A', 'frontend');
      studio.createAgent('B', 'backend');
      studio.createAgent('C', 'frontend');
      expect(studio.getAgentsByRole('frontend')).toHaveLength(2);
    });

    it('should filter by status', () => {
      const a1 = studio.createAgent('A', 'dev');
      studio.createAgent('B', 'dev');
      studio.assignTask(a1.id, { description: 'T', status: 'pending', priority: 1 });
      expect(studio.getAgentsByStatus('busy')).toHaveLength(1);
      expect(studio.getAgentsByStatus('idle')).toHaveLength(1);
    });
  });

  // ============================================================
  // broadcast
  // ============================================================
  describe('broadcast', () => {
    it('should send message to all other agents', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      const a3 = studio.createAgent('C', 'dev');
      const count = studio.broadcast(a1.id, 'Hello all');
      expect(count).toBe(2);
      expect(studio.getMessages(a2.id)).toHaveLength(1);
      expect(studio.getMessages(a3.id)).toHaveLength(1);
    });
  });

  // ============================================================
  // clearMessages
  // ============================================================
  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      studio.sendMessage(a1.id, a2.id, 'Hi');
      studio.clearMessages();
      expect(studio.getWorkspaceStats().messageCount).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many messages', () => {
      const a1 = studio.createAgent('A', 'dev');
      const a2 = studio.createAgent('B', 'dev');
      for (let i = 0; i < 100; i++) {
        studio.sendMessage(a1.id, a2.id, `msg${i}`);
      }
      expect(studio.getMessageCount(a1.id, a2.id)).toBe(100);
    });

    it('should handle task with high priority', () => {
      const agent = studio.createAgent('A', 'dev');
      studio.assignTask(agent.id, { description: 'T', status: 'pending', priority: 999 });
      expect(studio.getAgentTasks(agent.id)[0].priority).toBe(999);
    });

    it('should allow self-message', () => {
      const agent = studio.createAgent('A', 'dev');
      expect(studio.sendMessage(agent.id, agent.id, 'self')).toBe(true);
    });
  });
});