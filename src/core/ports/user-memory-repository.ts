import {
  FounderProfileAggregate,
  FounderPendingUpdateProposal,
  FounderMemoryVersionRecord,
  ApprovalStatus,
} from '../domain/user-memory.js';

export interface IUserMemoryRepository {
  createProfile(profile: FounderProfileAggregate): Promise<FounderProfileAggregate>;
  findById(id: string): Promise<FounderProfileAggregate | null>;
  findByEmail(email: string): Promise<FounderProfileAggregate | null>;
  updateProfile(id: string, updatedProfile: FounderProfileAggregate, changeSummary: string): Promise<FounderProfileAggregate>;
  createPendingUpdate(proposal: Omit<FounderPendingUpdateProposal, 'id' | 'createdAt'>): Promise<FounderPendingUpdateProposal>;
  getPendingUpdateById(proposalId: string): Promise<FounderPendingUpdateProposal | null>;
  resolvePendingUpdate(proposalId: string, status: ApprovalStatus): Promise<FounderPendingUpdateProposal>;
  getVersionHistory(founderProfileId: string): Promise<FounderMemoryVersionRecord[]>;
  searchProfiles(query: string): Promise<FounderProfileAggregate[]>;
}
