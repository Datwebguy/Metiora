# Startup Health Service Specification & Developer Guide

The **Startup Health Service** is Metiora's continuous business assessment engine. It evaluates the overall operational condition and maturity of a startup using all available approved information across **User Memory**, **Startup Memory**, **Startup Blueprint**, **Investor Ready**, **Grant Builder**, **Partnership Studio**, and **Token Launch Kit**.

---

## 1. Startup Health Architecture & Workflow

```
+------------------+     +--------------------+     +--------------------+
|   User Memory    |     |   Startup Memory   |     |  Startup Blueprint |
+------------------+     +--------------------+     +--------------------+
         │                         │                          │
         └─────────────────────────┼──────────────────────────┘
                                   ▼
                     +--------------------------+
                     |  Prior Service Outputs   |  (Investor, Grant, Partnership, Token)
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |   Business Intelligence  |  --> Evaluates Overall Condition
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |    HealthScoringEngine   |  --> 15-Dimension Scoring Model
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |   HealthReportGenerator  |  --> Dual JSON + Markdown Output
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |     Founder Approval     |
                     +--------------------------+
                                   │
                       ┌───────────┴───────────┐
                       ▼                       ▼
                  [APPROVED]              [REJECTED]
                       │                       │
                       ├─ Update Memory        └─ Mark REJECTED
                       ├─ Store Version
                       └─ Record Deliverable
```

---

## 2. 15-Dimension Health Scoring Model (`HealthScoringEngine`)

Evaluates readiness across 15 explicit business dimensions:
1. **Founder Readiness**: Founder profile, background, leadership readiness.
2. **Vision & Strategy**: Mission alignment, vision clarity, long-term strategic goals.
3. **Product**: Technical product architecture, uniqueness, feature completeness.
4. **Market Validation**: Competitor landscape, market position, trends.
5. **Customer Definition**: Target audience, Ideal Customer Profile (ICP), customer personas.
6. **Business Model**: Business model sustainability, revenue structure.
7. **Revenue Strategy**: Monetization plan, sales strategy, pricing model.
8. **Financial Readiness**: Financial runway, budget narrative, unit economics.
9. **Fundraising Readiness**: Stage alignment, investor materials, valuation context.
10. **Grant Readiness**: Non-dilutive ecosystem grant eligibility and readiness.
11. **Partnership Readiness**: Strategic alliance readiness and integration plans.
12. **Token Readiness**: Tokenomics utility appropriateness (if applicable).
13. **Go-To-Market Readiness**: Web presence, documentation, launch distribution.
14. **Operational Maturity**: Process structure, compliance, governance framework.
15. **Growth Readiness**: Scalability, team expansion readiness.

Returns `StartupHealthAssessment`:
* `overallScore`: Weighted score (0–100).
* `categoryScores`: Itemized scores and status across all 15 dimensions.
* `strengths`: Verified advantage facts.
* `weaknesses`: Identified operational weaknesses.
* `risks`: Evaluated operational risks.
* `criticalIssues`: High-priority operational issues.
* `recommendedPriorities`: Ranked strategic priorities.
* `immediateActions`: 7-day action checklist.
* `longTermRecommendations`: Strategic growth recommendations.

---

## 3. Historical Tracking & Version Comparison

Every approved Startup Health assessment creates an immutable record containing:
* `versionNumber`: Incremental version number.
* `createdAt`: Assessment timestamp.
* `overallScore`: Overall score snapshot.
* `categoryScoresJson`: Itemized dimension scores.

Founders can compare progress over time via `CompareHealthReports`, returning delta scores across dimensions to visualize business maturity improvements.

---

## 4. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/services/startup-health/assess` | Assess 15-dimension startup health score & observations. |
| `POST` | `/services/startup-health/create` | Generate draft Startup Health Report (dual JSON & Markdown). |
| `POST` | `/services/startup-health/approve` | Approve Startup Health Report and store version. |
| `POST` | `/services/startup-health/reject` | Reject draft Startup Health Report. |
| `GET` | `/services/startup-health/:id` | Retrieve Startup Health Report aggregate by ID. |
| `GET` | `/services/startup-health/:id/history` | Retrieve full historical assessment versions over time. |
