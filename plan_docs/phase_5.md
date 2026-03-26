# Phase 5: The 5-Tier Quality Sovereignty Pipeline (L6)

## Goal
Implement the strict Critic Agent pipeline to ensure high-quality code generation before merges or PRs.

## Actionable Steps
1. **Critic Agent Roles (`packages/plugins/`)**
   - Implement the `Critic Agent` with capabilities to run Tiers 1-5.

2. **Tier 1 & 2: Syntax and Semantics**
   - T1: Auto-run linters (`eslint`, `tsc`, `ruff`) in the worktree.
   - T2: Leverage the Perception Engine (L1) to verify LSP diagnostics.

3. **Tier 3 & 4: Logic & Security**
   - T3: Run test suites (`vitest`, `jest`, `pytest`). If no tests exist, prompt the `Tester Agent` to generate them.
   - T4: Utilize `Security Agent` to perform vulnerability scans (e.g., `npm audit`, static analysis).

4. **Tier 5: Performance & Self-Healing**
   - Execute basic profiling if specified.
   - If any tier fails, trigger the `Self-Healing Flow` (L6.2) which feeds logs back to the original `Generator Agent` or decreases its Trust Score.

5. **Testing & Verification**
   - Inject failing code and verify the pipeline correctly halts at T1/T2 and re-prompts the agent up to the retry limit.
