import { StartupMemoryAggregate, StartupMemorySnapshot } from '@core/domain/startup-memory.js';

export class StartupSnapshotBuilder {
  public static buildSnapshot(startup: StartupMemoryAggregate): StartupMemorySnapshot {
    return {
      startupId: startup.id,
      founderId: startup.founderProfileId,
      version: startup.version,
      generatedAt: new Date().toISOString(),
      companyProfile: {
        name: startup.identity.name.value,
        tagline: startup.identity.tagline?.value,
        oneSentenceDescription: startup.identity.oneSentenceDescription?.value,
        industry: startup.identity.industry.value,
        stage: startup.identity.stage.value,
        websiteUrl: startup.identity.websiteUrl?.value,
      },
      foundation: {
        mission: startup.vision.mission?.value,
        vision: startup.vision.vision?.value,
        coreValues: startup.vision.coreValues.value,
      },
      problemAndSolution: {
        problemStatement: startup.problem.problemStatement?.value,
        productDescription: startup.solution.productDescription?.value,
        uniqueValueProp: startup.solution.uniqueValueProp?.value,
        coreFeatures: startup.solution.coreFeatures.value,
      },
      marketAndCustomers: {
        targetAudience: startup.customers.targetAudience?.value,
        businessModel: startup.businessModel.businessModel?.value,
        revenueModel: startup.businessModel.revenueModel?.value,
        competitors: startup.market.competitors.value,
      },
      fundingAndRoadmap: {
        fundingStage: startup.funding.fundingStage?.value,
        milestones: startup.roadmap.milestones?.value,
      },
      tokenomics: startup.tokenomics
        ? {
            tokenName: startup.tokenomics.tokenName?.value,
            tokenSymbol: startup.tokenomics.tokenSymbol?.value,
            utility: startup.tokenomics.utility?.value,
          }
        : undefined,
    };
  }
}
