# Startup Blueprint Service Specification & Developer Guide

The **Startup Blueprint Service** is Metiora's foundational business planning service. It transforms raw founder ideas and strategic intent into a canonical, structured **Startup Blueprint**.

---

## 1. Startup Blueprint Architecture & Workflow

```
+------------------+     +--------------------+
|   User Memory    |     |   Startup Memory   |
+------------------+     +--------------------+
         │                         │
         └───────────┬─────────────┘
                     ▼
       +--------------------------+
       |   Business Intelligence  |  --> Returns ExecutionPlan
       +--------------------------+
                     │
                     ▼
       +--------------------------+
       |   Conversation Engine    |  --> Gathers missing prerequisite facts
       +--------------------------+
                     │
                     ▼
       +--------------------------+
       |    BlueprintGenerator    |  --> Dual JSON + Markdown Generation
       +--------------------------+
                     │
                     ▼
       +--------------------------+
       |    BlueprintValidator    |  --> Structure & Consistency Check
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

## 2. Structured Domain Sections (`StartupBlueprintContent`)

Instead of storing unstructured text blobs, Startup Blueprint defines typed internal models for each section:

1. **`executiveSummary`**: Startup name, tagline, one-sentence description, industry, stage, executive overview.
2. **`problem`**: Problem statement, market pain points, existing market alternatives.
3. **`solution`**: Product description, unique value proposition, competitive advantage, core features.
4. **`businessModel`**: Business model, revenue model, pricing strategy, sales & distribution strategies.
5. **`roadmap`**: Current stage, key milestones, upcoming releases.
6. **`riskAssessment`**: Identified risks & mitigation strategies.
7. **`growthStrategy`**: Target customers, market opportunity, go-to-market strategy, success metrics.

---

## 3. Dual Output Format

Every blueprint generates two synchronized representations:
* **Structured JSON**: Machine-readable format used by downstream AI services (Investor Ready, Grant Builder, etc.).
* **Professional Markdown**: Founder-facing document formatted for pitch decks and executive reading.

---

## 4. How Approved Information Updates Startup Memory

When a founder invokes `ApproveBlueprint`:
1. The blueprint status transitions to `APPROVED`.
2. The `StartupProfile` aggregate in `IStartupMemoryRepository` is updated with approved tagline, problem statement, product description, business model, and target audience facts.
3. The Startup Memory version is incremented.
4. A new deliverable record is created in `StartupDeliverableRecord` (`serviceType: 'startup_blueprint'`).
5. A new `StartupBlueprintVersion` is recorded for audit history.

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/services/startup-blueprint/create` | Draft a new canonical Startup Blueprint. |
| `POST` | `/services/startup-blueprint/validate` | Validate blueprint structure and consistency. |
| `POST` | `/services/startup-blueprint/approve` | Approve draft blueprint and update Startup Memory. |
| `POST` | `/services/startup-blueprint/reject` | Reject draft blueprint proposal. |
| `GET` | `/services/startup-blueprint/:id` | Retrieve blueprint aggregate by ID. |
| `GET` | `/services/startup-blueprint/:id/versions` | Retrieve full immutable version history. |
