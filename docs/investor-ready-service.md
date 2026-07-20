# Investor Ready Service Specification & Developer Guide

The **Investor Ready Service** prepares startups for fundraising. It evaluates investment readiness, identifies missing information and risks, and generates canonical investor packages only after readiness requirements are met.

---

## 1. Investor Ready Architecture & Workflow

```
+------------------+     +--------------------+     +--------------------+
|   User Memory    |     |   Startup Memory   |     |  Startup Blueprint |
+------------------+     +--------------------+     +--------------------+
         │                         │                          │
         └─────────────────────────┼──────────────────────────┘
                                   ▼
                     +--------------------------+
                     |   Business Intelligence  |  --> Evaluates Readiness
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |   Conversation Engine    |  --> Gathers Missing Facts
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |    ReadinessAssessor     |  --> Score (0-100), Risks & Gaps
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |     PackageGenerator     |  --> Dual JSON + Markdown Output
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
                       ├─ Increment Version
                       └─ Record Deliverable
```

---

## 2. Readiness Assessment Engine (`ReadinessAssessor`)

Before creating any investor asset, the readiness engine evaluates:
* **Founder & Team Profile** (Identity & experience clarity)
* **Problem & Solution Maturity** (Market pain points & UVP definition)
* **Business Model & Monetization** (Revenue strategy)
* **Market & Competitive Positioning** (Mapped competitors)
* **Target Audience & Traction** (Customer validation & metrics)

Returns `InvestmentReadinessAssessment`:
* `overallScore`: Number (0–100)
* `strengths`: List of validated advantage facts.
* `weaknesses`: Identified weak areas.
* `missingInformation`: Missing required facts.
* `investmentRisks`: Identified investment risks.
* `recommendations`: Strategic improvement recommendations.

---

## 3. Generated Investor Deliverables

Each investor package produces 10 modular sections:
1. **Executive Summary**: Core overview & tagline.
2. **Investment Memo**: Investment thesis, problem, solution, market size, business model.
3. **One Page Overview**: Key highlights & product summary.
4. **Investment Narrative**: Founder story, vision, and "Why Now".
5. **Funding Ask & Use of Funds**: Raise amount, valuation cap, and percentage breakdown.
6. **Traction Summary**: Current stage, milestones achieved, and key metrics.
7. **Growth Strategy**: Acquisition channels & scaling roadmap.
8. **Risk Analysis**: Market & execution risks with mitigation plans.
9. **Investor FAQ**: Key investor Q&A pairs.
10. **Investment Highlights**: Bulleted core defensibility highlights.

---

## 4. How Approved Information Updates Startup Memory

When `ApproveInvestorPackage` is called:
1. Package status is updated to `APPROVED`.
2. `StartupProfile.funding` in `IStartupMemoryRepository` is updated with approved funding stage (`PRE-SEED`, `SEED`, etc.).
3. `StartupProfile.version` is incremented.
4. Deliverable asset is recorded in `StartupDeliverableRecord` (`serviceType: 'investor_ready'`).
5. `InvestorPackageVersion` audit record is created.

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/services/investor-ready/assess` | Assess startup investment readiness score & risks. |
| `POST` | `/services/investor-ready/create` | Generate draft Investor Package (dual JSON & Markdown). |
| `POST` | `/services/investor-ready/validate` | Validate financial & structural consistency. |
| `POST` | `/services/investor-ready/approve` | Approve Investor Package and update Startup Memory. |
| `POST` | `/services/investor-ready/reject` | Reject draft Investor Package proposal. |
| `GET` | `/services/investor-ready/:id` | Retrieve Investor Package aggregate by ID. |
| `GET` | `/services/investor-ready/:id/versions` | Retrieve full version history. |
