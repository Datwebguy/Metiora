import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { PartnershipPackageAggregate } from '@core/domain/partnership-studio.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApprovePartnershipPackage {
  constructor(
    private readonly partnershipRepo: IPartnershipStudioRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {}

  public async execute(packageId: string): Promise<PartnershipPackageAggregate> {
    const pkg = await this.partnershipRepo.findById(packageId);
    if (!pkg) {
      throw new ApplicationError(`Partnership package not found for ID '${packageId}'.`);
    }

    if (pkg.status === 'APPROVED') {
      return pkg;
    }

    pkg.status = 'APPROVED';
    pkg.updatedAt = new Date();

    const updatedPackage = await this.partnershipRepo.updatePackage(
      packageId,
      pkg,
      `Approved Partnership Package v${pkg.version}`
    );

    // Persist approved partnership proposal into Startup Memory
    const startup = await this.startupRepo.findById(pkg.startupProfileId);
    if (startup) {
      const now = new Date();
      startup.version += 1;
      startup.updatedAt = now;

      const title = pkg.content.proposal.title;
      const currentPartners = startup.partnerships.existingPartners.value || [];
      if (!currentPartners.includes(title)) {
        startup.partnerships.existingPartners = {
          value: [...currentPartners, title],
          confidence: 'HIGH',
          source: 'user_explicit',
          updatedAt: now,
        };
      }

      await this.startupRepo.updateStartup(
        startup.id,
        startup,
        `Updated partnership portfolio from approved Partnership Package v${pkg.version}`
      );

      // Record deliverable in Startup Memory Registry
      await this.startupRepo.recordDeliverable(startup.id, {
        serviceType: 'partnership_studio',
        title,
        contentMarkdown: pkg.contentMarkdown,
        versionNumber: pkg.version,
        metadata: { packageId: pkg.id, readinessScore: pkg.readinessScore, category: pkg.content.category },
      });
    }

    return updatedPackage;
  }
}
