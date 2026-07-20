# Business Intelligence Engine Specification & Developer Guide

The **Business Intelligence (BI) Engine** is Metiora's Chief Strategy Officer (CSO) reasoning engine. It sits between Memory (User & Startup) and Services.

---

## 1. Architectural Philosophy

The Business Intelligence Engine **only thinks**. It never generates business assets directly, nor does it execute workflow code.

```
                   +-----------------------+
                   |  Raw Goal / Objective |
                   +-----------------------+
                               │
                               ▼
                   +-----------------------+
                   |   IntentClassifier    |  --> StrategicObjective
                   +-----------------------+
                               │
                               ▼
                   +-----------------------+
                   |     StageAnalyzer     |  --> StartupStage
                   +-----------------------+
                               │
                               ▼
                   +-----------------------+
                   |  ReadinessEvaluator   |  --> ReadinessAssessment
                   +-----------------------+
                               │
                               ▼
                   +-----------------------+
                   |      GapDetector      |  --> GapAnalysisResult
                   +-----------------------+
                               │
                               ▼
                   +-----------------------+
                   |  ConsistencyChecker   |  --> ConsistencyAnalysisResult
                   +-----------------------+
                               │
                               ▼
                   +-----------------------+
                   | RecommendationEngine  |  --> RecommendationItem[]
                   +-----------------------+
                               │
                               ▼
                   +-----------------------+
                   |     PlanGenerator     |  --> ExecutionPlan
                   +-----------------------+
```

---

## 2. Supported Strategic Objectives

* `BUILD_STARTUP`: Initial company creation.
* `REFINE_STARTUP`: Core identity optimization.
* `RAISE_INVESTMENT`: Fundraising preparation (Pitch Deck, Memo).
* `APPLY_FOR_GRANTS`: Grant proposal narratives.
* `BUILD_PARTNERSHIPS`: Ecosystem collaboration proposals.
* `LAUNCH_PRODUCT`: Go-To-Market readiness.
* `LAUNCH_TOKEN`: Web3 Tokenomics & utility launch kit.
* `IMPROVE_HEALTH`: Strategic startup audit.
* `STRATEGIC_GUIDANCE`: General outcome-focused guidance.

---

## 3. Decision Pipeline & Use Cases

1. **`DetectIntent`**: Classifies raw natural language input (e.g. *"I need funding"*) into a target `StrategicObjective` with confidence score.
2. **`DetermineStartupStage`**: Determines `StartupStage` (`IDEATION`, `BUILDING`, `MVP`, `EARLY_TRACTION`, etc.).
3. **`AnalyzeReadiness`**: Evaluates objective readiness score (0-100), risks, and missing components.
4. **`RunGapAnalysis`**: Identifies specific missing memory fields and missing asset deliverables.
5. **`RunDependencyAnalysis`**: Verifies prerequisites before allowing workflow execution.
6. **`RunConsistencyAnalysis`**: Identifies contradictions between `StartupMemorySnapshot` and `UserMemorySnapshot`.
7. **`GenerateRecommendations`**: Yields prioritized `RecommendationItem[]` with detailed strategic reasoning.
8. **`GenerateExecutionPlan`**: Assembles a structured `ExecutionPlan` ready for consumption by the Conversation Engine.

---

## 4. Example Execution Plan Output

```json
{
  "planId": "uuid-1234",
  "objective": "RAISE_INVESTMENT",
  "startupStage": "MVP",
  "readinessScore": 85,
  "missingDependencies": [],
  "recommendedService": "investor_ready",
  "actionSteps": [
    "Generate Investor Ready Package: Startup memory contains complete business foundation facts. Proceeding to generate Pitch Deck, Executive Summary, and Investment Memo."
  ],
  "generatedAt": "2026-07-18T02:15:00.000Z"
}
```

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/intelligence/objectives` | List all supported strategic objectives. |
| `POST` | `/intelligence/analyze` | Perform full objective, readiness, gap, and execution plan analysis. |
| `POST` | `/intelligence/readiness` | Evaluate readiness assessment score & risks. |
| `POST` | `/intelligence/recommend` | Generate prioritized recommendations with reasoning. |
| `POST` | `/intelligence/plan` | Generate structured execution plan. |
