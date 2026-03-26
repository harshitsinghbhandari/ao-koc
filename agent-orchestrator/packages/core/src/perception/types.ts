import { type DependencyGraph, type GraphProcessor } from "./graph/types.js";
import { type LSPClient } from "./lsp/types.js";

export interface ContextPayload {
  lspStatus: 'ready' | 'error' | 'fallback';
  graph: DependencyGraph;
}

export interface PerceptionEngine {
  init(workspaceRoot: string): Promise<void>;
  getContextPayload(): ContextPayload;
  destroy(): Promise<void>;
}
