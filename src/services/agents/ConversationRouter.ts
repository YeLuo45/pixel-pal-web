/**
 * ConversationRouter - Routes messages to appropriate agents based on content
 * Based on chatdev Multi-Agent Orchestration
 */

import { AgentRole } from './AgentRoleRegistry';
import { RoleSwitcher } from './RoleSwitcher';

export interface RoutedMessage {
  original: string;
  routedRole: AgentRole;
  timestamp: number;
  routeReason: string;
}

/**
 * ConversationRouter manages message routing and history
 */
export class ConversationRouter {
  private history: RoutedMessage[] = [];
  private switcher: RoleSwitcher;

  constructor(switcher: RoleSwitcher) {
    this.switcher = switcher;
  }

  /**
   * Route a message to the appropriate role
   */
  route(message: string, forceRole?: AgentRole): RoutedMessage {
    const timestamp = Date.now();
    let routedRole: AgentRole;
    let routeReason: string;

    if (forceRole) {
      routedRole = forceRole;
      routeReason = 'forced';
    } else {
      routedRole = this.switcher.route(message);
      routeReason = 'keyword_match';
    }

    const routedMessage: RoutedMessage = {
      original: message,
      routedRole,
      timestamp,
      routeReason,
    };

    this.history.push(routedMessage);
    return routedMessage;
  }

  /**
   * Get routing history, optionally filtered by role
   */
  getHistory(role?: AgentRole): RoutedMessage[] {
    if (role) {
      return this.history.filter(msg => msg.routedRole === role);
    }
    return [...this.history];
  }

  /**
   * Clear routing history
   */
  clearHistory(): void {
    this.history = [];
  }
}