import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderProfileAggregate } from '@core/domain/user-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface CreateFounderProfileDTO {
  email: string;
  fullName: string;
  preferredName?: string;
  title?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  skills?: string[];
  industries?: string[];
  experienceYears?: number;
}

export class CreateFounderProfile {
  constructor(private readonly repository: IUserMemoryRepository) {}

  public async execute(dto: CreateFounderProfileDTO): Promise<FounderProfileAggregate> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ApplicationError(`Founder profile with email '${dto.email}' already exists.`);
    }

    const now = new Date();
    const newProfile: FounderProfileAggregate = {
      id: crypto.randomUUID(),
      email: dto.email,
      version: 1,
      createdAt: now,
      updatedAt: now,
      identity: {
        fullName: { value: dto.fullName, confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        preferredName: dto.preferredName ? { value: dto.preferredName, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        title: dto.title ? { value: dto.title, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        bio: dto.bio ? { value: dto.bio, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        country: dto.country ? { value: dto.country, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        timezone: dto.timezone ? { value: dto.timezone, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      professional: {
        skills: { value: dto.skills || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        industries: { value: dto.industries || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        experienceYears: dto.experienceYears ? { value: dto.experienceYears, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        areasOfExpertise: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        certifications: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      personal: {},
      communication: {
        preferredLanguage: { value: 'en', confidence: 'HIGH', source: 'system_default', updatedAt: now },
      },
      publicPresence: {},
      history: [],
      preferences: {
        investorPreferences: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        grantPreferences: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
    };

    return this.repository.createProfile(newProfile);
  }
}
