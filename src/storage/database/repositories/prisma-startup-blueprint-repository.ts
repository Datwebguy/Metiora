import { PrismaClient } from '@prisma/client';
import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import {
  StartupBlueprintAggregate,
  BlueprintVersionRecord,
} from '@core/domain/startup-blueprint.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';

export class PrismaStartupBlueprintRepository implements IStartupBlueprintRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createBlueprint(blueprint: StartupBlueprintAggregate): Promise<StartupBlueprintAggregate> {
    const created = await this.prisma.startupBlueprintRecord.create({
      data: {
        id: blueprint.id,
        startupProfileId: blueprint.startupProfileId,
        founderProfileId: blueprint.founderProfileId,
        version: blueprint.version,
        status: blueprint.status,
        contentJson: blueprint.content as any,
        contentMarkdown: blueprint.contentMarkdown,
        versions: {
          create: {
            versionNumber: blueprint.version,
            contentJson: blueprint.content as any,
            contentMarkdown: blueprint.contentMarkdown,
            changeSummary: 'Initial Startup Blueprint generation',
          },
        },
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<StartupBlueprintAggregate | null> {
    const raw = await this.prisma.startupBlueprintRecord.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByStartupId(startupProfileId: string): Promise<StartupBlueprintAggregate | null> {
    const raw = await this.prisma.startupBlueprintRecord.findFirst({
      where: { startupProfileId },
      orderBy: { version: 'desc' },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updateBlueprint(
    id: string,
    updated: StartupBlueprintAggregate,
    changeSummary: string
  ): Promise<StartupBlueprintAggregate> {
    const raw = await this.prisma.startupBlueprintRecord.update({
      where: { id },
      data: {
        version: updated.version,
        status: updated.status,
        contentJson: updated.content as any,
        contentMarkdown: updated.contentMarkdown,
        updatedAt: new Date(),
        versions: {
          create: {
            versionNumber: updated.version,
            contentJson: updated.content as any,
            contentMarkdown: updated.contentMarkdown,
            changeSummary,
          },
        },
      },
    });

    return this.mapToAggregate(raw);
  }

  public async getVersionHistory(blueprintId: string): Promise<BlueprintVersionRecord[]> {
    const rawVersions = await this.prisma.startupBlueprintVersion.findMany({
      where: { blueprintId },
      orderBy: { versionNumber: 'desc' },
    });

    return rawVersions.map((v) => ({
      id: v.id,
      blueprintId: v.blueprintId,
      versionNumber: v.versionNumber,
      contentJson: v.contentJson as any,
      contentMarkdown: v.contentMarkdown,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    }));
  }

  private mapToAggregate(raw: any): StartupBlueprintAggregate {
    return {
      id: raw.id,
      startupProfileId: raw.startupProfileId,
      founderProfileId: raw.founderProfileId,
      version: raw.version,
      status: raw.status as ApprovalStatus,
      content: raw.contentJson as any,
      contentMarkdown: raw.contentMarkdown,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
