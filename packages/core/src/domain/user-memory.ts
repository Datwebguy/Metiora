export interface UserMemoryProfile {
  founderId: string;
  fullName: string;
  bio?: string;
  skills: string[];
  writingPreferences: {
    tone: string;
    formality: 'casual' | 'professional' | 'executive';
    vocabularyPreference?: string[];
  };
  portfolioUrls: string[];
  socialProfiles: Record<string, string>;
  previousFounderHistory: {
    companyName: string;
    role: string;
    outcome?: string;
  }[];
}
