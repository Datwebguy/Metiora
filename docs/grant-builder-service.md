# Grant Builder Service Specification & Developer Guide

The **Grant Builder Service** prepares startups for grant opportunities. It evaluates grant readiness, verifies technical feasibility and ecosystem impact, and generates professional grant submission materials.

---

## 1. Grant Builder Architecture & Workflow

```
+------------------+     +--------------------+     +--------------------+
|   User Memory    |     |   Startup Memory   |     |  Startup Blueprint |
+------------------+     +--------------------+     +--------------------+
         │                         │                          │
         └─────────────────────────┼──────────────────────────┘
                                   ▼
                     +--------------------------+
                     |   Business Intelligence  |  --> Evaluates Grant Readiness
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |   Conversation Engine    |  --> Gathers Missing Facts
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |  GrantReadinessAssessor  |  --> Score (0-100), Risks & Gaps
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |  GrantPackageGenerator   |  --> Dual JSON + Markdown Output
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

## 2. Grant Readiness Assessment Engine (`GrantReadinessAssessor`)

Before drafting a grant proposal, the readiness engine evaluates:
* **Technical Feasibility & Product** (Detailed product description & feature clarity)
* **Mission & Ecosystem Impact** (Mission alignment & target beneficiaries)
* **Public Documentation** (Website or technical documentation links)
* **Applicant Lead Team** (Verified team credentials)

Returns `GrantReadinessAssessment`:
* `overallScore`: Number (0–100) (Minimum threshold `50%` required before grant package generation).
* `strengths`: Verified advantage facts.
* `weaknesses`: Identified missing application areas.
* `missingInformation`: Missing required facts.
* `applicationRisks`: Identified application risks.
* `recommendations`: Strategic improvement recommendations.

---

## 3. Generated Grant Deliverables

Each grant package produces structured, independent modules:
1. **Project Description**: Title, executive summary, problem statement, proposed solution, technical overview.
2. **Innovation Statement**: Novelty description, technical breakthrough, competitive differentiation.
3. **Impact Statement**: Target beneficiaries, community impact, economic/social value.
4. **Budget Narrative**: Requested amount, duration, itemized category breakdown, sustainability plan.
5. **Milestone Plan**: Sequenced milestones with target months, deliverables, and KPIs.
6. **Risk Assessment**: Technical and operational risks with mitigation plans.
7. **Team Overview**: Lead applicant bios and roles.
8. **Supporting Narrative**: Comprehensive alignment narrative.

---

## 4. How Approved Information Updates Startup Memory

When `ApproveGrantPackage` is invoked:
1. Package status transitions to `APPROVED`.
2. `StartupProfile.funding.grants` in `IStartupMemoryRepository` is updated with approved grant proposal titles.
3. `StartupProfile.version` is incremented.
4. Deliverable asset is recorded in `StartupDeliverableRecord`:
   - `serviceType`: `"grant_builder"`
   - `title`: Proposal title.
   - `contentMarkdown`: Full Markdown output.
5. `GrantPackageVersion` audit record is preserved.

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/services/grant-builder/assess` | Assess startup grant readiness score & risks. |
| `POST` | `/services/grant-builder/create` | Generate draft Grant Package (dual JSON & Markdown). |
| `POST` | `/services/grant-builder/validate` | Validate budget and milestone consistency. |
| `POST` | `/services/grant-builder/approve` | Approve Grant Package and update Startup Memory. |
| `POST` | `/services/grant-builder/reject` | Reject draft Grant Package proposal. |
| `GET` | `/services/grant-builder/:id` | Retrieve Grant Package aggregate by ID. |
| `GET` | `/services/grant-builder/:id/versions` | Retrieve full version history. |
