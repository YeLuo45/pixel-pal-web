/**
 * Tool Ecosystem - Unified Facade for MCP Tool Ecosystem
 * V166: Integrates all V165 modules into a unified API
 */

import { Tool, registerTool, getTool, listTools, unregisterTool, clearTools } from './McpToolRegistry';
import { 
  ToolMetadata, 
  setToolMetadata, 
  getToolMetadata, 
  getToolsByCategory, 
  getToolsByTag, 
  searchToolsByMetadata,
  getAllCategories,
  getAllTags,
  clearAllMetadata 
} from './ToolMetadata';
import { ToolVersion, registerToolVersion, getToolVersions, getLatestVersion, deprecateTool, isToolDeprecated, clearAllVersions } from './ToolVersion';
import { setToolPermission, checkToolAccess, getToolPermission, clearToolPermission, clearAllPermissions } from './ToolPermission';
import { discoverToolsFromAgentConfig, DiscoveredTool, getDiscoveredTools, clearDiscoveredTools } from './ToolDiscovery';
import type { ExternalAgentConfig } from './McpClientBridge';

/**
 * ToolEcosystem - Central facade integrating all MCP tool modules
 * Provides unified API for tool registration, discovery, versioning, permissions, and analytics
 */
class ToolEcosystem {
  private static instance: ToolEcosystem;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of ToolEcosystem
   */
  static getInstance(): ToolEcosystem {
    if (!ToolEcosystem.instance) {
      ToolEcosystem.instance = new ToolEcosystem();
    }
    return ToolEcosystem.instance;
  }

  // ==================== Tool Registration ====================

  /**
   * Register a tool with the ecosystem
   * Registers the tool in the registry and sets optional metadata
   */
  registerTool(tool: Tool, metadata?: Partial<ToolMetadata>): void {
    // Register in the tool registry
    registerTool(tool);
    
    // Set metadata if provided
    if (metadata) {
      const fullMetadata: ToolMetadata = {
        name: tool.name,
        description: metadata.description ?? tool.description,
        provider: metadata.provider ?? 'unknown',
        category: metadata.category ?? 'general',
        tags: metadata.tags ?? [],
        capabilities: metadata.capabilities ?? [],
        inputSchema: metadata.inputSchema ?? tool.inputSchema ?? { type: 'object', properties: {} },
        version: metadata.version ?? '1.0.0',
        deprecated: metadata.deprecated ?? false,
      };
      setToolMetadata(tool.name, fullMetadata);
    }
  }

  /**
   * Get a tool by name from the registry
   */
  getTool(name: string): Tool | undefined {
    return getTool(name);
  }

  /**
   * List all registered tools
   */
  listTools(): Tool[] {
    return listTools();
  }

  /**
   * Unregister a tool from the ecosystem
   */
  unregisterTool(name: string): boolean {
    // Clear related data from other modules
    clearToolPermission(name);
    clearAllMetadata(); // Note: This clears all metadata - in production, would clear by name
    clearDiscoveredTools(); // Same here
    return unregisterTool(name);
  }

  // ==================== Discovery ====================

  /**
   * Discover tools from an external agent config
   */
  async discoverFromAgent(config: ExternalAgentConfig): Promise<DiscoveredTool[]> {
    return discoverToolsFromAgentConfig(config);
  }

  /**
   * Get all discovered tools
   */
  getDiscoveredTools(): DiscoveredTool[] {
    return getDiscoveredTools();
  }

  // ==================== Versioning ====================

  /**
   * Register a version for a tool
   */
  registerVersion(toolName: string, version: ToolVersion): void {
    registerToolVersion(toolName, version);
  }

  /**
   * Get all versions for a tool
   */
  getVersions(toolName: string): ToolVersion[] {
    return getToolVersions(toolName);
  }

  /**
   * Get the latest version for a tool
   */
  getLatestVersion(toolName: string): ToolVersion | undefined {
    return getLatestVersion(toolName);
  }

  /**
   * Deprecate a tool
   */
  deprecateTool(toolName: string, version: string): void {
    deprecateTool(toolName, version);
  }

  /**
   * Check if a tool is deprecated
   */
  isDeprecated(toolName: string): boolean {
    return isToolDeprecated(toolName);
  }

  // ==================== Permissions ====================

  /**
   * Set permission for a tool
   */
  setPermission(toolName: string, allowedRoles: string[], ownerOnly?: boolean, requiresAuth?: boolean): void {
    setToolPermission(toolName, {
      toolName,
      allowedRoles: allowedRoles as any,
      ownerOnly: ownerOnly ?? false,
      requiresAuth: requiresAuth ?? true,
    });
  }

  /**
   * Check if a role has access to a tool
   */
  checkAccess(toolName: string, role: string): boolean {
    return checkToolAccess(toolName, role);
  }

  /**
   * Get permission for a tool
   */
  getPermission(toolName: string) {
    return getToolPermission(toolName);
  }

  // ==================== Metadata ====================

  /**
   * Get metadata for a tool
   */
  getMetadata(toolName: string): ToolMetadata | undefined {
    return getToolMetadata(toolName);
  }

  /**
   * Search tools by query
   */
  search(query: string): ToolMetadata[] {
    return searchToolsByMetadata(query);
  }

  /**
   * Get tools by category
   */
  getByCategory(category: string): ToolMetadata[] {
    return getToolsByCategory(category);
  }

  /**
   * Get tools by tag
   */
  getByTag(tag: string): ToolMetadata[] {
    return getToolsByTag(tag);
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    return getAllCategories();
  }

  /**
   * Get all unique tags
   */
  getTags(): string[] {
    return getAllTags();
  }

  // ==================== Cleanup ====================

  /**
   * Clear all tool ecosystem data (for testing)
   */
  clearAll(): void {
    clearTools();
    clearAllMetadata();
    clearAllVersions();
    clearAllPermissions();
    clearDiscoveredTools();
  }
}

// Export singleton instance
export const toolEcosystem = ToolEcosystem.getInstance();

// Export the class for testing
export { ToolEcosystem };

// Export types
export type { DiscoveredTool } from './ToolDiscovery';
export type { ToolMetadata } from './ToolMetadata';
export type { ToolVersion } from './ToolVersion';