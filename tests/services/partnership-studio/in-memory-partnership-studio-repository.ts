import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import {
  PartnershipPackageAggregate,
  PartnershipPackageVersionRecord,
} from '@core/domain/partnership-studio.js';

export class InMemoryPartnershipStudioRepository implements IPartnershipStudioRepository {
  private packages: Map<string, PartnershipPackageAggregate> = new Map();
  private versions: Map<string, PartnershipPackageVersionRecord[]> = new Map();

  public async createPackage(packageAgg: PartnershipPackageAggregate): Promise<PartnershipPackageAggregate> {
    this.packages.set(packageAgg.id, packageAgg);

    const initialVersion: PartnershipPackageVersionRecord = {
      id: crypto.randomUUID(),
      packageId: packageAgg.id,
      versionNumber: packageAgg.version,
      contentJson: packageAgg.content,
      contentMarkdown: packageAgg.contentMarkdown,
      changeSummary: 'Initial Partnership Studio Package generation',
      createdAt: new Date(),
    };
    this.versions.set(packageAgg.id, [initialVersion]);

    return packageAgg;
  }

  public async findById(id: string): Promise<PartnershipPackageAggregate | null> {
    return this.packages.get(id) || null;
  }

  public async findByStartupId(startupProfileId: string): Promise<PartnershipPackageAggregate | null> {
    for (const pkg of this.packages.values()) {
      if (pkg.startupProfileId === startupProfileId) {
        return pkg;
      }
    }
    return null;
  }

  public async updatePackage(
    id: string,
    updated: PartnershipPackageAggregate,
    changeSummary: string
  ): Promise<PartnershipPackageAggregate> {
    this.packages.set(id, updated);

    const newVersion: PartnershipPackageVersionRecord = {
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

  public async getVersionHistory(packageId: string): Promise<PartnershipPackageVersionRecord[]> {
    return this.versions.get(packageId) || [];
  }
}
