# Metiora Coding Standards & Constraints

1. **Strict TypeScript Compliance**:
   - `strict: true` enabled in `tsconfig.json`.
   - `noImplicitAny`, `strictNullChecks`, and `noUnusedLocals` strictly enforced.
   - `any` type is forbidden (`@typescript-eslint/no-explicit-any: error`).

2. **Clean Architecture Dependencies**:
   - Inward-only module dependencies.
   - Core domain (`src/core/domain`) has 0 external dependencies.

3. **Centralized Error Hierarchy**:
   - All errors extend `MetioraBaseError`.
   - Domain errors throw `DomainError`, infrastructure issues throw `InfrastructureError`.

4. **Zero Placeholder Code**:
   - Every contract, interface, error class, and logger is production ready and fully typed.
