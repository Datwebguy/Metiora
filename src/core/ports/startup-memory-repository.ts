import {
  StartupMemoryAggregate,
  StartupPendingUpdateProposal,
  StartupMemoryVersionRecord,
  StartupDeliverableRecordDomain,
} from '../domain/startup-memory.js';
import { ApprovalStatus } from '../domain/user-memory.js';

export interface IStartupMemoryRepository {
  createStartup(startup: StartupMemoryAggregate): Promise<StartupMemoryAggregate>;
  findById(id: string): Promise<StartupMemoryAggregate | null>;
  findByFounderId(founderProfileId: string): Promise<StartupMemoryAggregate[]>;
  updateStartup(id: string, updatedStartup: StartupMemoryAggregate, changeSummary: string): Promise<StartupMemoryAggregate>;
  createPendingUpdate(proposal: Omit<StartupPendingUpdateProposal, 'id' | 'createdAt'>): Promise<StartupPendingUpdateProposal>;
  getPendingUpdateById(proposalId: string): Promise<StartupPendingUpdateProposal | null>;
  resolvePendingUpdate(proposalId: string, status: ApprovalStatus): Promise<StartupPendingUpdateProposal>;
  getVersionHistory(startupProfileId: string): Promise<StartupMemoryVersionRecord[]>;
  recordDeliverable(startupProfileId: string, deliverable: Omit<StartupDeliverableRecordDomain, 'id' | 'createdAt'>): Promise<StartupDeliverableRecordDomain>;
}
