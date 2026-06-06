/**
 * Invite Engine
 * chatdev-design Invite Engine - Invite + Accept + Decline + Stats
 */

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Invite {
  id: string;
  from: string;
  to: string;
  room: string;
  status: InviteStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface IneStats3 {
  invites: number;
  totalAccepted: number;
  totalDeclined: number;
  totalExpired: number;
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueRooms: number;
}

export class InviteEngine {
  private invites: Map<string, Invite> = new Map();
  private counter = 0;
  private totalAccepted = 0;
  private totalDeclined = 0;
  private totalExpired = 0;

  invite(from: string, to: string, room: string): string {
    const id = `ine3-${++this.counter}`;
    this.invites.set(id, {
      id,
      from,
      to,
      room,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  accept(id: string): boolean {
    const i = this.invites.get(id);
    if (!i) return false;
    if (!i.active) return false;
    if (i.status !== 'pending') return false;
    i.status = 'accepted';
    i.updated = Date.now();
    i.hits++;
    this.totalAccepted++;
    return true;
  }

  decline(id: string): boolean {
    const i = this.invites.get(id);
    if (!i) return false;
    if (!i.active) return false;
    if (i.status !== 'pending') return false;
    i.status = 'declined';
    i.updated = Date.now();
    i.hits++;
    this.totalDeclined++;
    return true;
  }

  expire(id: string): boolean {
    const i = this.invites.get(id);
    if (!i) return false;
    if (i.status !== 'pending') return false;
    i.status = 'expired';
    i.updated = Date.now();
    i.hits++;
    this.totalExpired++;
    return true;
  }

  remove(id: string): boolean {
    return this.invites.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.invites.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.invites.values()) {
      i.status = 'pending';
      i.active = true;
      i.hits = 0;
    }
    this.totalAccepted = 0;
    this.totalDeclined = 0;
    this.totalExpired = 0;
  }

  getStats(): IneStats3 {
    const all = Array.from(this.invites.values());
    return {
      invites: all.length,
      totalAccepted: this.totalAccepted,
      totalDeclined: this.totalDeclined,
      totalExpired: this.totalExpired,
      pending: all.filter(i => i.status === 'pending').length,
      accepted: all.filter(i => i.status === 'accepted').length,
      declined: all.filter(i => i.status === 'declined').length,
      expired: all.filter(i => i.status === 'expired').length,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      uniqueRooms: new Set(all.map(i => i.room)).size,
    };
  }

  getInvite(id: string): Invite | undefined {
    return this.invites.get(id);
  }

  getAllInvites(): Invite[] {
    return Array.from(this.invites.values());
  }

  hasInvite(id: string): boolean {
    return this.invites.has(id);
  }

  getCount(): number {
    return this.invites.size;
  }

  getFrom(id: string): string | undefined {
    return this.invites.get(id)?.from;
  }

  getTo(id: string): string | undefined {
    return this.invites.get(id)?.to;
  }

  getRoom(id: string): string | undefined {
    return this.invites.get(id)?.room;
  }

  getStatus(id: string): InviteStatus | undefined {
    return this.invites.get(id)?.status;
  }

  getHits(id: string): number {
    return this.invites.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.invites.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.invites.get(id)?.status === 'pending';
  }

  isAccepted(id: string): boolean {
    return this.invites.get(id)?.status === 'accepted';
  }

  isDeclined(id: string): boolean {
    return this.invites.get(id)?.status === 'declined';
  }

  getByStatus(status: InviteStatus): Invite[] {
    return Array.from(this.invites.values()).filter(i => i.status === status);
  }

  getByRoom(room: string): Invite[] {
    return Array.from(this.invites.values()).filter(i => i.room === room);
  }

  getByUser(user: string): Invite[] {
    return Array.from(this.invites.values()).filter(i => i.from === user || i.to === user);
  }

  getActiveInvites(): Invite[] {
    return Array.from(this.invites.values()).filter(i => i.active);
  }

  getInactiveInvites(): Invite[] {
    return Array.from(this.invites.values()).filter(i => !i.active);
  }

  getAllRooms(): string[] {
    return [...new Set(Array.from(this.invites.values()).map(i => i.room))];
  }

  getRoomCount(): number {
    return this.getAllRooms().length;
  }

  getNewest(): Invite | null {
    const all = Array.from(this.invites.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): Invite | null {
    const all = Array.from(this.invites.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.invites.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.invites.get(id)?.updated ?? 0;
  }

  getTotalAccepted(): number {
    return this.totalAccepted;
  }

  getTotalDeclined(): number {
    return this.totalDeclined;
  }

  getTotalExpired(): number {
    return this.totalExpired;
  }

  clearAll(): void {
    this.invites.clear();
    this.counter = 0;
    this.totalAccepted = 0;
    this.totalDeclined = 0;
    this.totalExpired = 0;
  }
}

export default InviteEngine;