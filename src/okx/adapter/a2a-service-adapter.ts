import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { CreateStartupBlueprint } from '../../services/startup-blueprint/use-cases/create-startup-blueprint.js';
import { GenerateInvestorPackage } from '../../services/investor-ready/use-cases/generate-investor-package.js';
import { GenerateGrantPackage } from '../../services/grant-builder/use-cases/generate-grant-package.js';
import { GeneratePartnershipPackage } from '../../services/partnership-studio/use-cases/generate-partnership-package.js';
import { GenerateTokenLaunchKit } from '../../services/token-launch-kit/use-cases/generate-token-launch-kit.js';
import { GenerateHealthReport } from '../../services/startup-health/use-cases/generate-health-report.js';
import { OkxServiceType } from '@core/domain/okx-integration.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { SnapshotBuilder } from '../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { PackageLlmComposer } from '../../ai/package-llm-composer.js';
import type { PackageAiRuntime } from '../../ai/resolve-package-ai.js';

export class A2aServiceAdapter {
  private createBlueprint?: CreateStartupBlueprint;
  private generateInvestor?: GenerateInvestorPackage;
  private generateGrant?: GenerateGrantPackage;
  private generatePartnership?: GeneratePartnershipPackage;
  private generateToken?: GenerateTokenLaunchKit;
  private generateHealth?: GenerateHealthReport;
  private readonly composer: PackageLlmComposer;
  private readonly userRepo: IUserMemoryRepository;
  private readonly startupRepo: IStartupMemoryRepository;
  private readonly aiRuntime: PackageAiRuntime;

  constructor(
    userRepo: IUserMemoryRepository,
    startupRepo: IStartupMemoryRepository,
    blueprintRepo?: IStartupBlueprintRepository,
    investorRepo?: IInvestorReadyRepository,
    grantRepo?: IGrantBuilderRepository,
    partnershipRepo?: IPartnershipStudioRepository,
    tokenRepo?: ITokenLaunchKitRepository,
    healthRepo?: IStartupHealthRepository,
    packageAi?: PackageAiRuntime,
    log?: { warn: (o: unknown, msg: string) => void; info?: (o: unknown, msg: string) => void }
  ) {
    this.userRepo = userRepo;
    this.startupRepo = startupRepo;
    this.aiRuntime = packageAi ?? {
      enabled: false,
      provider: null,
      model: '',
      timeoutMs: 28_000,
      reasonDisabled: 'not_configured',
    };
    this.composer = new PackageLlmComposer(
      this.aiRuntime.enabled ? this.aiRuntime.provider : null,
      this.aiRuntime.model,
      this.aiRuntime.timeoutMs,
      log
    );

    if (blueprintRepo) {
      this.createBlueprint = new CreateStartupBlueprint(blueprintRepo, userRepo, startupRepo);
    }
    if (investorRepo) {
      this.generateInvestor = new GenerateInvestorPackage(investorRepo, userRepo, startupRepo);
    }
    if (grantRepo) {
      this.generateGrant = new GenerateGrantPackage(grantRepo, userRepo, startupRepo);
    }
    if (partnershipRepo) {
      this.generatePartnership = new GeneratePartnershipPackage(partnershipRepo, userRepo, startupRepo);
    }
    if (tokenRepo) {
      this.generateToken = new GenerateTokenLaunchKit(tokenRepo, userRepo, startupRepo);
    }
    if (healthRepo) {
      this.generateHealth = new GenerateHealthReport(healthRepo, userRepo, startupRepo);
    }
  }

  public getAiStatus(): {
    llmEnabled: boolean;
    model?: string;
    providerId?: string;
    reasonDisabled?: string;
  } {
    return {
      llmEnabled: this.aiRuntime.enabled && Boolean(this.aiRuntime.provider),
      model: this.aiRuntime.enabled ? this.aiRuntime.model : undefined,
      providerId: this.aiRuntime.provider?.providerId,
      reasonDisabled: this.aiRuntime.reasonDisabled,
    };
  }

