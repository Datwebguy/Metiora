import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { StartupMemoryAggregate } from '@core/domain/startup-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface CreateStartupDTO {
  founderProfileId: string;
  name: string;
  tagline?: string;
  oneSentenceDescription?: string;
  industry: string;
  stage?: string;
  websiteUrl?: string;
  mission?: string;
  problemStatement?: string;
  productDescription?: string;
  businessModel?: string;
}

export class CreateStartup {
  constructor(
    private readonly startupRepository: IStartupMemoryRepository,
    private readonly userRepository: IUserMemoryRepository
  ) {}

  public async execute(dto: CreateStartupDTO): Promise<StartupMemoryAggregate> {
    const founder = await this.userRepository.findById(dto.founderProfileId);
    if (!founder) {
      throw new ApplicationError(`Founder profile not found for ID '${dto.founderProfileId}'.`);
    }

    const now = new Date();
    const newStartup: StartupMemoryAggregate = {
      id: crypto.randomUUID(),
      founderProfileId: dto.founderProfileId,
      name: dto.name,
      version: 1,
      createdAt: now,
      updatedAt: now,
      identity: {
        name: { value: dto.name, confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        tagline: dto.tagline ? { value: dto.tagline, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        oneSentenceDescription: dto.oneSentenceDescription ? { value: dto.oneSentenceDescription, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        websiteUrl: dto.websiteUrl ? { value: dto.websiteUrl, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        industry: { value: dto.industry, confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        stage: { value: dto.stage || 'IDEATION', confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      vision: {
        mission: dto.mission ? { value: dto.mission, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        coreValues: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        longTermGoals: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      problem: {
        problemStatement: dto.problemStatement ? { value: dto.problemStatement, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        existingAlternatives: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        marketPainPoints: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      solution: {
        productDescription: dto.productDescription ? { value: dto.productDescription, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        coreFeatures: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      customers: {
        geographicMarkets: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      businessModel: {
        businessModel: dto.businessModel ? { value: dto.businessModel, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      market: {
        competitors: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        marketTrends: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      roadmap: {
        upcomingReleases: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      funding: {
        investors: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        grants: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        acceleratorPrograms: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      partnerships: {
        existingPartners: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        desiredPartners: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        strategicOpportunities: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      deliverables: [],
    };

    return this.startupRepository.createStartup(newStartup);
  }
}
