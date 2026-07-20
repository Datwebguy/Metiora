# Startup Memory Engine Specification & Developer Guide

The **Startup Memory Engine** is Metiora's persistent knowledge infrastructure dedicated exclusively to individual company identities, problem/solution models, business models, target markets, funding history, tokenomics, and deliverable asset records.

---

## 1. Startup Memory Architecture

Startup Memory belongs to **one company**, whereas User Memory belongs to **a founder**. A single founder profile (via `founderProfileId`) can own multiple independent startup memory aggregates.

```
+-----------------------------------------------------------------------+
|                       Downstream AI Modules                           |
| (Business Intelligence, Conversation Engine, Blueprint, Pitch Deck)  |
+-----------------------------------------------------------------------+
                                   ▲
                                   │ Standardized StartupMemorySnapshot
+-----------------------------------------------------------------------+
|                         Startup Memory Engine                         |
|   - StartupConflictDetector  - StartupSnapshotBuilder  - Registry     |
+-----------------------------------------------------------------------+
                                   ▲
                                   │ Domain Aggregate
+-----------------------------------------------------------------------+
|                   Prisma Startup Memory Repository                     |
| (Normalized Tables: Vision, Problem, Solution, Business, Deliverables)|
+-----------------------------------------------------------------------+
                                   ▲ References founderProfileId
+-----------------------------------------------------------------------+
|                           User Memory Engine                          |
|                       (Founder Profile Aggregate)                     |
+-----------------------------------------------------------------------+
```

---

## 2. Normalized Database Schema

Startup Memory is stored across normalized tables linked to `StartupProfile`:

* **`StartupProfile`**: Aggregate root (name, tagline, oneSentenceDescription, websiteUrl, industry, stage, version).
* **`StartupVision`**: Mission, Vision, Core Values, Long-term Goals.
* **`StartupProblem`**: Problem Statement, Existing Alternatives, Market Pain Points.
* **`StartupSolution`**: Product Description, Unique Value Proposition, Competitive Advantage, Core Features.
* **`StartupCustomers`**: Target Audience, Ideal Customer Profile, Customer Personas, Geographic Markets.
* **`StartupBusinessModel`**: Business Model, Revenue Model, Pricing Strategy, Sales Strategy, Distribution Strategy.
* **`StartupMarket`**: Competitors, Market Position, Market Size, Market Trends.
* **`StartupRoadmap`**: Current Stage, Milestones, Upcoming Releases, Long-term Roadmap.
* **`StartupFunding`**: Funding Stage, Previous Funding, Investors, Grants, Accelerator Programs.
* **`StartupPartnerships`**: Existing Partners, Desired Partners, Strategic Opportunities.
* **`StartupTokenomics`**: Token Name, Symbol, Utility, Governance, Distribution, Treasury, Vesting (Optional Web3 model).
* **`StartupDeliverableRecord`**: Deliverable Registry storing generated Markdown assets linked to originating memory versions.
* **`StartupMemoryVersion`**: Immutable historical JSON snapshots.
* **`StartupPendingUpdate`**: Proposed updates awaiting founder approval when field conflicts occur.

---

## 3. Integration with User Memory

To maintain zero data duplication:
- `StartupProfile` maintains a foreign key reference (`founderProfileId`) pointing to `FounderProfile`.
- Founder personal details (bio, skills, writing preferences) are never copied into Startup Memory.
- Downstream services request both `UserMemorySnapshot` and `StartupMemorySnapshot` during task generation to combine founder voice with startup facts.

---

## 4. Standardized Startup Memory Snapshot Format

`StartupMemorySnapshot` is injected into downstream modules:

```json
{
  "startupId": "uuid",
  "founderId": "uuid",
  "version": 1,
  "generatedAt": "2026-07-18T03:20:00.000Z",
  "companyProfile": {
    "name": "Metiora AI",
    "industry": "Artificial Intelligence",
    "stage": "SEED"
  },
  "foundation": {
    "mission": "Turn ideas into enduring companies.",
    "vision": "Become the operating workspace where every startup is built."
  },
  "problemAndSolution": {
    "problemStatement": "AI tools generate isolated outputs without memory.",
    "productDescription": "Autonomous workspace with persistent Company Memory."
  },
  "marketAndCustomers": {
    "targetAudience": "Startup Founders & Accelerators",
    "businessModel": "ASP Marketplace Model"
  }
}
```

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/startups` | Create a new startup profile (v1). |
| `GET` | `/startups/:id` | Retrieve startup profile aggregate. |
| `PATCH` | `/startups/:id` | Update startup knowledge (applies update or creates proposal). |
| `GET` | `/startups/:id/history` | Retrieve full immutable version history. |
| `GET` | `/startups/:id/snapshot` | Generate standardized startup memory snapshot. |
| `POST` | `/startups/:id/approve` | Approve pending startup update proposal. |
| `POST` | `/startups/:id/reject` | Reject pending startup update proposal. |
| `GET` | `/founders/:id/startups` | List all startups owned by a specific founder. |

---

## 6. Preparation for Future OKX.AI A2A Integration

While OnchainOS and OKX marketplace SDKs are deferred to a dedicated integration phase:
1. **Stateless API Routes**: All `/startups/*` REST endpoints process requests statelessly.
2. **Deterministic Memory Snapshots**: Downstream A2A service handlers consume standardized JSON snapshots (`StartupMemorySnapshot`), making them easily serializable over OKX marketplace task payloads.
3. **Deliverable Audit Registry**: Every asset generated during an A2A transaction will record a `StartupDeliverableRecord` linked back to the originating version number for marketplace verification and escrow release.