  public async executeService(
    serviceType: OkxServiceType,
    founderProfileId: string,
    startupProfileId: string,
    blueprintId?: string
  ): Promise<{
    contentJson: Record<string, unknown>;
    contentMarkdown: string;
    generation: { mode: 'llm' | 'template'; providerId?: string; model?: string; reason?: string };
  }> {
    const template = await this.runTemplate(serviceType, founderProfileId, startupProfileId, blueprintId);

    const founder = await this.userRepo.findById(founderProfileId);
    const startup = await this.startupRepo.findById(startupProfileId);
    if (!founder || !startup) {
      return {
        ...template,
        contentJson: { ...template.contentJson, generation: { mode: 'template' } },
        generation: { mode: 'template', reason: 'memory_missing_for_enrichment' },
      };
    }

    const founderSnap = SnapshotBuilder.buildSnapshot(founder);
    const startupSnap = StartupSnapshotBuilder.buildSnapshot(startup);

    const enriched = await this.composer.compose({
      serviceType,
      founder: founderSnap,
      startup: startupSnap,
      templateContentJson: template.contentJson,
      templateMarkdown: template.contentMarkdown,
    });

    return {
      contentJson: enriched.contentJson,
      contentMarkdown: enriched.contentMarkdown,
      generation: enriched.generation,
    };
  }

  private async runTemplate(
    serviceType: OkxServiceType,
    founderProfileId: string,
    startupProfileId: string,
    blueprintId?: string
  ): Promise<{ contentJson: Record<string, unknown>; contentMarkdown: string }> {
    switch (serviceType) {
      case 'startup_blueprint': {
        if (!this.createBlueprint) throw new ApplicationError('Startup Blueprint service not configured.');
        const result = await this.createBlueprint.execute({ founderProfileId, startupProfileId });
        return {
          contentJson: result.content as unknown as Record<string, unknown>,
          contentMarkdown: result.contentMarkdown,
        };
      }
      case 'investor_ready': {
        if (!this.generateInvestor) throw new ApplicationError('Investor Ready service not configured.');
        const result = await this.generateInvestor.execute({
          founderProfileId,
          startupProfileId,
          blueprintId,
        });
        return {
          contentJson: result.content as unknown as Record<string, unknown>,
          contentMarkdown: result.contentMarkdown,
        };
      }
      case 'grant_builder': {
        if (!this.generateGrant) throw new ApplicationError('Grant Builder service not configured.');
        const result = await this.generateGrant.execute({
          founderProfileId,
          startupProfileId,
          blueprintId,
        });
        return {
          contentJson: result.content as unknown as Record<string, unknown>,
          contentMarkdown: result.contentMarkdown,
        };
      }
      case 'partnership_studio': {
        if (!this.generatePartnership) {
          throw new ApplicationError('Partnership Studio service not configured.');
        }
        const result = await this.generatePartnership.execute({
          founderProfileId,
          startupProfileId,
          blueprintId,
        });
        return {
          contentJson: result.content as unknown as Record<string, unknown>,
          contentMarkdown: result.contentMarkdown,
        };
      }
      case 'token_launch_kit': {
        if (!this.generateToken) throw new ApplicationError('Token Launch Kit service not configured.');
        const result = await this.generateToken.execute({
          founderProfileId,
          startupProfileId,
          blueprintId,
        });
        return {
          contentJson: result.content as unknown as Record<string, unknown>,
          contentMarkdown: result.contentMarkdown,
        };
      }
      case 'startup_health': {
        if (!this.generateHealth) throw new ApplicationError('Startup Health service not configured.');
        const result = await this.generateHealth.execute({
          founderProfileId,
          startupProfileId,
          blueprintId,
        });
        return {
          contentJson: {
            ...(result.content as unknown as Record<string, unknown>),
            overallScore: result.overallScore,
            categoryScores: result.categoryScores,
          },
          contentMarkdown: result.contentMarkdown,
        };
      }
      default:
        throw new ApplicationError(`Unsupported service type '${serviceType}'.`);
    }
  }
}
