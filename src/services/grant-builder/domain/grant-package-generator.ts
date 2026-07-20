import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { GrantPackageContent } from '@core/domain/grant-builder.js';

export class GrantPackageGenerator {
  public generateContent(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): GrantPackageContent {
    const startupName = startupSnapshot.companyProfile.name;

    return {
      projectDescription: {
        projectTitle: `${startupName} — Ecosystem Innovation & Infrastructure Grant Proposal`,
        executiveSummary: `${startupName} is developing open, persistent business infrastructure for the AI ecosystem.`,
        problemStatement:
          startupSnapshot.problemAndSolution.problemStatement ||
          'Founders lack persistent operating memory, leading to context loss and operational waste.',
        proposedSolution:
          startupSnapshot.problemAndSolution.productDescription ||
          'Autonomous workspace with persistent Company Memory architecture.',
        technicalOverview:
          'Decoupled, modular architecture supporting multi-turn conversational reasoning, versioned memory aggregates, and A2A protocol integration.',
      },
      innovation: {
        noveltyDescription: 'First-of-its-kind persistent Company Memory aggregate replacing transient one-off AI chat sessions.',
        technicalBreakthrough: 'Deterministic snapshot serialization combined with dynamic field conflict detection.',
        competitiveDifferentiation: 'Persistent context retention across all company lifecycle stages.',
      },
      impact: {
        targetBeneficiaries: startupSnapshot.marketAndCustomers.targetAudience || 'Startup Founders, Developers, and Ecosystem Builders',
        communityEcosystemImpact: 'Accelerates startup creation speed by 10x while standardizing business asset quality.',
        economicOrSocialValue: 'Reduces startup failure rates by maintaining institutional knowledge continuity.',
      },
      budgetNarrative: {
        requestedAmount: '$100,000',
        fundingDurationMonths: 12,
        categoryBreakdown: [
          { category: 'AI Architecture Development', amount: '$50,000', justification: 'Core memory engine and snapshot builder optimization' },
          { category: 'Security & Escrow Integration', amount: '$30,000', justification: 'A2A protocol escrow security audit and testing' },
          { category: 'Developer Documentation & Outreach', amount: '$20,000', justification: 'Open documentation and developer SDK tools' },
        ],
        sustainabilityPlan: 'Post-grant milestone sustainability will be driven by ASP transaction fees on the OKX.AI Marketplace.',
      },
      milestonePlan: {
        milestones: [
          { title: 'Milestone 1: Core Protocol Integration', targetMonth: 3, deliverable: 'Open API Endpoints & Memory Sync', kpi: '100% test pass rate' },
          { title: 'Milestone 2: Ecosystem Beta Launch', targetMonth: 6, deliverable: 'Public Beta Release', kpi: '50 Active Startup Profiles' },
          { title: 'Milestone 3: Full Production Release', targetMonth: 12, deliverable: 'Complete A2A Marketplace Launch', kpi: '500+ Assets Generated' },
        ],
        successMetrics: ['Total Active Startup Memories', 'Asset Generation Throughput', 'System Uptime'],
      },
      riskAssessment: {
        technicalRisks: ['Latency overhead during complex multi-step memory synchronization'],
        operationalRisks: ['Ecosystem API schema revisions'],
        mitigationPlans: ['Implement aggressive caching and stateless REST decouplers'],
      },
      teamOverview: [
        {
          name: userSnapshot.founderSummary.fullName || 'Lead Founder',
          role: 'Lead Architect & Chief Executive',
          bio: 'Experienced startup operator specializing in AI agent systems.',
        },
      ],
      supportingNarrative: `${startupName} is uniquely positioned to deliver this technical breakthrough given its completed Foundation, Memory, BI, and Conversation Engine architecture.`,
    };
  }

  public generateMarkdown(content: GrantPackageContent): string {
    return `# ${content.projectDescription.projectTitle}

> **Requested Grant**: ${content.budgetNarrative.requestedAmount} | **Duration**: ${content.budgetNarrative.fundingDurationMonths} Months  
> **Lead Applicant**: ${content.teamOverview[0]?.name || 'Founding Team'}

---

## 1. Executive Summary & Project Description
${content.projectDescription.executiveSummary}

* **Problem Statement**: ${content.projectDescription.problemStatement}
* **Proposed Solution**: ${content.projectDescription.proposedSolution}

---

## 2. Technical Innovation & Novelty
${content.innovation.noveltyDescription}

* **Technical Breakthrough**: ${content.innovation.technicalBreakthrough}
* **Competitive Differentiation**: ${content.innovation.competitiveDifferentiation}

---

## 3. Community & Ecosystem Impact
* **Target Beneficiaries**: ${content.impact.targetBeneficiaries}
* **Ecosystem Impact**: ${content.impact.communityEcosystemImpact}
* **Economic Value**: ${content.impact.economicOrSocialValue}

---

## 4. Budget & Use of Funds
* **Requested Amount**: ${content.budgetNarrative.requestedAmount}
* **Duration**: ${content.budgetNarrative.fundingDurationMonths} Months

### Category Breakdown
${content.budgetNarrative.categoryBreakdown.map((b) => `- **${b.category}** (${b.amount}): ${b.justification}`).join('\n')}

* **Sustainability Plan**: ${content.budgetNarrative.sustainabilityPlan}

---

## 5. Milestone Plan & KPIs
${content.milestonePlan.milestones.map((m) => `- **[Month ${m.targetMonth}]** ${m.title}: ${m.deliverable} *(KPI: ${m.kpi})*`).join('\n')}

---

## 6. Risk Assessment & Mitigation
${content.riskAssessment.technicalRisks.map((r, i) => `- **Risk**: ${r}\n  *Mitigation*: ${content.riskAssessment.mitigationPlans[i] || 'Proactive monitoring'}`).join('\n')}
`;
  }
}
