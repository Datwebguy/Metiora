import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import {
  InvestorPackageAggregate,
  InvestorPackageVersionRecord,
} from '@core/domain/investor-ready.js';

export class InMemoryInvestorReadyRepository implements IInvestorReadyRepository {
  private packages: Map<string, InvestorPackageAggregate> = new Map();
  private versions: Map<string, InvestorPackageVersionRecord[]> = new Map();

  public async createPackage(packageAgg: InvestorPackageAggregate): Promise<InvestorPackageAggregate> {
    this.packages.set(packageAgg.id, packageAgg);

    const initialVersion: InvestorPackageVersionRecord = {
      id: crypto.randomUUID(),
      packageId: packageAgg.id,
      versionNumber: packageAgg.version,
      contentJson: packageAgg.content,
      contentMarkdown: packageAgg.contentMarkdown,
      changeSummary: 'Initial Investor Ready Package generation',
      createdAt: new Date(),
    };
    this.versions.set(packageAgg.id, [initialVersion]);

    return packageAgg;
  }

  public async findById(id: string): Promise<InvestorPackageAggregate | null> {
    return this.packages.get(id) || null;
  }

  public async findByStartupId(startupProfileId: string): Promise<InvestorPackageAggregate | null> {
    for (const pkg of this.packages.values()) {
      if (pkg.startupProfileId === startupProfileId) {
        return pkg;
      }
    }
    return null;
  }

  public async updatePackage(
    id: string,
    updated: InvestorPackageAggregate,
    changeSummary: string
  ): Promise<InvestorPackageAggregate> {
    this.packages.set(id, updated);

    const newVersion: InvestorPackageVersionRecord = {
      id: crypto.randomUUID(),
      packageId: id,
      versionNumber: updated.version,
      contentJson: updated.content,
      contentMarkdown: updated.contentMarkdown,
      changeSummary,
      createdAt: new Date(),
    };

    const existing = this.versions.get(id) || [];
    this.versions.set(id, [newVersion, ...existing]);

    return updated;
  }

  public async getVersionHistory(packageId: string): Promise<InvestorPackageVersionRecord[]> {
    return this.versions.get(packageId) || [];
  }
}
