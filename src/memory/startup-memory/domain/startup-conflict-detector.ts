import { StartupMemoryAggregate, StartupConflictDescriptor } from '@core/domain/startup-memory.js';

export class StartupConflictDetector {
  public detectConflicts(
    existing: StartupMemoryAggregate,
    incoming: Partial<StartupMemoryAggregate>
  ): StartupConflictDescriptor[] {
    const conflicts: StartupConflictDescriptor[] = [];

    // Identity name conflict
    if (incoming.identity?.name?.value && incoming.identity.name.value !== existing.identity.name.value) {
      conflicts.push({
        fieldPath: 'identity.name',
        currentValue: existing.identity.name.value,
        suggestedValue: incoming.identity.name.value,
        reasonForConflict: `Startup name '${existing.identity.name.value}' conflicts with proposed name '${incoming.identity.name.value}'.`,
      });
    }

    // Vision mission conflict
    if (
      incoming.vision?.mission?.value &&
      existing.vision.mission?.value &&
      incoming.vision.mission.value !== existing.vision.mission.value
    ) {
      conflicts.push({
        fieldPath: 'vision.mission',
        currentValue: existing.vision.mission.value,
        suggestedValue: incoming.vision.mission.value,
        reasonForConflict: 'Company mission statement modification detected.',
      });
    }

    // Problem statement conflict
    if (
      incoming.problem?.problemStatement?.value &&
      existing.problem.problemStatement?.value &&
      incoming.problem.problemStatement.value !== existing.problem.problemStatement.value
    ) {
      conflicts.push({
        fieldPath: 'problem.problemStatement',
        currentValue: existing.problem.problemStatement.value,
        suggestedValue: incoming.problem.problemStatement.value,
        reasonForConflict: 'Core problem statement conflict detected.',
      });
    }

    // Business model conflict
    if (
      incoming.businessModel?.businessModel?.value &&
      existing.businessModel.businessModel?.value &&
      incoming.businessModel.businessModel.value !== existing.businessModel.businessModel.value
    ) {
      conflicts.push({
        fieldPath: 'businessModel.businessModel',
        currentValue: existing.businessModel.businessModel.value,
        suggestedValue: incoming.businessModel.businessModel.value,
        reasonForConflict: 'Business model strategy conflict detected.',
      });
    }

    return conflicts;
  }
}
