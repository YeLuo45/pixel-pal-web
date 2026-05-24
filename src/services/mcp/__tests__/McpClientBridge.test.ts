/**
 * McpClientBridge Tests - V164
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McpClientBridge, useMcpClientStore, getMcpClientBridge } from '../McpClientBridge';
import type { ExternalAgentConfig } from '../McpClientBridge';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('McpClientBridge', () => {
  let bridge: McpClientBridge;

  beforeEach(() => {
    // Reset store
    useMcpClientStore.setState({
      agents: [],
      connectionStatus: {},
      availableTools: {},
    });
    bridge = new McpClientBridge();
    mockFetch.mockReset();
  });

  describe('addAgent', () => {
    it('should add a new agent configuration', () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({
        name: 'Test Agent',
        endpoint: 'http://localhost:9000',
        enabled: true,
      });

      expect(agentId).toMatch(/^agent_/);
      const agents = useMcpClientStore.getState().agents;
      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('Test Agent');
      expect(agents[0].endpoint).toBe('http://localhost:9000');
    });

    it('should generate unique IDs for each agent', () => {
      const store = useMcpClientStore.getState();
      const id1 = store.addAgent({ name: 'Agent 1', endpoint: 'http://a1', enabled: true });
      const id2 = store.addAgent({ name: 'Agent 2', endpoint: 'http://a2', enabled: true });

      expect(id1).not.toBe(id2);
    });

    it('should initialize connection status as disconnected', () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });
      expect(store.connectionStatus[agentId]).toBe('disconnected');
    });
  });

  describe('removeAgent', () => {
    it('should remove an agent by ID', () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });
      store.removeAgent(agentId);

      expect(store.agents).toHaveLength(0);
    });

    it('should clean up connection status on removal', () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });
      store.setConnectionStatus(agentId, 'connected');
      store.removeAgent(agentId);

      expect(store.connectionStatus[agentId]).toBeUndefined();
    });
  });

  describe('updateAgent', () => {
    it('should update agent properties', () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Original', endpoint: 'http://test', enabled: true });
      store.updateAgent(agentId, { name: 'Updated', enabled: false });

      const agent = store.getAgent(agentId);
      expect(agent?.name).toBe('Updated');
      expect(agent?.enabled).toBe(false);
    });
  });

  describe('connect', () => {
    it('should set status to connecting then connected on success', async () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tools: [{ name: 'tool1', description: 'A tool' }] }),
      });

      await bridge.connect(agentId);

      expect(store.connectionStatus[agentId]).toBe('connected');
      expect(store.availableTools[agentId]).toHaveLength(1);
      expect(store.availableTools[agentId][0].name).toBe('tool1');
    });

    it('should set status to error on connection failure', async () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(bridge.connect(agentId)).rejects.toThrow('Network error');
      expect(store.connectionStatus[agentId]).toBe('error');
    });

    it('should throw if agent not found', async () => {
      await expect(bridge.connect('nonexistent')).rejects.toThrow('Agent nonexistent not found');
    });
  });

  describe('disconnect', () => {
    it('should set status to disconnected and clear tools', async () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });
      store.setConnectionStatus(agentId, 'connected');
      store.setAvailableTools(agentId, [{ name: 'tool1', description: 'A tool' }]);

      await bridge.disconnect(agentId);

      expect(store.connectionStatus[agentId]).toBe('disconnected');
      expect(store.availableTools[agentId]).toEqual([]);
    });
  });

  describe('callTool', () => {
    it('should throw if agent is not connected', async () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });
      store.setConnectionStatus(agentId, 'disconnected');

      await expect(bridge.callTool(agentId, 'test_tool', {})).rejects.toThrow('not connected');
    });

    it('should call tool and return result on success', async () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });
      store.setConnectionStatus(agentId, 'connected');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: { success: true } }),
      });

      const result = await bridge.callTool(agentId, 'test_tool', { arg: 'value' });
      expect(result.success).toBe(true);
    });

    it('should return error on tool call failure', async () => {
      const store = useMcpClientStore.getState();
      const agentId = store.addAgent({ name: 'Test', endpoint: 'http://test', enabled: true });
      store.setConnectionStatus(agentId, 'connected');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const result = await bridge.callTool(agentId, 'test_tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });
  });

  describe('singleton', () => {
    it('should return the same instance on multiple calls', () => {
      const bridge1 = getMcpClientBridge();
      const bridge2 = getMcpClientBridge();
      expect(bridge1).toBe(bridge2);
    });
  });
});