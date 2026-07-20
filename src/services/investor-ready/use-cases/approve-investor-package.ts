import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { InvestorPackageAggregate } from '@core/domain/investor-ready.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApproveInvestorPackage {
  constructor(
    private readonly investorRepo: IInvestorReadyRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {}

  public async execute(packageId: string): Promise<InvestorPackageAggregate> {
    const pkg = await this.investorRepo.findById(packageId);
    if (!pkg) {
      throw new ApplicationError(`Investor package not found for ID '${packageId}'.`);
    }

    if (pkg.status === 'APPROVED') {
      return pkg;
    }

    pkg.status = 'APPROVED';
    pkg.updatedAt = new Date();

    const updatedPackage = await this.investorRepo.updatePackage(
      packageId,
      pkg,
      `Approved Investor Ready Package v${pkg.version}`
    );

    // Persist approved funding information into Startup Memory
    const startup = await this.startupRepo.findById(pkg.startupProfileId);
    if (startup) {
      const now = new Date();
      startup.version += 1;
      startup.updatedAt = now;

      startup.funding.fundingStage = {
        value: pkg.content.fundingAsk.fundingRoundStage,
        confidence: 'HIGH',
        source: 'user_explicit',
        updatedAt: now,
      };

      await this.startupRepo.updateStartup(
        startup.id,
        startup,
        `Updated funding stage from approved Investor Package v${pkg.version}`
      );

      // Record deliverable in Startup Memory Registry
      await this.startupRepo.recordDeliverable(startup.id, {
        serviceType: 'investor_ready',
        title: `${pkg.content.executiveSummary.companyName} — Investment Memo & Investor Package`,
        contentMarkdown: pkg.contentMarkdown,
        versionNumber: pkg.version,
        metadata: { packageId: pkg.id, readinessScore: pkg.readinessScore },
      });
    }

    return updatedPackage;
  }
}
