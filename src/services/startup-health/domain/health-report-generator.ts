import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { StartupHealthAssessment, StartupHealthReportContent } from '@core/domain/startup-health.js';

export class HealthReportGenerator {
  public generateContent(
    startupSnapshot: StartupMemorySnapshot,
    _userSnapshot: UserMemorySnapshot,
    assessment: StartupHealthAssessment
  ): StartupHealthReportContent {
    const startupName = startupSnapshot.companyProfile.name;

    return {
      startupName,
      assessmentDate: new Date(),
      assessment,
      executiveSummary: `${startupName} has achieved an Overall Health Score of ${assessment.overallScore}/100. The startup demonstrates key strengths across vision, product architecture, and business model design.`,
    };
  }

  public generateMarkdown(content: StartupHealthReportContent): string {
    const a = content.assessment;

    return `# ${content.startupName} — Continuous Startup Health Assessment Report

> **Overall Health Score**: **${a.overallScore} / 100** | **Assessment Date**: ${content.assessmentDate.toISOString().split('T')[0]}  
> **Status**: Comprehensive Operational Review Complete

---

## 1. Executive Summary
${content.executiveSummary}

---

## 2. 15-Dimension Health Readiness Matrix

| Health Dimension | Category Name | Score | Status | Key Observation |
| :--- | :--- | :---: | :---: | :--- |
${a.categoryScores.map((c) => `| **${c.dimension}** | ${c.categoryName} | **${c.score}%** | \`${c.status}\` | ${c.keyObservations[0] || 'Nominal'} |`).join('\n')}

---

## 3. Key Strengths & Advantages
${a.strengths.map((s) => `- **${s.title}** (${s.dimension}): ${s.detail}`).join('\n')}

---

## 4. Weaknesses & Operational Risks
${a.weaknesses.map((w) => `- **Weakness**: ${w.title} (${w.dimension}) — ${w.detail}`).join('\n')}
${a.risks.map((r) => `- **Risk** [${r.severity}]: ${r.title} — ${r.detail}`).join('\n')}

---

## 5. Recommended Strategic Priorities & Immediate Actions
### Strategic Priorities
${a.recommendedPriorities.map((p) => `${p.priorityOrder}. **${p.title}**: ${p.rationale}`).join('\n')}

### Immediate Next Actions (7-Day Sprint)
${a.immediateActions.map((act) => `- [ ] **${act.action}** (Owner: ${act.ownerRole}, Timeframe: ${act.timeframeDays} days)`).join('\n')}

---

## 6. Long-Term Growth Guidance
${a.longTermRecommendations.map((rec) => `- ${rec}`).join('\n')}
`;
  }
}
