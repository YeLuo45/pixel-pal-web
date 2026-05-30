/**
 * ToolEcosystem Tests
 * V166: Tests for the unified facade
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToolEcosystem, toolEcosystem } from '../ToolEcosystem';
import { Tool } from '../McpToolRegistry';
import { ExternalAgentConfig } from '../McpClientBridge';

// Mock the modules that ToolEcosystem depends on
// Since we're testing the integration, we import the actual modules

describe('ToolEcosystem', () => {
  let ecosystem: ToolEcosystem;

  beforeEach(() => {
    // Get fresh instance and clear all data
    ecosystem = ToolEcosystem.getInstance();
    ecosystem.clearAll();
  });

  afterEach(() => {
    ecosystem.clearAll();
  });

  describe('registerTool', () => {
    it('should register a tool with minimal metadata', () => {
      const tool: Tool = {
        name: 'testTool',
        type: 'skill',
        description: 'A test tool',
      };

      ecosystem.registerTool(tool);

      const retrieved = ecosystem.getTool('testTool');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('testTool');
    });

    it('should register a tool with full metadata', () => {
      const tool: Tool = {
        name: 'fullTool',
        type: 'skill',
        description: 'A fully configured tool',
      };

      ecosystem.registerTool(tool, {
        provider: 'test-provider',
        category: 'testing',
        tags: ['test', 'unit'],
        capabilities: ['cap1', 'cap2'],
        version: '2.0.0',
      });

      const metadata = ecosystem.getMetadata('fullTool');
      expect(metadata).toBeDefined();
      expect(metadata?.provider).toBe('test-provider');
      expect(metadata?.category).toBe('testing');
      expect(metadata?.tags).toEqual(['test', 'unit']);
      expect(metadata?.capabilities).toEqual(['cap1', 'cap2']);
      expect(metadata?.version).toBe('2.0.0');
    });

    it('should use tool description as default metadata description', () => {
      const tool: Tool = {
        name: 'descTool',
        type: 'role',
        description: 'Tool description',
      };

      ecosystem.registerTool(tool);

      const metadata = ecosystem.getMetadata('descTool');
      expect(metadata?.description).toBe('Tool description');
    });

    it('should default category to general if not provided', () => {
      const tool: Tool = {
        name: 'categoryTool',
        type: 'skill',
        description: 'Test',
      };

      ecosystem.registerTool(tool);

      const metadata = ecosystem.getMetadata('categoryTool');
      expect(metadata?.category).toBe('general');
    });
  });

  describe('getTool', () => {
    it('should retrieve a registered tool', () => {
      const tool: Tool = {
        name: 'getTest',
        type: 'memory',
        description: 'Test tool for get',
      };

      ecosystem.registerTool(tool);

      const result = ecosystem.getTool('getTest');
      expect(result).toBeDefined();
      expect(result?.name).toBe('getTest');
      expect(result?.type).toBe('memory');
    });

    it('should return undefined for non-existent tool', () => {
      const result = ecosystem.getTool('nonExistent');
      expect(result).toBeUndefined();
    });
  });

  describe('listTools', () => {
    it('should list all registered tools', () => {
      ecosystem.registerTool({ name: 'tool1', type: 'skill', description: 'Tool 1' });
      ecosystem.registerTool({ name: 'tool2', type: 'role', description: 'Tool 2' });
      ecosystem.registerTool({ name: 'tool3', type: 'persona', description: 'Tool 3' });

      const tools = ecosystem.listTools();
      expect(tools.length).toBe(3);
    });

    it('should return empty array when no tools registered', () => {
      const tools = ecosystem.listTools();
      expect(tools).toEqual([]);
    });
  });

  describe('unregisterTool', () => {
    it('should unregister a tool', () => {
      ecosystem.registerTool({ name: 'unregTool', type: 'skill', description: 'To unregister' });

      const result = ecosystem.unregisterTool('unregTool');
      expect(result).toBe(true);

      const tool = ecosystem.getTool('unregTool');
      expect(tool).toBeUndefined();
    });

    it('should return false for non-existent tool', () => {
      const result = ecosystem.unregisterTool('nonExistent');
      expect(result).toBe(false);
    });
  });

  describe('discoverFromAgent', () => {
    it('should discover tools from a disabled agent', async () => {
      const config: ExternalAgentConfig = {
        id: 'agent1',
        name: 'TestAgent',
        endpoint: 'http://localhost:3000',
        enabled: false,
        createdAt: new Date().toISOString(),
      };

      const tools = await ecosystem.discoverFromAgent(config);
      expect(tools).toEqual([]);
    });

    it('should discover tools from an enabled agent', async () => {
      const config: ExternalAgentConfig = {
        id: 'agent2',
        name: 'EnabledAgent',
        endpoint: 'http://localhost:3000',
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      const tools = await ecosystem.discoverFromAgent(config);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('getDiscoveredTools', () => {
    it('should return empty array initially', () => {
      const tools = ecosystem.getDiscoveredTools();
      expect(tools).toEqual([]);
    });

    it('should return discovered tools after discovery', async () => {
      const config: ExternalAgentConfig = {
        id: 'agent3',
        name: 'DiscoveryAgent',
        endpoint: 'http://localhost:3000',
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      await ecosystem.discoverFromAgent(config);
      const tools = ecosystem.getDiscoveredTools();
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('registerVersion', () => {
    it('should register a version for a tool', () => {
      ecosystem.registerVersion('versionedTool', {
        version: '1.0.0',
        changelog: 'Initial release',
        deprecated: false,
        releasedAt: '2024-01-01',
      });

      const versions = ecosystem.getVersions('versionedTool');
      expect(versions.length).toBe(1);
      expect(versions[0].version).toBe('1.0.0');
    });

    it('should store multiple versions', () => {
      ecosystem.registerVersion('multiVersion', {
        version: '1.0.0',
        changelog: 'Initial',
        deprecated: false,
        releasedAt: '2024-01-01',
      });

      ecosystem.registerVersion('multiVersion', {
        version: '2.0.0',
        changelog: 'Major update',
        deprecated: false,
        releasedAt: '2024-06-01',
      });

      const versions = ecosystem.getVersions('multiVersion');
      expect(versions.length).toBe(2);
    });
  });

  describe('getVersions', () => {
    it('should return empty array for tool with no versions', () => {
      const versions = ecosystem.getVersions('noVersion');
      expect(versions).toEqual([]);
    });
  });

  describe('getLatestVersion', () => {
    it('should return the latest version', () => {
      ecosystem.registerVersion('latestTest', {
        version: '1.0.0',
        changelog: 'Initial',
        deprecated: false,
        releasedAt: '2024-01-01',
      });

      ecosystem.registerVersion('latestTest', {
        version: '2.0.0',
        changelog: 'Newer',
        deprecated: false,
        releasedAt: '2024-06-01',
      });

      const latest = ecosystem.getLatestVersion('latestTest');
      expect(latest?.version).toBe('2.0.0');
    });

    it('should return undefined for tool with no versions', () => {
      const latest = ecosystem.getLatestVersion('noVersion');
      expect(latest).toBeUndefined();
    });
  });

  describe('deprecateTool', () => {
    it('should deprecate a tool', () => {
      ecosystem.deprecateTool('deprecatedTool', '1.0.0');

      expect(ecosystem.isDeprecated('deprecatedTool')).toBe(true);
    });
  });

  describe('isDeprecated', () => {
    it('should return false for non-deprecated tool', () => {
      expect(ecosystem.isDeprecated('notDeprecated')).toBe(false);
    });
  });

  describe('setPermission', () => {
    it('should set permission for a tool', () => {
      ecosystem.setPermission('permTool', ['admin', 'agent'], false, true);

      expect(ecosystem.checkAccess('permTool', 'admin')).toBe(true);
      expect(ecosystem.checkAccess('permTool', 'agent')).toBe(true);
      expect(ecosystem.checkAccess('permTool', 'user')).toBe(false);
    });

    it('should handle ownerOnly permission', () => {
      ecosystem.setPermission('ownerTool', ['admin'], true, true);

      expect(ecosystem.checkAccess('ownerTool', 'admin')).toBe(false);
    });
  });

  describe('checkAccess', () => {
    it('should return false for non-existent tool', () => {
      expect(ecosystem.checkAccess('nonExistent', 'admin')).toBe(false);
    });

    it('should grant access when requiresAuth is false', () => {
      ecosystem.setPermission('noAuthTool', ['admin'], false, false);

      expect(ecosystem.checkAccess('noAuthTool', 'admin')).toBe(true);
      expect(ecosystem.checkAccess('noAuthTool', 'user')).toBe(true);
    });
  });

  describe('getPermission', () => {
    it('should return permission for a tool', () => {
      ecosystem.setPermission('getPermTool', ['admin'], false, true);

      const perm = ecosystem.getPermission('getPermTool');
      expect(perm).toBeDefined();
      expect(perm?.allowedRoles).toContain('admin');
    });

    it('should return undefined for non-existent tool', () => {
      const perm = ecosystem.getPermission('nonExistent');
      expect(perm).toBeUndefined();
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for a registered tool', () => {
      ecosystem.registerTool(
        { name: 'metaTool', type: 'skill', description: 'Test' },
        { provider: 'metaProvider', category: 'metaCategory' }
      );

      const metadata = ecosystem.getMetadata('metaTool');
      expect(metadata).toBeDefined();
      expect(metadata?.provider).toBe('metaProvider');
      expect(metadata?.category).toBe('metaCategory');
    });

    it('should return undefined for non-existent tool', () => {
      const metadata = ecosystem.getMetadata('nonExistent');
      expect(metadata).toBeUndefined();
    });
  });

  describe('search', () => {
    it('should find tools by name', () => {
      ecosystem.registerTool(
        { name: 'searchTestTool', type: 'skill', description: 'Test' },
        { provider: 'searchProvider' }
      );

      const results = ecosystem.search('searchTest');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'searchTestTool')).toBe(true);
    });

    it('should find tools by provider', () => {
      ecosystem.registerTool(
        { name: 'providerTool', type: 'skill', description: 'Test' },
        { provider: 'uniqueProvider123' }
      );

      const results = ecosystem.search('uniqueProvider123');
      expect(results.some(r => r.provider === 'uniqueProvider123')).toBe(true);
    });

    it('should find tools by tag', () => {
      ecosystem.registerTool(
        { name: 'tagTool', type: 'skill', description: 'Test' },
        { tags: ['specialTag'] }
      );

      const results = ecosystem.search('specialTag');
      expect(results.some(r => r.tags.includes('specialTag'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = ecosystem.search('nonExistentQuery');
      expect(results).toEqual([]);
    });
  });

  describe('getByCategory', () => {
    it('should return tools in a category', () => {
      ecosystem.registerTool({ name: 'catTool1', type: 'skill', description: 'Test' }, { category: 'testing' });
      ecosystem.registerTool({ name: 'catTool2', type: 'skill', description: 'Test' }, { category: 'testing' });
      ecosystem.registerTool({ name: 'catTool3', type: 'skill', description: 'Test' }, { category: 'other' });

      const results = ecosystem.getByCategory('testing');
      expect(results.length).toBe(2);
    });

    it('should be case insensitive', () => {
      ecosystem.registerTool({ name: 'caseTool', type: 'skill', description: 'Test' }, { category: 'Testing' });

      const results = ecosystem.getByCategory('TESTING');
      expect(results.length).toBe(1);
    });
  });

  describe('getByTag', () => {
    it('should return tools with a tag', () => {
      ecosystem.registerTool({ name: 'tagTool1', type: 'skill', description: 'Test' }, { tags: ['tag1'] });
      ecosystem.registerTool({ name: 'tagTool2', type: 'skill', description: 'Test' }, { tags: ['tag1', 'tag2'] });

      const results = ecosystem.getByTag('tag1');
      expect(results.length).toBe(2);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', () => {
      ecosystem.registerTool({ name: 'cat1', type: 'skill', description: 'Test' }, { category: 'cat1' });
      ecosystem.registerTool({ name: 'cat2', type: 'skill', description: 'Test' }, { category: 'cat1' });
      ecosystem.registerTool({ name: 'cat3', type: 'skill', description: 'Test' }, { category: 'cat2' });

      const categories = ecosystem.getCategories();
      expect(categories.sort()).toEqual(['cat1', 'cat2']);
    });

    it('should return empty array when no tools registered', () => {
      const categories = ecosystem.getCategories();
      expect(categories).toEqual([]);
    });
  });

  describe('getTags', () => {
    it('should return unique tags', () => {
      ecosystem.registerTool({ name: 'tag1', type: 'skill', description: 'Test' }, { tags: ['tagA'] });
      ecosystem.registerTool({ name: 'tag2', type: 'skill', description: 'Test' }, { tags: ['tagA', 'tagB'] });
      ecosystem.registerTool({ name: 'tag3', type: 'skill', description: 'Test' }, { tags: ['tagB', 'tagC'] });

      const tags = ecosystem.getTags();
      expect(tags.sort()).toEqual(['tagA', 'tagB', 'tagC']);
    });
  });

  describe('clearAll', () => {
    it('should clear all ecosystem data', () => {
      ecosystem.registerTool({ name: 'clearTool', type: 'skill', description: 'Test' });
      ecosystem.setPermission('clearTool', ['admin'], false, true);
      ecosystem.registerVersion('clearTool', {
        version: '1.0.0',
        changelog: 'Test',
        deprecated: false,
        releasedAt: '2024-01-01',
      });

      ecosystem.clearAll();

      expect(ecosystem.listTools()).toEqual([]);
      expect(ecosystem.getMetadata('clearTool')).toBeUndefined();
      expect(ecosystem.getVersions('clearTool')).toEqual([]);
    });
  });

  describe('singleton', () => {
    it('should return the same instance', () => {
      const instance1 = ToolEcosystem.getInstance();
      const instance2 = ToolEcosystem.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should return the exported singleton instance', () => {
      expect(toolEcosystem).toBeDefined();
      expect(toolEcosystem).toBeInstanceOf(ToolEcosystem);
    });
  });
});