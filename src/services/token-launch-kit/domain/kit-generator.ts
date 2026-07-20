import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { TokenLaunchKitContent } from '@core/domain/token-launch-kit.js';

export class KitGenerator {
  public generateContent(
    startupSnapshot: StartupMemorySnapshot,
    _userSnapshot: UserMemorySnapshot,
    isAppropriate: boolean = true
  ): TokenLaunchKitContent {
    const startupName = startupSnapshot.companyProfile.name;
    const tokenSymbol = startupSnapshot.tokenomics?.tokenSymbol || 'METI';
    const tokenName = startupSnapshot.tokenomics?.tokenName || `${startupName} Protocol Token`;

    return {
      isAppropriate,
      strategy: {
        tokenName,
        tokenSymbol,
        primaryPurpose: 'Decentralized protocol access, escrow staking, and governance alignment.',
        tokenType: 'HYBRID',
        targetEcosystem: 'EVM & OKX Ecosystem Networks',
      },
      utilityModel: {
        coreUtilities: [
          'Fee discounts on ASP marketplace transactions',
          'Staking for high-reputation agent node execution',
          'Protocol governance voting rights',
        ],
        stakingMechanisms: 'Tiered staking pools with locked yield multipliers.',
        feeDiscountsOrBurn: '20% of protocol fees burned quarterly based on marketplace escrow volume.',
        accessOrPrivileges: 'Tier 3 governance access and early feature preview privileges.',
      },
      supplyStrategy: {
        totalSupply: '100,000,000',
        initialCirculatingSupply: '15,000,000',
        inflationOrDeflationModel: 'Deflationary via quarterly protocol fee burns.',
        mintBurnMechanics: 'Fixed hard cap supply; programmatic burn mechanism on marketplace settlement.',
      },
      distributionStrategy: {
        allocations: [
          { category: 'Ecosystem & Community Rewards', percentage: 40, vestingPeriodMonths: 36, lockupMonths: 0 },
          { category: 'Core Team & Contributors', percentage: 20, vestingPeriodMonths: 24, lockupMonths: 12 },
          { category: 'Strategic Investors', percentage: 15, vestingPeriodMonths: 18, lockupMonths: 6 },
          { category: 'Protocol Treasury', percentage: 15, vestingPeriodMonths: 48, lockupMonths: 0 },
          { category: 'Initial Liquidity', percentage: 10, vestingPeriodMonths: 0, lockupMonths: 0 },
        ],
        publicSaleStrategy: 'Initial DEX/CEX Listing following security audits.',
        airdropStrategy: 'Retroactive airdrop for early active startup memory creators.',
      },
      governanceModel: {
        governanceScope: 'Protocol fee parameters, new ASP service approvals, treasury grant allocations.',
        votingMechanics: '1 Token = 1 Vote with time-weighted quadratic voting multiplier.',
        daoTransitionPlan: 'Progressive decentralization over 24 months post TGE.',
      },
      treasuryStrategy: {
        treasuryAllocationPercentage: 15,
        grantProgramBudget: '5,000,000 Tokens allocated for ecosystem developer grants.',
        reserveManagementStrategy: 'Multi-sig treasury controlled by foundation council.',
      },
      incentiveModel: {
        userIncentives: ['Fee rebates for maintaining active startup profiles'],
        developerIncentives: ['Bounties for extending Metiora ASP service modules'],
        liquidityIncentives: 'LP staking rewards on decentralized exchanges',
      },
      launchRoadmap: {
        phases: [
          { phaseName: 'Phase 1: Tokenomics & Security Audit', targetQuarter: 'Q2', milestone: 'Audit Report Released' },
          { phaseName: 'Phase 2: Testnet Staking & Airdrop', targetQuarter: 'Q3', milestone: 'Public Testnet Live' },
          { phaseName: 'Phase 3: TGE & Exchange Listing', targetQuarter: 'Q4', milestone: 'Token Generation Event' },
        ],
      },
      riskAssessment: {
        regulatoryRisks: ['Evolving global crypto asset regulatory frameworks'],
        economicSecurityRisks: ['Liquidity volatility and market manipulation risks'],
        mitigationPlans: ['Enforce strict lockup schedules, legal opinions, and decentralized governance thresholds'],
      },
    };
  }

  public generateMarkdown(content: TokenLaunchKitContent): string {
    if (!content.isAppropriate) {
      return `# Token Launch Readiness Assessment — Not Recommended

> **Status**: Tokenization Not Recommended  

---

## Strategic Recommendation
Launching a token is **not recommended** for this startup at its current stage.

### Key Reasons
- The core business model operates effectively via traditional revenue.
- Issuing a token without immediate protocol utility creates unnecessary regulatory and operational overhead.
- **Alternative**: Focus on traditional equity, B2B revenue, or ecosystem grant funding.
`;
    }

    return `# ${content.strategy.tokenName} ($${content.strategy.tokenSymbol}) — Token Launch Kit

> **Token Symbol**: $${content.strategy.tokenSymbol} | **Type**: ${content.strategy.tokenType}  
> **Total Supply**: ${content.supplyStrategy.totalSupply} | **Target Network**: ${content.strategy.targetEcosystem}

---

## 1. Executive Token Strategy & Utility Framework
${content.strategy.primaryPurpose}

### Core Token Utilities
${content.utilityModel.coreUtilities.map((u) => `- ${u}`).join('\n')}

* **Staking Mechanism**: ${content.utilityModel.stakingMechanisms}
* **Deflation Model**: ${content.utilityModel.feeDiscountsOrBurn}

---

## 2. Supply & Distribution Allocation Strategy
* **Total Hard Cap**: ${content.supplyStrategy.totalSupply}
* **Initial Circulating**: ${content.supplyStrategy.initialCirculatingSupply}

### Allocation Breakdown
${content.distributionStrategy.allocations.map((a) => `- **${a.category}** (${a.percentage}%): Vesting ${a.vestingPeriodMonths} mos (Lockup ${a.lockupMonths} mos)`).join('\n')}

---

## 3. Governance & Treasury Model
* **Governance Scope**: ${content.governanceModel.governanceScope}
* **Voting Mechanics**: ${content.governanceModel.votingMechanics}
* **Treasury Reserve**: ${content.treasuryStrategy.treasuryAllocationPercentage}%

---

## 4. Launch Roadmap
${content.launchRoadmap.phases.map((p) => `- **[${p.targetQuarter}]** ${p.phaseName}: ${p.milestone}`).join('\n')}

---

## 5. Risk Assessment & Mitigation
${content.riskAssessment.regulatoryRisks.map((r, i) => `- **Risk**: ${r}\n  *Mitigation*: ${content.riskAssessment.mitigationPlans[i] || 'Proactive legal compliance'}`).join('\n')}
`;
  }
}
