import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { GrantPackageAggregate } from '@core/domain/grant-builder.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApproveGrantPackage {
  constructor(
    private readonly grantRepo: IGrantBuilderRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {}

  public async execute(packageId: string): Promise<GrantPackageAggregate> {
    const pkg = await this.grantRepo.findById(packageId);
    if (!pkg) {
      throw new ApplicationError(`Grant package not found for ID '${packageId}'.`);
    }

    if (pkg.status === 'APPROVED') {
      return pkg;
    }

    pkg.status = 'APPROVED';
    pkg.updatedAt = new Date();

    const updatedPackage = await this.grantRepo.updatePackage(
      packageId,
      pkg,
      `Approved Grant Package v${pkg.version}`
    );

    // Persist approved grant application into Startup Memory
    const startup = await this.startupRepo.findById(pkg.startupProfileId);
    if (startup) {
      const now = new Date();
      startup.version += 1;
      startup.updatedAt = now;

      const grantTitle = pkg.content.projectDescription.projectTitle;
      const currentGrants = startup.funding.grants.value || [];
      if (!currentGrants.includes(grantTitle)) {
        startup.funding.grants = {
          value: [...currentGrants, grantTitle],
          confidence: 'HIGH',
          source: 'user_explicit',
          updatedAt: now,
        };
      }

      await this.startupRepo.updateStartup(
        startup.id,
        startup,
        `Updated grant portfolio from approved Grant Package v${pkg.version}`
      );

      // Record deliverable in Startup Memory Registry
      await this.startupRepo.recordDeliverable(startup.id, {
        serviceType: 'grant_builder',
        title: grantTitle,
        contentMarkdown: pkg.contentMarkdown,
        versionNumber: pkg.version,
        metadata: { packageId: pkg.id, readinessScore: pkg.readinessScore },
      });
    }

    return updatedPackage;
  }
}
