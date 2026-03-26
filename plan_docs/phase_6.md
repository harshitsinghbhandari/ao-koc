# Phase 6: Human Collaboration Gates (L7) & Zero-Config UX

## Goal
Safely integrate human oversight without disrupting the "start and walk away" UX of `agent-orchestrator`.

## Actionable Steps
1. **Gate Triggers**
   - G1 (Plan Approval): For High-Risk DAGs.
   - G2 (Diff Review): Before merges of low-confidence tasks.
   - G3 (Security): For Tier 4 failures.
   - G4 (PR Review): Final PR creation (already partially implemented).

2. **Dashboard Integration (`packages/web/`)**
   - Expose pending Human Gates to the existing Next.js dashboard.
   - Render DAGs (using Mermaid.js) for G1 approval.
   - Show diffs for G2 approval.
   - Add "Approve", "Reject", and "Comment" buttons.

3. **Notification Routing**
   - Connect the Event Bus `HUMAN_GATE_TRIGGERED` to the `NotifierConfig` (Desktop, Slack, etc.) to ping the user only when necessary.
   - Implement "Trust Mode" auto-skip for specific paths or high-trust agents to maintain the zero-config feel.

4. **Testing & Verification**
   - Verify UI properly unblocks the Event Bus upon clicking "Approve".
