import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { StartupBlueprintContent } from '@core/domain/startup-blueprint.js';

export class BlueprintGenerator {
  public generateContent(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): StartupBlueprintContent {
    return {
      executiveSummary: {
        startupName: startupSnapshot.companyProfile.name,
        tagline: startupSnapshot.companyProfile.tagline || 'Enduring Business Infrastructure',
        oneSentenceDescription:
          startupSnapshot.companyProfile.oneSentenceDescription ||
          `${startupSnapshot.companyProfile.name} provides next-generation solutions in ${startupSnapshot.companyProfile.industry}.`,
        industry: startupSnapshot.companyProfile.industry,
        stage: startupSnapshot.companyProfile.stage,
        executiveOverview: `${startupSnapshot.companyProfile.name} is founded by ${userSnapshot.founderSummary.fullName || 'the founding team'} to build an enduring enterprise in ${startupSnapshot.companyProfile.industry}.`,
      },
      problem: {
        problemStatement:
          startupSnapshot.problemAndSolution.problemStatement || 'Target customers face inefficiency in legacy market workflow.',
        marketPainPoints: [
          'High operational inefficiency and manual effort.',
          'Fragmented tools without unified persistent memory.',
        ],
        existingAlternatives: startupSnapshot.marketAndCustomers.competitors || ['Manual legacy solutions', 'Generic tools'],
      },
      solution: {
        productDescription:
          startupSnapshot.problemAndSolution.productDescription || 'Unified autonomous platform delivering strategic business workflow.',
        uniqueValueProp:
          startupSnapshot.problemAndSolution.uniqueValueProp || 'Persistent context retention and end-to-end alignment.',
        competitiveAdvantage: 'Proprietary Company Memory Architecture.',
        coreFeatures: startupSnapshot.problemAndSolution.coreFeatures.length > 0
          ? startupSnapshot.problemAndSolution.coreFeatures
          : ['Persistent Company Memory', 'Strategic Intelligence', 'Automated Asset Generation'],
      },
      businessModel: {
        businessModel: startupSnapshot.marketAndCustomers.businessModel || 'B2B SaaS / Escrow Agent Marketplace',
        revenueModel: startupSnapshot.marketAndCustomers.revenueModel || 'Subscription & Transaction Fees',
        pricingStrategy: 'Tiered Enterprise & Per-Task Pricing',
        salesStrategy: 'Direct Ecosystem Partnership & Outbound',
        distributionStrategy: 'Marketplace Integration & Partner Ecosystem',
      },
      roadmap: {
        currentStage: startupSnapshot.companyProfile.stage,
        keyMilestones: [
          { milestone: 'Foundation & Core Architecture', targetQuarter: 'Q1', status: 'COMPLETED' },
          { milestone: 'MVP Launch & Initial Traction', targetQuarter: 'Q2', status: 'IN_PROGRESS' },
          { milestone: 'Ecosystem Scale & Expansion', targetQuarter: 'Q3', status: 'PLANNED' },
        ],
        upcomingReleases: ['v1.0 Canonical Blueprint Engine', 'A2A Marketplace Protocol Integration'],
      },
      riskAssessment: {
        identifiedRisks: [
          'Rapid competitor movement in AI developer tools.',
          'Ecosystem integration delays.',
        ],
        mitigationStrategies: [
          'Focus on proprietary Company Memory defensibility.',
          'Decoupled architecture for rapid multi-platform integration.',
        ],
      },
      growthStrategy: {
        targetCustomers: startupSnapshot.marketAndCustomers.targetAudience || 'Startup Founders & Enterprise Builders',
        marketOpportunity: `Expanding global market opportunity in ${startupSnapshot.companyProfile.industry}.`,
        goToMarketStrategy: 'Ecosystem partnerships, community advocacy, and direct founder outreach.',
        successMetrics: ['Monthly Active Startups (MAS)', 'Asset Generation Throughput', 'Memory Retention Rate'],
      },
    };
  }

  public generateMarkdown(content: StartupBlueprintContent): string {
    return `# ${content.executiveSummary.startupName} — Canonical Startup Blueprint

> **Industry**: ${content.executiveSummary.industry} | **Stage**: ${content.executiveSummary.stage}  
> **Tagline**: ${content.executiveSummary.tagline}

---

## 1. Executive Summary
${content.executiveSummary.oneSentenceDescription}

${content.executiveSummary.executiveOverview}

---

## 2. Problem Statement
${content.problem.problemStatement}

### Key Market Pain Points
${content.problem.marketPainPoints.map((p) => `- ${p}`).join('\n')}

### Existing Alternatives
${content.problem.existingAlternatives.map((a) => `- ${a}`).join('\n')}

---

## 3. Proposed Solution
${content.solution.productDescription}

* **Unique Value Proposition**: ${content.solution.uniqueValueProp}
* **Competitive Advantage**: ${content.solution.competitiveAdvantage}

### Core Features
${content.solution.coreFeatures.map((f) => `- ${f}`).join('\n')}

---

## 4. Business & Revenue Model
* **Business Model**: ${content.businessModel.businessModel}
* **Revenue Model**: ${content.businessModel.revenueModel || 'N/A'}
* **Pricing Strategy**: ${content.businessModel.pricingStrategy || 'N/A'}
* **Distribution Strategy**: ${content.businessModel.distributionStrategy || 'N/A'}

---

## 5. Target Customers & Growth Strategy
* **Target Customers**: ${content.growthStrategy.targetCustomers}
* **Market Opportunity**: ${content.growthStrategy.marketOpportunity}
* **Go-To-Market Strategy**: ${content.growthStrategy.goToMarketStrategy}

### Key Success Metrics
${content.growthStrategy.successMetrics.map((m) => `- ${m}`).join('\n')}

---

## 6. Product Roadmap & Milestones
* **Current Stage**: ${content.roadmap.currentStage}

### Key Milestones
${content.roadmap.keyMilestones.map((m) => `- **[${m.targetQuarter || 'TBD'}]** ${m.milestone} (${m.status || 'PLANNED'})`).join('\n')}

---

## 7. Risk Assessment & Mitigation
${content.riskAssessment.identifiedRisks.map((r, i) => `- **Risk**: ${r}\n  *Mitigation*: ${content.riskAssessment.mitigationStrategies[i] || 'Proactive monitoring'}`).join('\n')}
`;
  }
}
