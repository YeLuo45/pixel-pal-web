/**
 * Notification Engine
 * chatdev-design Notification Engine - Send + Read + Dismiss + Stats
 */

export type NotificationType = 'alert' | 'info' | 'reminder' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  message: string;
  read: boolean;
  dismissed: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface NteStats {
  notifications: number;
  totalSent: number;
  totalRead: number;
  totalDismissed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueRecipients: number;
  alert: number;
  info: number;
  reminder: number;
  system: number;
  read: number;
  unread: number;
  dismissed: number;
  pending: number;
}

export class NotificationEngine {
  private notifications: Map<string, Notification> = new Map();
  private counter = 0;
  private totalSent = 0;
  private totalRead = 0;
  private totalDismissed = 0;

  send(type: NotificationType, recipient: string, message: string): string {
    const id = `nte-${++this.counter}`;
    this.notifications.set(id, {
      id,
      type,
      recipient,
      message,
      read: false,
      dismissed: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSent++;
    return id;
  }

  read(id: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    if (n.read) return false;
    n.read = true;
    n.updated = Date.now();
    n.hits++;
    this.totalRead++;
    return true;
  }

  dismiss(id: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.dismissed = true;
    n.updated = Date.now();
    n.hits++;
    this.totalDismissed++;
    return true;
  }

  remove(id: string): boolean {
    return this.notifications.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setMessage(id: string, message: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.message = message;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.notifications.values()) {
      n.read = false;
      n.dismissed = false;
      n.active = true;
      n.hits = 0;
    }
    this.totalSent = 0;
    this.totalRead = 0;
    this.totalDismissed = 0;
  }

  getStats(): NteStats {
    const all = Array.from(this.notifications.values());
    return {
      notifications: all.length,
      totalSent: this.totalSent,
      totalRead: this.totalRead,
      totalDismissed: this.totalDismissed,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      uniqueRecipients: new Set(all.map(n => n.recipient)).size,
      alert: all.filter(n => n.type === 'alert').length,
      info: all.filter(n => n.type === 'info').length,
      reminder: all.filter(n => n.type === 'reminder').length,
      system: all.filter(n => n.type === 'system').length,
      read: all.filter(n => n.read).length,
      unread: all.filter(n => !n.read).length,
      dismissed: all.filter(n => n.dismissed).length,
      pending: all.filter(n => !n.read && !n.dismissed).length,
    };
  }

  getNotification(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  getAllNotifications(): Notification[] {
    return Array.from(this.notifications.values());
  }

  hasNotification(id: string): boolean {
    return this.notifications.has(id);
  }

  getCount(): number {
    return this.notifications.size;
  }

  getType(id: string): NotificationType | undefined {
    return this.notifications.get(id)?.type;
  }

  getRecipient(id: string): string | undefined {
    return this.notifications.get(id)?.recipient;
  }

  getMessage(id: string): string | undefined {
    return this.notifications.get(id)?.message;
  }

  getHits(id: string): number {
    return this.notifications.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.notifications.get(id)?.active ?? false;
  }

  isRead(id: string): boolean {
    return this.notifications.get(id)?.read ?? false;
  }

  isDismissed(id: string): boolean {
    return this.notifications.get(id)?.dismissed ?? false;
  }

  getByType(type: NotificationType): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.type === type);
  }

  getByRecipient(recipient: string): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.recipient === recipient);
  }

  getReadNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.read);
  }

  getUnreadNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => !n.read);
  }

  getDismissedNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.dismissed);
  }

  getActiveNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.active);
  }

  getInactiveNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => !n.active);
  }

  getAllRecipients(): string[] {
    return [...new Set(Array.from(this.notifications.values()).map(n => n.recipient))];
  }

  getNewest(): Notification | null {
    const all = Array.from(this.notifications.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): Notification | null {
    const all = Array.from(this.notifications.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.notifications.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.notifications.get(id)?.updated ?? 0;
  }

  getTotalSent(): number {
    return this.totalSent;
  }

  getTotalRead(): number {
    return this.totalRead;
  }

  getTotalDismissed(): number {
    return this.totalDismissed;
  }

  clearAll(): void {
    this.notifications.clear();
    this.counter = 0;
    this.totalSent = 0;
    this.totalRead = 0;
    this.totalDismissed = 0;
  }
}

export default NotificationEngine;