import { PrismaClient } from '@prisma/client';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import {
  FounderProfileAggregate,
  FounderPendingUpdateProposal,
  FounderMemoryVersionRecord,
  ApprovalStatus,
} from '@core/domain/user-memory.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';

export class PrismaUserMemoryRepository implements IUserMemoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createProfile(profile: FounderProfileAggregate): Promise<FounderProfileAggregate> {
    const snapshot = SnapshotBuilder.buildSnapshot(profile);

    const created = await this.prisma.founderProfile.create({
      data: {
        id: profile.id,
        email: profile.email,
        version: profile.version,
        identity: {
          create: {
            fullName: profile.identity.fullName.value,
            preferredName: profile.identity.preferredName?.value,
            title: profile.identity.title?.value,
            bio: profile.identity.bio?.value,
            country: profile.identity.country?.value,
            timezone: profile.identity.timezone?.value,
            confidence: profile.identity.fullName.confidence,
            source: profile.identity.fullName.source,
          },
        },
        professional: {
          create: {
            skills: profile.professional.skills.value,
            industries: profile.professional.industries.value,
            experienceYears: profile.professional.experienceYears?.value,
            areasOfExpertise: profile.professional.areasOfExpertise.value,
            certifications: profile.professional.certifications.value,
          },
        },
        personal: {
          create: {
            story: profile.personal.story?.value,
            personalMission: profile.personal.personalMission?.value,
            leadershipStyle: profile.personal.leadershipStyle?.value,
            longTermVision: profile.personal.longTermVision?.value,
          },
        },
        communication: {
          create: {
            writingStyle: profile.communication.writingStyle?.value,
            tone: profile.communication.tone?.value,
            preferredLanguage: profile.communication.preferredLanguage.value,
            documentStyle: profile.communication.documentStyle?.value,
          },
        },
        publicPresence: {
          create: {
            websiteUrl: profile.publicPresence.websiteUrl?.value,
            twitterHandle: profile.publicPresence.twitterHandle?.value,
            linkedinUrl: profile.publicPresence.linkedinUrl?.value,
            githubUrl: profile.publicPresence.githubUrl?.value,
            portfolioUrl: profile.publicPresence.portfolioUrl?.value,
          },
        },
        preferences: {
          create: {
            brandStyle: profile.preferences.brandStyle?.value,
            investorPreferences: profile.preferences.investorPreferences.value,
            grantPreferences: profile.preferences.grantPreferences.value,
          },
        },
        versions: {
          create: {
            versionNumber: profile.version,
            snapshotJson: snapshot as any,
            changeSummary: 'Initial profile creation',
          },
        },
      },
      include: {
        identity: true,
        professional: true,
        personal: true,
        communication: true,
        publicPresence: true,
        historyEntries: true,
        preferences: true,
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<FounderProfileAggregate | null> {
    const raw = await this.prisma.founderProfile.findUnique({
      where: { id },
      include: {
        identity: true,
        professional: true,
        personal: true,
        communication: true,
        publicPresence: true,
        historyEntries: true,
        preferences: true,
      },
    });

    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByEmail(email: string): Promise<FounderProfileAggregate | null> {
    const raw = await this.prisma.founderProfile.findUnique({
      where: { email },
      include: {
        identity: true,
        professional: true,
        personal: true,
        communication: true,
        publicPresence: true,
        historyEntries: true,
        preferences: true,
      },
    });

    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updateProfile(
    id: string,
    updatedProfile: FounderProfileAggregate,
    changeSummary: string
  ): Promise<FounderProfileAggregate> {
    const snapshot = SnapshotBuilder.buildSnapshot(updatedProfile);

    const updated = await this.prisma.founderProfile.update({
      where: { id },
      data: {
        version: updatedProfile.version,
        updatedAt: new Date(),
        identity: {
          update: {
            fullName: updatedProfile.identity.fullName.value,
            preferredName: updatedProfile.identity.preferredName?.value,
            title: updatedProfile.identity.title?.value,
            bio: updatedProfile.identity.bio?.value,
            country: updatedProfile.identity.country?.value,
            timezone: updatedProfile.identity.timezone?.value,
          },
        },
        professional: {
          update: {
            skills: updatedProfile.professional.skills.value,
            industries: updatedProfile.professional.industries.value,
            experienceYears: updatedProfile.professional.experienceYears?.value,
            areasOfExpertise: updatedProfile.professional.areasOfExpertise.value,
            certifications: updatedProfile.professional.certifications.value,
          },
        },
        personal: {
          update: {
            story: updatedProfile.personal.story?.value,
            personalMission: updatedProfile.personal.personalMission?.value,
            leadershipStyle: updatedProfile.personal.leadershipStyle?.value,
            longTermVision: updatedProfile.personal.longTermVision?.value,
          },
        },
        communication: {
          update: {
            writingStyle: updatedProfile.communication.writingStyle?.value,
            tone: updatedProfile.communication.tone?.value,
            preferredLanguage: updatedProfile.communication.preferredLanguage.value,
            documentStyle: updatedProfile.communication.documentStyle?.value,
          },
        },
        publicPresence: {
          update: {
            websiteUrl: updatedProfile.publicPresence.websiteUrl?.value,
            twitterHandle: updatedProfile.publicPresence.twitterHandle?.value,
            linkedinUrl: updatedProfile.publicPresence.linkedinUrl?.value,
            githubUrl: updatedProfile.publicPresence.githubUrl?.value,
            portfolioUrl: updatedProfile.publicPresence.portfolioUrl?.value,
          },
        },
        preferences: {
          update: {
            brandStyle: updatedProfile.preferences.brandStyle?.value,
            investorPreferences: updatedProfile.preferences.investorPreferences.value,
            grantPreferences: updatedProfile.preferences.grantPreferences.value,
          },
        },
        versions: {
          create: {
            versionNumber: updatedProfile.version,
            snapshotJson: snapshot as any,
            changeSummary,
          },
        },
      },
      include: {
        identity: true,
        professional: true,
        personal: true,
        communication: true,
        publicPresence: true,
        historyEntries: true,
        preferences: true,
      },
    });

    return this.mapToAggregate(updated);
  }

  public async createPendingUpdate(
    proposal: Omit<FounderPendingUpdateProposal, 'id' | 'createdAt'>
  ): Promise<FounderPendingUpdateProposal> {
    const created = await this.prisma.founderPendingUpdate.create({
      data: {
        founderProfileId: proposal.founderProfileId,
        proposedDataJson: proposal.proposedData as any,
        conflictsJson: proposal.conflicts as any,
        status: proposal.status,
        source: proposal.source,
      },
    });

    return {
      id: created.id,
      founderProfileId: created.founderProfileId,
      proposedData: created.proposedDataJson as any,
      conflicts: created.conflictsJson as any,
      status: created.status as ApprovalStatus,
      source: created.source,
      createdAt: created.createdAt,
      resolvedAt: created.resolvedAt || undefined,
    };
  }

  public async getPendingUpdateById(proposalId: string): Promise<FounderPendingUpdateProposal | null> {
    const raw = await this.prisma.founderPendingUpdate.findUnique({
      where: { id: proposalId },
    });

    if (!raw) return null;
    return {
      id: raw.id,
      founderProfileId: raw.founderProfileId,
      proposedData: raw.proposedDataJson as any,
      conflicts: raw.conflictsJson as any,
      status: raw.status as ApprovalStatus,
      source: raw.source,
      createdAt: raw.createdAt,
      resolvedAt: raw.resolvedAt || undefined,
    };
  }

  public async resolvePendingUpdate(proposalId: string, status: ApprovalStatus): Promise<FounderPendingUpdateProposal> {
    const updated = await this.prisma.founderPendingUpdate.update({
      where: { id: proposalId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      founderProfileId: updated.founderProfileId,
      proposedData: updated.proposedDataJson as any,
      conflicts: updated.conflictsJson as any,
      status: updated.status as ApprovalStatus,
      source: updated.source,
      createdAt: updated.createdAt,
      resolvedAt: updated.resolvedAt || undefined,
    };
  }

  public async getVersionHistory(founderProfileId: string): Promise<FounderMemoryVersionRecord[]> {
    const rawVersions = await this.prisma.founderMemoryVersion.findMany({
      where: { founderProfileId },
      orderBy: { versionNumber: 'desc' },
    });

    return rawVersions.map((v) => ({
      id: v.id,
      founderProfileId: v.founderProfileId,
      versionNumber: v.versionNumber,
      snapshotJson: v.snapshotJson as Record<string, unknown>,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    }));
  }

  public async searchProfiles(query: string): Promise<FounderProfileAggregate[]> {
    const rawProfiles = await this.prisma.founderProfile.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { identity: { fullName: { contains: query, mode: 'insensitive' } } },
          { identity: { title: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        identity: true,
        professional: true,
        personal: true,
        communication: true,
        publicPresence: true,
        historyEntries: true,
        preferences: true,
      },
    });

    return rawProfiles.map((raw) => this.mapToAggregate(raw));
  }

  private mapToAggregate(raw: any): FounderProfileAggregate {
    const now = raw.updatedAt || new Date();
    return {
      id: raw.id,
      email: raw.email,
      version: raw.version,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      identity: {
        fullName: { value: raw.identity?.fullName || '', confidence: raw.identity?.confidence || 'HIGH', source: raw.identity?.source || 'user_explicit', updatedAt: now },
        preferredName: raw.identity?.preferredName ? { value: raw.identity.preferredName, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        title: raw.identity?.title ? { value: raw.identity.title, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        bio: raw.identity?.bio ? { value: raw.identity.bio, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        country: raw.identity?.country ? { value: raw.identity.country, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        timezone: raw.identity?.timezone ? { value: raw.identity.timezone, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      professional: {
        skills: { value: raw.professional?.skills || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        industries: { value: raw.professional?.industries || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        experienceYears: raw.professional?.experienceYears ? { value: raw.professional.experienceYears, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        areasOfExpertise: { value: raw.professional?.areasOfExpertise || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        certifications: { value: raw.professional?.certifications || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      personal: {
        story: raw.personal?.story ? { value: raw.personal.story, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        personalMission: raw.personal?.personalMission ? { value: raw.personal.personalMission, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        leadershipStyle: raw.personal?.leadershipStyle ? { value: raw.personal.leadershipStyle, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        longTermVision: raw.personal?.longTermVision ? { value: raw.personal.longTermVision, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      communication: {
        writingStyle: raw.communication?.writingStyle ? { value: raw.communication.writingStyle, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        tone: raw.communication?.tone ? { value: raw.communication.tone, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        preferredLanguage: { value: raw.communication?.preferredLanguage || 'en', confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        documentStyle: raw.communication?.documentStyle ? { value: raw.communication.documentStyle, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      publicPresence: {
        websiteUrl: raw.publicPresence?.websiteUrl ? { value: raw.publicPresence.websiteUrl, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        twitterHandle: raw.publicPresence?.twitterHandle ? { value: raw.publicPresence.twitterHandle, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        linkedinUrl: raw.publicPresence?.linkedinUrl ? { value: raw.publicPresence.linkedinUrl, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        githubUrl: raw.publicPresence?.githubUrl ? { value: raw.publicPresence.githubUrl, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        portfolioUrl: raw.publicPresence?.portfolioUrl ? { value: raw.publicPresence.portfolioUrl, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      history: (raw.historyEntries || []).map((h: any) => ({
        id: h.id,
        type: h.type,
        organizationName: h.organizationName,
        role: h.role,
        year: h.year || undefined,
        details: h.details || undefined,
      })),
      preferences: {
        brandStyle: raw.preferences?.brandStyle ? { value: raw.preferences.brandStyle, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        investorPreferences: { value: raw.preferences?.investorPreferences || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        grantPreferences: { value: raw.preferences?.grantPreferences || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
    };
  }
}
