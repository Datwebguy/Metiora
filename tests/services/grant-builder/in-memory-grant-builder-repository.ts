import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import {
  GrantPackageAggregate,
  GrantPackageVersionRecord,
} from '@core/domain/grant-builder.js';

export class InMemoryGrantBuilderRepository implements IGrantBuilderRepository {
  private packages: Map<string, GrantPackageAggregate> = new Map();
  private versions: Map<string, GrantPackageVersionRecord[]> = new Map();

  public async createPackage(packageAgg: GrantPackageAggregate): Promise<GrantPackageAggregate> {
    this.packages.set(packageAgg.id, packageAgg);

    const initialVersion: GrantPackageVersionRecord = {
      id: crypto.randomUUID(),
      packageId: packageAgg.id,
      versionNumber: packageAgg.version,
      contentJson: packageAgg.content,
      contentMarkdown: packageAgg.contentMarkdown,
      changeSummary: 'Initial Grant Builder Package generation',
      createdAt: new Date(),
    };
    this.versions.set(packageAgg.id, [initialVersion]);

    return packageAgg;
  }

  public async findById(id: string): Promise<GrantPackageAggregate | null> {
    return this.packages.get(id) || null;
  }

  public async findByStartupId(startupProfileId: string): Promise<GrantPackageAggregate | null> {
    for (const pkg of this.packages.values()) {
      if (pkg.startupProfileId === startupProfileId) {
        return pkg;
      }
    }
    return null;
  }

  public async updatePackage(
    id: string,
    updated: GrantPackageAggregate,
    changeSummary: string
  ): Promise<GrantPackageAggregate> {
    this.packages.set(id, updated);

    const newVersion: GrantPackageVersionRecord = {
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

  public async getVersionHistory(packageId: string): Promise<GrantPackageVersionRecord[]> {
    return this.versions.get(packageId) || [];
  }
}
