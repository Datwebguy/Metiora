import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { InvestorPackageContent } from '@core/domain/investor-ready.js';

export class PackageGenerator {
  public generateContent(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): InvestorPackageContent {
    const startupName = startupSnapshot.companyProfile.name;

    return {
      executiveSummary: {
        companyName: startupName,
        tagline: startupSnapshot.companyProfile.tagline || 'Persistent Operating Partner for Startups',
        oneSentenceDescription:
          startupSnapshot.companyProfile.oneSentenceDescription ||
          `${startupName} provides persistent Company Memory and strategic AI operating services.`,
        industry: startupSnapshot.companyProfile.industry,
        stage: startupSnapshot.companyProfile.stage,
        summaryText: `${startupName} is building the definitive operating workspace for founders.`,
      },
      investmentMemo: {
        thesis: `Category-defining market opportunity in ${startupSnapshot.companyProfile.industry}.`,
        marketProblem:
          startupSnapshot.problemAndSolution.problemStatement ||
          'Founders waste thousands of hours repeating company context to isolated tools.',
        solutionOverview:
          startupSnapshot.problemAndSolution.productDescription ||
          'Persistent Company Memory architecture driving end-to-end asset creation.',
        marketSize: `$50B+ global software & professional service market in ${startupSnapshot.companyProfile.industry}.`,
        competitiveAdvantage:
          startupSnapshot.problemAndSolution.uniqueValueProp ||
          'Persistent memory retention and A2A marketplace integration.',
        businessModel: startupSnapshot.marketAndCustomers.businessModel || 'ASP Marketplace Escrow Model',
        financialProjectionsSummary: 'Projected 3x YoY growth with strong unit economics on per-task escrow transactions.',
      },
      onePageOverview: {
        headline: `${startupName} — ${startupSnapshot.companyProfile.tagline || 'Startup Operating System'}`,
        keyHighlights: [
          'Proprietary Persistent Company Memory Architecture',
          'A2A Agent Service Provider model for OKX.AI Marketplace',
          'Proven multi-turn conversational reasoning engine',
        ],
        productOverview: startupSnapshot.problemAndSolution.productDescription || 'Autonomous strategic workspace.',
        targetMarket: startupSnapshot.marketAndCustomers.targetAudience || 'Startup Founders & Accelerators',
      },
      narrative: {
        founderStory: `${userSnapshot.founderSummary.fullName || 'Founding team'} experienced context fragmentation firsthand building previous startups.`,
        visionNarrative: 'Turn ideas into enduring companies through persistent AI partnership.',
        whyNow: 'Advancements in LLM agent orchestration enable persistent context retention over one-off chatbots.',
      },
      fundingAsk: {
        targetRaiseAmount: '$1,500,000',
        valuationCap: '$10,000,000 SAFE',
        fundingRoundStage: startupSnapshot.companyProfile.stage === 'IDEATION' ? 'PRE-SEED' : 'SEED',
        useOfFundsBreakdown: [
          { category: 'Product & AI Engineering', percentage: 50, description: 'Core engine optimization and marketplace integration' },
          { category: 'Ecosystem & Growth', percentage: 30, description: 'Founder onboarding and partner integrations' },
          { category: 'Operations & Legal', percentage: 20, description: 'Escrow compliance and operating reserve' },
        ],
        runwayMonths: 18,
      },
      traction: {
        currentStage: startupSnapshot.companyProfile.stage,
        milestonesAchieved: [
          'Foundation & Memory Engines Completed',
          'Business Intelligence & Conversation Engine Operational',
          'Canonical Startup Blueprint Service Released',
        ],
        keyMetrics: [
          { metricName: 'Stage', value: startupSnapshot.companyProfile.stage },
          { metricName: 'Memory Version', value: `v${startupSnapshot.version}` },
        ],
      },
      growthStrategy: {
        customerAcquisitionChannels: ['OKX.AI Marketplace', 'Ecosystem Accelerators', 'Direct Founder Outreach'],
        growthMilestones: ['100 Active Startups in Memory', '1,000 Asset Generations', 'Top Tier ASP Marketplace Rating'],
        scalingStrategy: 'Scale A2A marketplace integrations and expand domain service offerings.',
      },
      riskAnalysis: {
        marketRisks: ['Competitive entry from generic LLM wrappers'],
        executionRisks: ['Integration dependencies with marketplace escrow protocols'],
        mitigationPlans: ['Focus on proprietary memory retention defensibility and rapid execution'],
      },
      investorFaq: [
        {
          question: 'What makes Metiora defensible against ChatGPT or Claude?',
          answer: 'Metiora builds a persistent Company Memory aggregate. Every asset evolves with the startup instead of starting from zero.',
        },
        {
          question: 'How does Metiora generate revenue?',
          answer: 'Metiora operates as an Agent Service Provider (ASP) on the OKX.AI Marketplace with per-task escrow revenue.',
        },
      ],
      investmentHighlights: [
        'Persistent Company Memory Defensibility',
        'Headless A2A Marketplace Architecture',
        'Experienced Founding Team',
      ],
    };
  }

  public generateMarkdown(content: InvestorPackageContent): string {
    return `# ${content.executiveSummary.companyName} — Investment Memo & Investor Package

> **Industry**: ${content.executiveSummary.industry} | **Round**: ${content.fundingAsk.fundingRoundStage}  
> **Target Raise**: ${content.fundingAsk.targetRaiseAmount} (${content.fundingAsk.valuationCap || 'Cap TBD'})  
> **Tagline**: ${content.executiveSummary.tagline}

---

## 1. Executive Summary
${content.executiveSummary.summaryText}

* **One Sentence Description**: ${content.executiveSummary.oneSentenceDescription}

---

## 2. Investment Thesis
${content.investmentMemo.thesis}

### Market Opportunity & Problem
* **Problem**: ${content.investmentMemo.marketProblem}
* **Market Size**: ${content.investmentMemo.marketSize}

### Solution & Competitive Advantage
* **Solution**: ${content.investmentMemo.solutionOverview}
* **Competitive Advantage**: ${content.investmentMemo.competitiveAdvantage}

---

## 3. Financial Ask & Use of Funds
* **Target Raise**: ${content.fundingAsk.targetRaiseAmount}
* **Runway**: ${content.fundingAsk.runwayMonths} Months

### Use of Funds Breakdown
${content.fundingAsk.useOfFundsBreakdown.map((u) => `- **${u.category}** (${u.percentage}%): ${u.description}`).join('\n')}

---

## 4. Traction & Milestones
* **Current Stage**: ${content.traction.currentStage}

### Key Milestones Achieved
${content.traction.milestonesAchieved.map((m) => `- ${m}`).join('\n')}

---

## 5. Risk Analysis & Mitigation
${content.riskAnalysis.marketRisks.map((r, i) => `- **Market Risk**: ${r}\n  *Mitigation*: ${content.riskAnalysis.mitigationPlans[i] || 'Proactive monitoring'}`).join('\n')}

---

## 6. Investor FAQ
${content.investorFaq.map((faq) => `### Q: ${faq.question}\n**A**: ${faq.answer}`).join('\n\n')}
`;
  }
}
