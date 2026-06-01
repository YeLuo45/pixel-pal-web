export interface RoleAssignment {
  roleId: string;
  participantId: string;
  sessionId: string;
  assignedAt: number;
}

const DEFAULT_ROLES = ['moderator', 'scribe', 'participant', 'observer'];

export class RoleCoordinator {
  private assignments: RoleAssignment[] = [];

  assignRole(sessionId: string, roleId: string, participantId: string): RoleAssignment {
    const assignment: RoleAssignment = {
      roleId,
      participantId,
      sessionId,
      assignedAt: Date.now(),
    };
    this.assignments.push(assignment);
    return assignment;
  }

  unassignRole(sessionId: string, roleId: string): boolean {
    const index = this.assignments.findIndex(
      (a) => a.sessionId === sessionId && a.roleId === roleId
    );
    if (index === -1) {
      return false;
    }
    this.assignments.splice(index, 1);
    return true;
  }

  getRoleAssignments(sessionId: string): RoleAssignment[] {
    return this.assignments.filter((a) => a.sessionId === sessionId);
  }

  getParticipantRoles(sessionId: string, participantId: string): RoleAssignment[] {
    return this.assignments.filter(
      (a) => a.sessionId === sessionId && a.participantId === participantId
    );
  }

  switchRole(sessionId: string, fromParticipantId: string, toParticipantId: string): boolean {
    const assignmentIndex = this.assignments.findIndex(
      (a) =>
        a.sessionId === sessionId &&
        a.participantId === fromParticipantId
    );
    if (assignmentIndex === -1) {
      return false;
    }
    const assignment = this.assignments[assignmentIndex];
    assignment.participantId = toParticipantId;
    assignment.assignedAt = Date.now();
    return true;
  }

  getAvailableRoles(sessionId: string): string[] {
    const occupiedRoleIds = this.assignments
      .filter((a) => a.sessionId === sessionId)
      .map((a) => a.roleId);
    return DEFAULT_ROLES.filter((role) => !occupiedRoleIds.includes(role));
  }

  getOccupiedRoles(sessionId: string): RoleAssignment[] {
    return this.assignments.filter((a) => a.sessionId === sessionId);
  }
}