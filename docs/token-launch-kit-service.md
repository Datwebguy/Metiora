# Token Launch Kit Service Specification & Developer Guide

The **Token Launch Kit Service** prepares Web3 startups that intend to launch a blockchain token. It provides strategic token design, utility modeling, tokenomics allocation, and governance planning.

> **IMPORTANT ARCHITECTURAL DIRECTIVE**:  
> The Token Launch Kit Service focuses exclusively on **strategic token planning and readiness**. It does **NOT** deploy smart contracts, issue tokens, or execute blockchain transactions.

---

## 1. Token Launch Kit Architecture & Workflow

```
+------------------+     +--------------------+     +--------------------+
|   User Memory    |     |   Startup Memory   |     |  Startup Blueprint |
+------------------+     +--------------------+     +--------------------+
         │                         │                          │
         └─────────────────────────┼──────────────────────────┘
                                   ▼
                     +--------------------------+
                     |   Business Intelligence  |  --> Evaluates Token Readiness
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |   Conversation Engine    |  --> Gathers Missing Utility Facts
                     +--------------------------+
                                   │
                                   ▼
                     +--------------------------+
                     |   TokenReadinessAssessor |  --> Appropriateness Check & Score
                     +--------------------------+
                                   │
                       ┌───────────┴───────────┐
                       ▼                       ▼
              [IS APPROPRIATE]        [NOT RECOMMENDED]
                       │                       │
                       ▼                       ▼
            +--------------------+    +-------------------+
            |    KitGenerator    |    |  Recommend Against|
            +--------------------+    |   Token Launch    |
                       │              +-------------------+
                       ▼
            +--------------------+
            |  Founder Approval  |
            +--------------------+
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

## 2. Token Readiness Assessment Engine (`TokenReadinessAssessor`)

The `TokenReadinessAssessor` evaluates whether tokenization genuinely strengthens the startup:
* **Appropriateness Check**: Evaluates if the startup operates in Web3/blockchain or has explicit decentralized protocol utility requirements. If a traditional Web2 business (e.g. traditional SaaS or local service) requests a token without decentralized utility, the service explicitly recommends against issuing a token (`isAppropriate: false`).
* **Utility & Governance Evaluation**: For Web3 startups, evaluates token symbol, staking utility, fee burn models, hard cap allocations, and governance parameters.

Returns `TokenReadinessAssessment`:
* `isAppropriate`: Boolean flag.
* `overallScore`: Number (0–100).
* `strengths`: Verified advantage facts.
* `weaknesses`: Identified tokenomics gaps.
* `risks`: Evaluated regulatory & security risks.
* `missingInformation`: Missing required facts.
* `recommendations`: Strategic advice.
* `recommendationReasoning`: Full strategic justification.

---

## 3. Strategic Planning Focus vs. Smart Contract Deployment

Metiora operates as a high-level **Agent-to-Agent Operating Partner**. Token Launch Kit focuses strictly on strategic architecture (tokenomics, vesting, governance, and distribution economics) because:
1. **Security & Audits**: Smart contract deployment requires off-chain formal security audits before mainnet execution.
2. **Regulatory Compliance**: Token design must undergo localized legal opinions prior to TGE.
3. **Decoupled Architecture**: High-level strategic planning remains independent of underlying L1/L2 smart contract syntax.

---

## 4. How Approved Information Updates Startup Memory

When `ApproveTokenLaunchKit` is called:
1. Kit status transitions to `APPROVED`.
2. `StartupProfile.tokenomics` in `IStartupMemoryRepository` is updated with token name, symbol, and core utility.
3. `StartupProfile.version` is incremented.
4. Deliverable asset is recorded in `StartupDeliverableRecord`:
   - `serviceType`: `"token_launch_kit"`
   - `title`: `${tokenName} ($${tokenSymbol}) — Token Launch Kit`
   - `contentMarkdown`: Full Markdown output.
5. `TokenLaunchKitVersion` audit record is preserved.

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/services/token-launch-kit/assess` | Assess startup token readiness score & appropriateness. |
| `POST` | `/services/token-launch-kit/create` | Generate draft Token Launch Kit (dual JSON & Markdown). |
| `POST` | `/services/token-launch-kit/validate` | Validate distribution allocations (sum = 100%) & utility model. |
| `POST` | `/services/token-launch-kit/approve` | Approve Token Launch Kit and update Startup Memory. |
| `POST` | `/services/token-launch-kit/reject` | Reject draft Token Launch Kit proposal. |
| `GET` | `/services/token-launch-kit/:id` | Retrieve Token Launch Kit aggregate by ID. |
| `GET` | `/services/token-launch-kit/:id/versions` | Retrieve full version history. |
