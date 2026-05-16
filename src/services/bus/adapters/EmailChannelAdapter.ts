/**
 * EmailChannelAdapter (Phase 1 - Stub)
 * V111: Email bot adapter implementing ChannelAdapter interface
 *
 * NOTE: This is a Phase 1 stub implementation.
 * Email channel uses SMTP configuration (host, port, username, password).
 * Phase 2: Full implementation with actual SMTP connection via nodemailer.
 *
 * See: src/plugins/bot-runner/README.md for Phase 2 implementation
 */

import type { Channel, RawMessage, UnifiedMessage } from '../types';
import type { ChannelAdapter } from '../ChannelAdapter';
import { unifiedMessageBus } from '../UnifiedMessageBus';
import { botConfigManager } from '../BotConfigManager';

interface EmailPayload {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  date?: string;
}

export class EmailChannelAdapter implements ChannelAdapter {
  readonly channel: Channel = 'email';
  readonly channelName = 'email';

  private smtpHost: string | null = null;
  private smtpPort: number = 587;
  private smtpUsername: string | null = null;
  private smtpPassword: string | null = null;
  private _initialized = false;

  // Bus subscription cleanup functions
  private busUnsubscribe: (() => void) | null = null;
  private configUnsubscribe: (() => void) | null = null;

  /**
   * Initialize the adapter with SMTP configuration
   * Token format for backward compatibility: "host:port:username:password"
   * Or use botConfigManager's separate fields (emailSmtpHost, emailSmtpPort, etc.)
   */
  initialize(token: string): void {
    // Parse token in backward-compatible format: "host:port:username:password"
    const parts = token.split(':');
    if (parts.length >= 4) {
      this.smtpHost = parts[0];
      this.smtpPort = parseInt(parts[1], 10) || 587;
      this.smtpUsername = parts[2];
      this.smtpPassword = parts.slice(3).join(':'); // password may contain colons
    } else {
      console.warn('[EmailChannelAdapter] Token should be in format "host:port:username:password"');
    }
    console.log(`[EmailChannelAdapter] SMTP config set. Call start() to initialize.`);
  }

  /**
   * Start the adapter - initialize SMTP connection and subscribe to bus events
   * Phase 1: Stub implementation (no actual SMTP connection)
   */
  async start(): Promise<void> {
    if (!this.smtpHost || !this.smtpUsername || !this.smtpPassword) {
      console.warn('[EmailChannelAdapter] SMTP not fully configured - cannot start');
      return;
    }

    console.log(`[EmailChannelAdapter] Starting (Phase 1 stub - no actual SMTP connection)`);

    // Subscribe to bus events
    this.busUnsubscribe = unifiedMessageBus.subscribe((msg) => {
      if (msg.direction === 'inbound' && msg.channel === 'email') {
        // Message received from email
      }
    });

    // Subscribe to config changes
    this.configUnsubscribe = botConfigManager.subscribe((newConfig) => {
      const cfg = newConfig.email;
      if (cfg.enabled) {
        if (cfg.token) {
          // Re-parse token if changed
          const parts = cfg.token.split(':');
          if (parts.length >= 4) {
            this.smtpHost = parts[0];
            this.smtpPort = parseInt(parts[1], 10) || 587;
            this.smtpUsername = parts[2];
            this.smtpPassword = parts.slice(3).join(':');
          }
        }
      }
    });

    this._initialized = true;
    console.log(`[EmailChannelAdapter] Started and listening for messages`);
  }

  /**
   * Stop the adapter and cleanup subscriptions
   */
  async stop(): Promise<void> {
    if (this.busUnsubscribe) {
      this.busUnsubscribe();
      this.busUnsubscribe = null;
    }

    if (this.configUnsubscribe) {
      this.configUnsubscribe();
      this.configUnsubscribe = null;
    }

    this._initialized = false;
    console.log(`[EmailChannelAdapter] Stopped`);
  }

  /**
   * Convert Email message to RawMessage format
   * Input format: Email webhook payload (from external email service like SendGrid, Mailgun)
   */
  toAgentFormat(raw: unknown): RawMessage | null {
    if (!raw || typeof raw !== 'object') return null;

    const email = raw as EmailPayload;
    if (!email.from || !email.text) return null;

    // Extract email address from "Name <email@example.com>" format
    const fromMatch = email.from.match(/<?([^>\s]+)>?/);
    const fromEmail = fromMatch ? fromMatch[1] : email.from;

    return {
      channel: 'email',
      userId: fromEmail,
      channelUserId: email.to || 'unknown',
      content: email.text || '',
      timestamp: email.date ? new Date(email.date).getTime() : Date.now(),
      metadata: {
        subject: email.subject,
        from: email.from,
        to: email.to,
      },
    };
  }

  /**
   * Convert agent response to Email format
   * Returns payload for email sending API
   */
  fromAgentResponse(msg: UnifiedMessage, response: string): unknown {
    return {
      to: msg.channelUserId,
      subject: 'Re: Your message',
      text: response,
    };
  }

  /**
   * Send email
   * Phase 1: Stub implementation - logs to console
   */
  async send(target: unknown, content: string): Promise<void> {
    if (!this.smtpHost) {
      console.warn('[EmailChannelAdapter] SMTP not configured');
      return;
    }

    const payload = target as { to?: string; subject?: string };
    if (!payload.to) {
      console.warn('[EmailChannelAdapter] No recipient provided');
      return;
    }

    // Phase 1 stub - just log
    console.log(`[EmailChannelAdapter] Would send to ${payload.to}${payload.subject ? ` (${payload.subject})` : ''}: ${content.substring(0, 50)}...`);
  }

  /**
   * Check if adapter is initialized and ready
   */
  isReady(): boolean {
    return this._initialized && this.smtpHost !== null && this.smtpUsername !== null && this.smtpPassword !== null;
  }
}

// Singleton instance for bus registration
export const emailChannelAdapter = new EmailChannelAdapter();