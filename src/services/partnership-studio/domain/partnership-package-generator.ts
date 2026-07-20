import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { PartnershipPackageContent, PartnershipCategory } from '@core/domain/partnership-studio.js';

export class PartnershipPackageGenerator {
  public generateContent(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot,
    category: PartnershipCategory = 'STRATEGIC_ALLIANCE'
  ): PartnershipPackageContent {
    const startupName = startupSnapshot.companyProfile.name;
    const leadContact = userSnapshot.founderSummary.fullName || 'Metiora Executive Operations';

    return {
      category,
      strategy: {
        category,
        objective: `Accelerate adoption of ${startupName} through ${category.toLowerCase()} collaboration.`,
        targetPartnerTypes: ['Ecosystem Marketplaces', 'Enterprise Software Providers', 'Developer Platforms'],
        strategicGoals: ['Expand distribution reach', 'Enhance product capabilities', 'Co-marketing synergy'],
      },
      partnerProfile: {
        idealPartnerIndustry: startupSnapshot.companyProfile.industry,
        partnerCompanySize: 'Mid-Market to Enterprise',
        keyRequirements: ['API/Protocol integration support', 'Shared target developer/founder audience'],
        synergyFactors: ['Complementary product ecosystem', 'Aligned growth strategy'],
      },
      proposal: {
        title: `${startupName} & Partner Strategic ${category} Proposal`,
        executiveSummary: `${startupName} proposes a strategic ${category.toLowerCase()} partnership to deliver persistent AI operating capabilities to shared ecosystem builders. Executive lead: ${leadContact}.`,
        proposedCollaboration: `Integration of ${startupName}'s persistent Company Memory engine into partner workflow interfaces.`,
        valueProposition:
          startupSnapshot.problemAndSolution.uniqueValueProp ||
          'Persistent context retention eliminating context loss in user workflows.',
        mutualBenefits: [
          'Increased user retention through persistent memory retention',
          'Shared ecosystem revenue and cross-channel promotion',
          'Joint technical innovation leadership',
        ],
      },
      executiveBrief: {
        headline: `Strategic ${category} Partnership Brief: ${startupName}`,
        companyOverview: `${startupName} is an AI operating workspace for startup builders.`,
        collaborationHighlights: [
          'Zero-friction API integration',
          'Dual revenue sharing & escrow safety',
          'Joint ecosystem launch announcement',
        ],
      },
      benefitsAnalysis: {
        benefitsToStartup: ['Expanded distribution channel', 'Increased brand credibility'],
        benefitsToPartner: ['Added persistent memory feature set', 'Higher user engagement'],
        sharedEcosystemValue: 'Standardizes high-quality persistent context retention across the ecosystem.',
      },
      integrationPlan: {
        technicalRequirements: ['REST API authentication', 'Webhooks for real-time memory event dispatch'],
        workflowIntegration: 'Direct REST endpoint binding into partner dashboard UI.',
        launchTimelineMonths: 3,
      },
      outreachLetter: {
        subjectLine: `Strategic ${category} Opportunity: ${startupName} x Partner`,
        emailBody: `Hi [Partner Executive],\n\nI am reaching out from ${startupName}. We have built a persistent Company Memory architecture that aligns closely with your platform ecosystem.\n\nBest regards,\n${leadContact}`,
        callToAction: 'Are you open to a brief 15-minute introductory call next week?',
      },
      collaborationRoadmap: {
        phases: [
          { phaseName: 'Phase 1: Alignment & Agreement', durationWeeks: 2, milestone: 'Partnership MoU Executed' },
          { phaseName: 'Phase 2: Technical Integration', durationWeeks: 4, milestone: 'API Integration Complete' },
          { phaseName: 'Phase 3: Joint Co-Marketing & Launch', durationWeeks: 2, milestone: 'Public Press Release & Launch' },
        ],
      },
      faq: [
        {
          question: `How does the ${category.toLowerCase()} integration work?`,
          answer: `The integration operates statelessly via Metiora's REST API, referencing persistent Company Memory snapshots.`,
        },
      ],
      riskAssessment: {
        operationalRisks: ['Integration timeline slippage'],
        strategicRisks: ['Brand alignment perception'],
        mitigationPlans: ['Dedicated technical partner success manager and clear milestone SLAs'],
      },
    };
  }

  public generateMarkdown(content: PartnershipPackageContent): string {
    return `# ${content.proposal.title}

> **Category**: ${content.category} | **Target Partner**: ${content.partnerProfile.partnerCompanySize} (${content.partnerProfile.idealPartnerIndustry})  
> **Executive Contact**: Metiora Strategic Operations

---

## 1. Executive Summary & Partnership Brief
${content.proposal.executiveSummary}

* **Proposed Collaboration**: ${content.proposal.proposedCollaboration}
* **Value Proposition**: ${content.proposal.valueProposition}

---

## 2. Strategic Objectives & Mutual Benefits
* **Objective**: ${content.strategy.objective}

### Benefits to Partner
${content.benefitsAnalysis.benefitsToPartner.map((b) => `- ${b}`).join('\n')}

### Benefits to Startup
${content.benefitsAnalysis.benefitsToStartup.map((b) => `- ${b}`).join('\n')}

* **Shared Ecosystem Value**: ${content.benefitsAnalysis.sharedEcosystemValue}

---

## 3. Ideal Partner Profile
* **Industry**: ${content.partnerProfile.idealPartnerIndustry}
* **Company Size**: ${content.partnerProfile.partnerCompanySize}

### Key Requirements
${content.partnerProfile.keyRequirements.map((r) => `- ${r}`).join('\n')}

---

## 4. Technical Integration Plan
* **Workflow Integration**: ${content.integrationPlan.workflowIntegration}
* **Estimated Launch Timeline**: ${content.integrationPlan.launchTimelineMonths} Months

### Technical Requirements
${content.integrationPlan.technicalRequirements.map((t) => `- ${t}`).join('\n')}

---

## 5. Collaboration Roadmap
${content.collaborationRoadmap.phases.map((p) => `- **${p.phaseName}** (${p.durationWeeks} weeks): ${p.milestone}`).join('\n')}

---

## 6. Outreach Email Template
**Subject**: ${content.outreachLetter.subjectLine}

\`\`\`
${content.outreachLetter.emailBody}

${content.outreachLetter.callToAction}
\`\`\`
`;
  }
}
