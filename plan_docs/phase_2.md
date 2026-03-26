# Phase 2: Perception Engine (L1) & LSP Federation

## Goal
Implement Layer L1 (Perception Engine) to provide agents with sub-100ms repository awareness without expensive token-based reading.

## Actionable Steps
1. **Mode A: LSP Server Federation (`packages/core/src/perception/lsp/`)**
   - Create a lightweight LSP client wrapper in Node.js.
   - Auto-detect project languages (e.g., `tsconfig.json` -> `tsserver`, `requirements.txt` -> `pyright`) during workspace initialization.
   - Run LSP servers as background processes linked to the project worktree.
   - Expose an internal API for agents to query symbols, definitions, and references instantly.

2. **Mode B: Incremental Graph Processor (`packages/core/src/perception/graph/`)**
   - Generate module-level dependency graphs when a project is onboarded.
   - Listen to filesystem events (`chokidar` or similar) in the `worktrees/` to update the graph incrementally.

3. **Context Assembly Integration**
   - Feed outputs from the LSP and Graph into the APEX Brain (L2) to assemble `Context Payload (C1-C5)`.

4. **Testing & Verification**
   - E2E test: Spawn a workspace, modify a file, and verify the graph and LSP diagnostics update correctly.
   - Ensure the orchestrator gracefully handles LSP crashes (fallback to grep).
