import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import {
  FounderProfileAggregate,
  FounderPendingUpdateProposal,
  FounderMemoryVersionRecord,
  ApprovalStatus,
} from '@core/domain/user-memory.js';
import { SnapshotBuilder } from '../../src/memory/user-memory/domain/snapshot-builder.js';

export class InMemoryUserMemoryRepository implements IUserMemoryRepository {
  private profiles: Map<string, FounderProfileAggregate> = new Map();
  private proposals: Map<string, FounderPendingUpdateProposal> = new Map();
  private versions: Map<string, FounderMemoryVersionRecord[]> = new Map();

  public async createProfile(profile: FounderProfileAggregate): Promise<FounderProfileAggregate> {
    this.profiles.set(profile.id, profile);
    
    const snapshot = SnapshotBuilder.buildSnapshot(profile);
    const initialVersion: FounderMemoryVersionRecord = {
      id: crypto.randomUUID(),
      founderProfileId: profile.id,
      versionNumber: profile.version,
      snapshotJson: snapshot as any,
      changeSummary: 'Initial profile creation',
      createdAt: new Date(),
    };
    this.versions.set(profile.id, [initialVersion]);

    return profile;
  }

  public async findById(id: string): Promise<FounderProfileAggregate | null> {
    return this.profiles.get(id) || null;
  }

  public async findByEmail(email: string): Promise<FounderProfileAggregate | null> {
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase() === email.toLowerCase()) {
        return p;
      }
    }
    return null;
  }

  public async updateProfile(
    id: string,
    updatedProfile: FounderProfileAggregate,
    changeSummary: string
  ): Promise<FounderProfileAggregate> {
    this.profiles.set(id, updatedProfile);

    const snapshot = SnapshotBuilder.buildSnapshot(updatedProfile);
    const newVersionRecord: FounderMemoryVersionRecord = {
      id: crypto.randomUUID(),
      founderProfileId: id,
      versionNumber: updatedProfile.version,
      snapshotJson: snapshot as any,
      changeSummary,
      createdAt: new Date(),
    };

    const existingVersions = this.versions.get(id) || [];
    this.versions.set(id, [newVersionRecord, ...existingVersions]);

    return updatedProfile;
  }

  public async createPendingUpdate(
    proposal: Omit<FounderPendingUpdateProposal, 'id' | 'createdAt'>
  ): Promise<FounderPendingUpdateProposal> {
    const id = crypto.randomUUID();
    const created: FounderPendingUpdateProposal = {
      ...proposal,
      id,
      createdAt: new Date(),
    };
    this.proposals.set(id, created);
    return created;
  }

  public async getPendingUpdateById(proposalId: string): Promise<FounderPendingUpdateProposal | null> {
    return this.proposals.get(proposalId) || null;
  }

  public async resolvePendingUpdate(proposalId: string, status: ApprovalStatus): Promise<FounderPendingUpdateProposal> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    const resolved: FounderPendingUpdateProposal = {
      ...proposal,
      status,
      resolvedAt: new Date(),
    };
    this.proposals.set(proposalId, resolved);
    return resolved;
  }

  public async getVersionHistory(founderProfileId: string): Promise<FounderMemoryVersionRecord[]> {
    return this.versions.get(founderProfileId) || [];
  }

  public async searchProfiles(query: string): Promise<FounderProfileAggregate[]> {
    const results: FounderProfileAggregate[] = [];
    const lower = query.toLowerCase();
    for (const p of this.profiles.values()) {
      if (
        p.email.toLowerCase().includes(lower) ||
        p.identity.fullName.value.toLowerCase().includes(lower) ||
        (p.identity.title?.value && p.identity.title.value.toLowerCase().includes(lower))
      ) {
        results.push(p);
      }
    }
    return results;
  }
}
