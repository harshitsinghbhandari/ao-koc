import { type PerceptionEngine, type ContextPayload } from "./types.js";
import { type LSPClient } from "./lsp/types.js";
import { SimpleLSPClient } from "./lsp/index.js";
import { type GraphProcessor } from "./graph/types.js";
import { SimpleGraphProcessor } from "./graph/index.js";
import { EventBus } from "../events/bus.js";
import { EventTypes } from "../events/types.js";

export class DefaultPerceptionEngine implements PerceptionEngine {
  private lsp: LSPClient;
  private graphProcessor: GraphProcessor;
  private eventBus: EventBus | null;
  private lspStatus: 'ready' | 'error' | 'fallback' = 'fallback';

  constructor(lspClient?: LSPClient, graphProcessor?: GraphProcessor, eventBus?: EventBus) {
    this.lsp = lspClient || new SimpleLSPClient();
    this.graphProcessor = graphProcessor || new SimpleGraphProcessor();
    this.eventBus = eventBus || null;
  }

  async init(workspaceRoot: string): Promise<void> {
    try {
        await this.lsp.start(workspaceRoot);
        // We'll consider it ready or fallback depending on if the client actually started
        // For our simple client, if it started it might be ready, else fallback.
        this.lspStatus = 'ready'; // Simplification for now
    } catch (e) {
        this.lspStatus = 'error';
    }

    await this.graphProcessor.initialize(workspaceRoot);

    this.graphProcessor.on("update", (graph) => {
       if (this.eventBus) {
           this.eventBus.publish({
               event_type: EventTypes.PERCEPTION_UPDATE,
               source_agent: "system",
               target_agent: "broadcast",
               task_id: "perception-update",
               payload: this.getContextPayload(),
           });
       }
    });
  }

  getContextPayload(): ContextPayload {
    return {
      lspStatus: this.lspStatus,
      graph: this.graphProcessor.getGraph(),
    };
  }

  async destroy(): Promise<void> {
    await this.lsp.stop();
    if ('stopWatching' in this.graphProcessor) {
       (this.graphProcessor as any).stopWatching();
    }
  }

  getLspClient(): LSPClient {
     return this.lsp;
  }

  getGraphProcessor(): GraphProcessor {
     return this.graphProcessor;
  }
}
