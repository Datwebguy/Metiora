import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import {
  StartupMemoryAggregate,
  StartupPendingUpdateProposal,
  StartupMemoryVersionRecord,
  StartupDeliverableRecordDomain,
} from '@core/domain/startup-memory.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';
import { StartupSnapshotBuilder } from '../../src/memory/startup-memory/domain/startup-snapshot-builder.js';

export class InMemoryStartupMemoryRepository implements IStartupMemoryRepository {
  private startups: Map<string, StartupMemoryAggregate> = new Map();
  private proposals: Map<string, StartupPendingUpdateProposal> = new Map();
  private versions: Map<string, StartupMemoryVersionRecord[]> = new Map();
  private deliverables: Map<string, StartupDeliverableRecordDomain[]> = new Map();

  public async createStartup(startup: StartupMemoryAggregate): Promise<StartupMemoryAggregate> {
    this.startups.set(startup.id, startup);

    const snapshot = StartupSnapshotBuilder.buildSnapshot(startup);
    const initialVersion: StartupMemoryVersionRecord = {
      id: crypto.randomUUID(),
      startupProfileId: startup.id,
      versionNumber: startup.version,
      snapshotJson: snapshot as any,
      changeSummary: 'Initial startup creation',
      createdAt: new Date(),
    };
    this.versions.set(startup.id, [initialVersion]);

    return startup;
  }

  public async findById(id: string): Promise<StartupMemoryAggregate | null> {
    return this.startups.get(id) || null;
  }

  public async findByFounderId(founderProfileId: string): Promise<StartupMemoryAggregate[]> {
    const results: StartupMemoryAggregate[] = [];
    for (const s of this.startups.values()) {
      if (s.founderProfileId === founderProfileId) {
        results.push(s);
      }
    }
    return results;
  }

  public async updateStartup(
    id: string,
    updatedStartup: StartupMemoryAggregate,
    changeSummary: string
  ): Promise<StartupMemoryAggregate> {
    this.startups.set(id, updatedStartup);

    const snapshot = StartupSnapshotBuilder.buildSnapshot(updatedStartup);
    const newVersion: StartupMemoryVersionRecord = {
      id: crypto.randomUUID(),
      startupProfileId: id,
      versionNumber: updatedStartup.version,
      snapshotJson: snapshot as any,
      changeSummary,
      createdAt: new Date(),
    };

    const existingVersions = this.versions.get(id) || [];
    this.versions.set(id, [newVersion, ...existingVersions]);

    return updatedStartup;
  }

  public async createPendingUpdate(
    proposal: Omit<StartupPendingUpdateProposal, 'id' | 'createdAt'>
  ): Promise<StartupPendingUpdateProposal> {
    const id = crypto.randomUUID();
    const created: StartupPendingUpdateProposal = {
      ...proposal,
      id,
      createdAt: new Date(),
    };
    this.proposals.set(id, created);
    return created;
  }

  public async getPendingUpdateById(proposalId: string): Promise<StartupPendingUpdateProposal | null> {
    return this.proposals.get(proposalId) || null;
  }

  public async resolvePendingUpdate(proposalId: string, status: ApprovalStatus): Promise<StartupPendingUpdateProposal> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    const resolved: StartupPendingUpdateProposal = {
      ...proposal,
      status,
      resolvedAt: new Date(),
    };
    this.proposals.set(proposalId, resolved);
    return resolved;
  }

  public async getVersionHistory(startupProfileId: string): Promise<StartupMemoryVersionRecord[]> {
    return this.versions.get(startupProfileId) || [];
  }

  public async recordDeliverable(
    startupProfileId: string,
    deliverable: Omit<StartupDeliverableRecordDomain, 'id' | 'createdAt'>
  ): Promise<StartupDeliverableRecordDomain> {
    const created: StartupDeliverableRecordDomain = {
      ...deliverable,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const existing = this.deliverables.get(startupProfileId) || [];
    this.deliverables.set(startupProfileId, [created, ...existing]);

    const startup = this.startups.get(startupProfileId);
    if (startup) {
      startup.deliverables = [created, ...startup.deliverables];
      this.startups.set(startupProfileId, startup);
    }

    return created;
  }
}
