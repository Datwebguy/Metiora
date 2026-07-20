import { FounderProfileAggregate, UserMemorySnapshot } from '@core/domain/user-memory.js';

export class SnapshotBuilder {
  public static buildSnapshot(profile: FounderProfileAggregate): UserMemorySnapshot {
    return {
      founderId: profile.id,
      version: profile.version,
      generatedAt: new Date().toISOString(),
      founderSummary: {
        fullName: profile.identity.fullName.value,
        preferredName: profile.identity.preferredName?.value,
        title: profile.identity.title?.value,
        bio: profile.identity.bio?.value,
        location: profile.identity.country?.value
          ? `${profile.identity.country.value} (${profile.identity.timezone?.value || 'UTC'})`
          : undefined,
      },
      professionalProfile: {
        skills: profile.professional.skills.value,
        industries: profile.professional.industries.value,
        expertise: profile.professional.areasOfExpertise.value,
      },
      strategicVision: {
        personalMission: profile.personal.personalMission?.value,
        longTermVision: profile.personal.longTermVision?.value,
        leadershipStyle: profile.personal.leadershipStyle?.value,
      },
      communicationPreferences: {
        writingStyle: profile.communication.writingStyle?.value,
        tone: profile.communication.tone?.value,
        preferredLanguage: profile.communication.preferredLanguage.value,
        documentStyle: profile.communication.documentStyle?.value,
      },
      publicProfiles: {
        websiteUrl: profile.publicPresence.websiteUrl?.value,
        twitterHandle: profile.publicPresence.twitterHandle?.value,
        linkedinUrl: profile.publicPresence.linkedinUrl?.value,
        githubUrl: profile.publicPresence.githubUrl?.value,
      },
      trackRecord: profile.history.map((entry) => ({
        type: entry.type,
        organization: entry.organizationName,
        role: entry.role,
      })),
    };
  }
}
