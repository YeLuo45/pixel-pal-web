/**
 * Notification Manager
 * chatdev-design Notification Manager - Send + MarkRead + GetUnread + Stats
 */

export interface Notification {
  id: string;
  recipient: string;
  message: string;
  read: boolean;
  sent: number;
  created: number;
  updated: number;
  active: boolean;
  priority: number;
  history: number[];
}

export interface NMStats {
  notifications: number;
  read: number;
  unread: number;
  active: number;
  inactive: number;
  recipients: number;
  avgPriority: number;
  readRate: number;
}

export class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private counter = 0;

  send(recipient: string, message: string, priority: number = 0): string {
    const id = `nm-${++this.counter}`;
    this.notifications.set(id, {
      id,
      recipient,
      message,
      read: false,
      sent: Date.now(),
      created: Date.now(),
      updated: Date.now(),
      active: true,
      priority,
      history: [Date.now()],
    });
    return id;
  }

  markRead(id: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.read = true;
    n.updated = Date.now();
    n.history.push(Date.now());
    return true;
  }

  markUnread(id: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.read = false;
    n.updated = Date.now();
    return true;
  }

  getUnread(recipient: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.recipient === recipient && !n.read && n.active)
      .sort((a, b) => b.priority - a.priority);
  }

  getAll(recipient: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.recipient === recipient)
      .sort((a, b) => b.sent - a.sent);
  }

  getRead(recipient: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.recipient === recipient && n.read);
  }

  getStats(): NMStats {
    const all = Array.from(this.notifications.values());
    return {
      notifications: all.length,
      read: all.filter(n => n.read).length,
      unread: all.filter(n => !n.read).length,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      recipients: new Set(all.map(n => n.recipient)).size,
      avgPriority: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.priority, 0) / all.length) * 100) / 100 : 0,
      readRate: all.length > 0 ? Math.round((all.filter(n => n.read).length / all.length) * 100) / 100 : 0,
    };
  }

  getNotification(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  getAllNotifications(): Notification[] {
    return Array.from(this.notifications.values());
  }

  removeNotification(id: string): boolean {
    return this.notifications.delete(id);
  }

  hasNotification(id: string): boolean {
    return this.notifications.has(id);
  }

  getCount(): number {
    return this.notifications.size;
  }

  getRecipient(id: string): string | undefined {
    return this.notifications.get(id)?.recipient;
  }

  getMessage(id: string): string | undefined {
    return this.notifications.get(id)?.message;
  }

  getPriority(id: string): number {
    return this.notifications.get(id)?.priority ?? 0;
  }

  getSentAt(id: string): number {
    return this.notifications.get(id)?.sent ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.notifications.get(id)?.history ?? [])];
  }

  isRead(id: string): boolean {
    return this.notifications.get(id)?.read ?? false;
  }

  isActive(id: string): boolean {
    return this.notifications.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setRecipient(id: string, recipient: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.recipient = recipient;
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

  setPriority(id: string, priority: number): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.priority = priority;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.notifications.values()) {
      n.read = false;
      n.active = true;
      n.history = [n.sent];
    }
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

  getActiveNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.active);
  }

  getInactiveNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => !n.active);
  }

  getAllRecipients(): string[] {
    return [...new Set(Array.from(this.notifications.values()).map(n => n.recipient))];
  }

  getRecipientCount(): number {
    return this.getAllRecipients().length;
  }

  getUnreadCount(recipient: string): number {
    return this.getUnread(recipient).length;
  }

  getReadCount(recipient: string): number {
    return this.getRead(recipient).length;
  }

  getTotalForRecipient(recipient: string): number {
    return this.getByRecipient(recipient).length;
  }

  markAllRead(recipient: string): number {
    const unread = this.getUnread(recipient);
    let count = 0;
    for (const n of unread) {
      if (this.markRead(n.id)) count++;
    }
    return count;
  }

  deleteAllForRecipient(recipient: string): number {
    const toDelete = this.getByRecipient(recipient);
    let count = 0;
    for (const n of toDelete) {
      if (this.removeNotification(n.id)) count++;
    }
    return count;
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

  clearAll(): void {
    this.notifications.clear();
    this.counter = 0;
  }
}

export default NotificationManager;