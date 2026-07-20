import {
  FounderProfileAggregate,
  ConflictDescriptor,
} from '@core/domain/user-memory.js';

export class ConflictDetector {
  public detectConflicts(
    existing: FounderProfileAggregate,
    incoming: Partial<FounderProfileAggregate>
  ): ConflictDescriptor[] {
    const conflicts: ConflictDescriptor[] = [];

    // Identity checks
    if (incoming.identity?.fullName?.value && incoming.identity.fullName.value !== existing.identity.fullName.value) {
      conflicts.push({
        fieldPath: 'identity.fullName',
        currentValue: existing.identity.fullName.value,
        suggestedValue: incoming.identity.fullName.value,
        explanation: `Existing full name '${existing.identity.fullName.value}' differs from incoming '${incoming.identity.fullName.value}'.`,
        confidenceDiff: `Current confidence: ${existing.identity.fullName.confidence}, Incoming confidence: ${incoming.identity.fullName.confidence}`,
      });
    }

    if (incoming.identity?.bio?.value && existing.identity.bio?.value && incoming.identity.bio.value !== existing.identity.bio.value) {
      conflicts.push({
        fieldPath: 'identity.bio',
        currentValue: existing.identity.bio.value,
        suggestedValue: incoming.identity.bio.value,
        explanation: 'Bio content modification detected.',
        confidenceDiff: `Current: ${existing.identity.bio.confidence}, Incoming: ${incoming.identity.bio.confidence}`,
      });
    }

    // Personal Mission check
    if (
      incoming.personal?.personalMission?.value &&
      existing.personal.personalMission?.value &&
      incoming.personal.personalMission.value !== existing.personal.personalMission.value
    ) {
      conflicts.push({
        fieldPath: 'personal.personalMission',
        currentValue: existing.personal.personalMission.value,
        suggestedValue: incoming.personal.personalMission.value,
        explanation: 'Strategic personal mission statement conflict detected.',
        confidenceDiff: `Current: ${existing.personal.personalMission.confidence}, Incoming: ${incoming.personal.personalMission.confidence}`,
      });
    }

    return conflicts;
  }
}
