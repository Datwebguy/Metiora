import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupBlueprintAggregate } from '@core/domain/startup-blueprint.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApproveBlueprint {
  constructor(
    private readonly blueprintRepo: IStartupBlueprintRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {}

  public async execute(blueprintId: string): Promise<StartupBlueprintAggregate> {
    const blueprint = await this.blueprintRepo.findById(blueprintId);
    if (!blueprint) {
      throw new ApplicationError(`Startup Blueprint not found for ID '${blueprintId}'.`);
    }

    if (blueprint.status === 'APPROVED') {
      return blueprint;
    }

    blueprint.status = 'APPROVED';
    blueprint.updatedAt = new Date();

    const updatedBlueprint = await this.blueprintRepo.updateBlueprint(
      blueprintId,
      blueprint,
      `Approved Startup Blueprint v${blueprint.version}`
    );

    // Update Startup Memory Aggregate with approved blueprint facts
    const startup = await this.startupRepo.findById(blueprint.startupProfileId);
    if (startup) {
      const now = new Date();
      startup.version += 1;
      startup.updatedAt = now;

      if (blueprint.content.executiveSummary.tagline) {
        startup.identity.tagline = { value: blueprint.content.executiveSummary.tagline, confidence: 'HIGH', source: 'user_explicit', updatedAt: now };
      }
      if (blueprint.content.problem.problemStatement) {
        startup.problem.problemStatement = { value: blueprint.content.problem.problemStatement, confidence: 'HIGH', source: 'user_explicit', updatedAt: now };
      }
      if (blueprint.content.solution.productDescription) {
        startup.solution.productDescription = { value: blueprint.content.solution.productDescription, confidence: 'HIGH', source: 'user_explicit', updatedAt: now };
      }
      if (blueprint.content.businessModel.businessModel) {
        startup.businessModel.businessModel = { value: blueprint.content.businessModel.businessModel, confidence: 'HIGH', source: 'user_explicit', updatedAt: now };
      }
      if (blueprint.content.growthStrategy.targetCustomers) {
        startup.customers.targetAudience = { value: blueprint.content.growthStrategy.targetCustomers, confidence: 'HIGH', source: 'user_explicit', updatedAt: now };
      }

      await this.startupRepo.updateStartup(
        startup.id,
        startup,
        `Updated startup memory from approved Blueprint v${blueprint.version}`
      );

      // Record deliverable asset in Startup Memory Registry
      await this.startupRepo.recordDeliverable(startup.id, {
        serviceType: 'startup_blueprint',
        title: `${blueprint.content.executiveSummary.startupName} — Canonical Startup Blueprint`,
        contentMarkdown: blueprint.contentMarkdown,
        versionNumber: blueprint.version,
        metadata: { blueprintId: blueprint.id },
      });
    }

    return updatedBlueprint;
  }
}
