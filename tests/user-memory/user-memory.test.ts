import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from './in-memory-user-memory-repository.js';
import { CreateFounderProfile } from '../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { GetFounderProfile } from '../../src/memory/user-memory/use-cases/get-founder-profile.js';
import { UpdateFounderProfile } from '../../src/memory/user-memory/use-cases/update-founder-profile.js';
import { ApproveMemoryUpdate } from '../../src/memory/user-memory/use-cases/approve-memory-update.js';
import { RejectMemoryUpdate } from '../../src/memory/user-memory/use-cases/reject-memory-update.js';
import { GenerateMemorySnapshot } from '../../src/memory/user-memory/use-cases/generate-memory-snapshot.js';
import { GetMemoryHistory } from '../../src/memory/user-memory/use-cases/get-memory-history.js';
import { SearchFounderMemory } from '../../src/memory/user-memory/use-cases/search-founder-memory.js';
import { ConflictDetector } from '../../src/memory/user-memory/domain/conflict-detector.js';

describe('User Memory Engine Core Tests', () => {
  let repository: InMemoryUserMemoryRepository;
  let createProfile: CreateFounderProfile;
  let getProfile: GetFounderProfile;
  let updateProfile: UpdateFounderProfile;
  let approveUpdate: ApproveMemoryUpdate;
  let rejectUpdate: RejectMemoryUpdate;
  let generateSnapshot: GenerateMemorySnapshot;
  let getHistory: GetMemoryHistory;
  let searchMemory: SearchFounderMemory;

  beforeEach(() => {
    repository = new InMemoryUserMemoryRepository();
    createProfile = new CreateFounderProfile(repository);
    getProfile = new GetFounderProfile(repository);
    updateProfile = new UpdateFounderProfile(repository);
    approveUpdate = new ApproveMemoryUpdate(repository);
    rejectUpdate = new RejectMemoryUpdate(repository);
    generateSnapshot = new GenerateMemorySnapshot(repository);
    getHistory = new GetMemoryHistory(repository);
    searchMemory = new SearchFounderMemory(repository);
  });

  it('should create a new founder profile with default version 1', async () => {
    const profile = await createProfile.execute({
      email: 'alex@metiora.ai',
      fullName: 'Alex Founder',
      title: 'Chief Executive Officer',
      skills: ['AI Systems', 'Product Design'],
    });

    expect(profile).toBeDefined();
    expect(profile.id).toBeDefined();
    expect(profile.version).toBe(1);
    expect(profile.identity.fullName.value).toBe('Alex Founder');
    expect(profile.identity.fullName.confidence).toBe('HIGH');
  });

  it('should prevent creating duplicate profiles with the same email', async () => {
    await createProfile.execute({
      email: 'alex@metiora.ai',
      fullName: 'Alex Founder',
    });

    await expect(
      createProfile.execute({
        email: 'alex@metiora.ai',
        fullName: 'Alex Duplicate',
      })
    ).rejects.toThrow(/already exists/);
  });

  it('should retrieve an existing founder profile by ID', async () => {
    const created = await createProfile.execute({
      email: 'sara@metiora.ai',
      fullName: 'Sara Builder',
    });

    const retrieved = await getProfile.execute(created.id);
    expect(retrieved.email).toBe('sara@metiora.ai');
  });

  it('should update profile directly when no conflicts exist', async () => {
    const created = await createProfile.execute({
      email: 'david@metiora.ai',
      fullName: 'David Tech',
    });

    const result = await updateProfile.execute({
      founderId: created.id,
      incomingData: {
        professional: {
          skills: { value: ['TypeScript', 'Node.js'], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          industries: { value: ['Artificial Intelligence'], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          areasOfExpertise: { value: ['Backend Architecture'], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          certifications: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
        },
      },
    });

    expect(result.type).toBe('UPDATED');
    if (result.type === 'UPDATED') {
      expect(result.profile.version).toBe(2);
      expect(result.profile.professional.skills.value).toEqual(['TypeScript', 'Node.js']);
    }
  });

  it('should detect conflicts and create pending proposal when core fields differ', async () => {
    const created = await createProfile.execute({
      email: 'elena@metiora.ai',
      fullName: 'Elena Web3',
      bio: 'Building AI tools.',
    });

    const result = await updateProfile.execute({
      founderId: created.id,
      incomingData: {
        identity: {
          fullName: { value: 'Elena Web3 Updated', confidence: 'MEDIUM', source: 'ai_inferred', updatedAt: new Date() },
        },
      },
    });

    expect(result.type).toBe('PROPOSAL_CREATED');
    if (result.type === 'PROPOSAL_CREATED') {
      expect(result.proposal.status).toBe('PENDING');
      expect(result.proposal.conflicts.length).toBeGreaterThan(0);
      expect(result.proposal.conflicts[0].fieldPath).toBe('identity.fullName');
    }
  });

  it('should approve pending update proposal and increment profile version', async () => {
    const created = await createProfile.execute({
      email: 'marcus@metiora.ai',
      fullName: 'Marcus Original',
    });

    const updateRes = await updateProfile.execute({
      founderId: created.id,
      incomingData: {
        identity: {
          fullName: { value: 'Marcus Approved', confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
        },
      },
    });

    expect(updateRes.type).toBe('PROPOSAL_CREATED');
    if (updateRes.type === 'PROPOSAL_CREATED') {
      const approvedProfile = await approveUpdate.execute(updateRes.proposal.id);
      expect(approvedProfile.identity.fullName.value).toBe('Marcus Approved');
      expect(approvedProfile.version).toBe(2);
    }
  });

  it('should reject pending update proposal without modifying aggregate state', async () => {
    const created = await createProfile.execute({
      email: 'sophia@metiora.ai',
      fullName: 'Sophia Unchanged',
    });

    const updateRes = await updateProfile.execute({
      founderId: created.id,
      incomingData: {
        identity: {
          fullName: { value: 'Sophia Rejected', confidence: 'LOW', source: 'ai_inferred', updatedAt: new Date() },
        },
      },
    });

    if (updateRes.type === 'PROPOSAL_CREATED') {
      const rejectedProp = await rejectUpdate.execute(updateRes.proposal.id);
      expect(rejectedProp.status).toBe('REJECTED');

      const profile = await getProfile.execute(created.id);
      expect(profile.identity.fullName.value).toBe('Sophia Unchanged');
      expect(profile.version).toBe(1);
    }
  });

  it('should generate standardized User Memory Snapshot for downstream services', async () => {
    const created = await createProfile.execute({
      email: 'snapshot@metiora.ai',
      fullName: 'Snapshot Founder',
      title: 'Founding Engineer',
      bio: 'Building long-term startup workspace memory.',
      country: 'United States',
      timezone: 'UTC-7',
      skills: ['TypeScript', 'Clean Architecture'],
    });

    const snapshot = await generateSnapshot.execute(created.id);
    expect(snapshot.founderId).toBe(created.id);
    expect(snapshot.founderSummary.fullName).toBe('Snapshot Founder');
    expect(snapshot.professionalProfile.skills).toEqual(['TypeScript', 'Clean Architecture']);
    expect(snapshot.generatedAt).toBeDefined();
  });

  it('should maintain immutable version history', async () => {
    const created = await createProfile.execute({
      email: 'history@metiora.ai',
      fullName: 'History Founder',
    });

    const history = await getHistory.execute(created.id);
    expect(history.length).toBe(1);
    expect(history[0].versionNumber).toBe(1);
  });

  it('should search founder profiles by query string', async () => {
    await createProfile.execute({
      email: 'search1@metiora.ai',
      fullName: 'Searchable Leader',
      title: 'VP Engineering',
    });

    const results = await searchMemory.execute('Searchable');
    expect(results.length).toBe(1);
    expect(results[0].email).toBe('search1@metiora.ai');
  });

  it('should correctly run ConflictDetector logic on conflicting fields', () => {
    const detector = new ConflictDetector();
    const mockProfile: any = {
      identity: {
        fullName: { value: 'Original Name', confidence: 'HIGH' },
        bio: { value: 'Original Bio', confidence: 'HIGH' },
      },
      personal: {
        personalMission: { value: 'Original Mission', confidence: 'HIGH' },
      },
    };

    const conflicts = detector.detectConflicts(mockProfile, {
      identity: {
        fullName: { value: 'Changed Name', confidence: 'MEDIUM', source: 'ai', updatedAt: new Date() },
      },
    });

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].fieldPath).toBe('identity.fullName');
    expect(conflicts[0].currentValue).toBe('Original Name');
    expect(conflicts[0].suggestedValue).toBe('Changed Name');
  });
});
