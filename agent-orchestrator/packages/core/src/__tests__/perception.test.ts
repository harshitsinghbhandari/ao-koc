import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultPerceptionEngine } from "../perception/index.js";
import { SimpleLSPClient } from "../perception/lsp/index.js";
import { SimpleGraphProcessor } from "../perception/graph/index.js";
import { EventBus } from "../events/bus.js";
import { EventTypes } from "../events/types.js";

describe("DefaultPerceptionEngine", () => {
  let engine: DefaultPerceptionEngine;
  let mockLsp: SimpleLSPClient;
  let mockGraph: SimpleGraphProcessor;
  let eventBus: EventBus;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLsp = new SimpleLSPClient();
    mockGraph = new SimpleGraphProcessor();
    eventBus = new EventBus();

    vi.spyOn(mockLsp, "start").mockResolvedValue();
    vi.spyOn(mockLsp, "stop").mockResolvedValue();
    vi.spyOn(mockGraph, "initialize").mockResolvedValue();

    // Explicitly add an empty stopWatching so we don't throw if called
    (mockGraph as any).stopWatching = vi.fn();

    engine = new DefaultPerceptionEngine(mockLsp, mockGraph, eventBus);
  });

  it("should initialize both LSP and Graph Processor", async () => {
    const workspaceRoot = "/mock/workspace";
    await engine.init(workspaceRoot);

    expect(mockLsp.start).toHaveBeenCalledWith(workspaceRoot);
    expect(mockGraph.initialize).toHaveBeenCalledWith(workspaceRoot);
  });

  it("should get context payload", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.spyOn(mockGraph, "getGraph").mockReturnValue({ nodes: ["test.ts"], edges: {} });

    await engine.init(workspaceRoot);
    const payload = engine.getContextPayload();

    expect(payload.lspStatus).toBe("ready");
    expect(payload.graph.nodes).toContain("test.ts");
  });

  it("should handle LSP start failure gracefully", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.spyOn(mockLsp, "start").mockRejectedValue(new Error("Crash"));

    await engine.init(workspaceRoot);
    const payload = engine.getContextPayload();

    expect(payload.lspStatus).toBe("error");
  });

  it("should emit PERCEPTION_UPDATE event when graph updates", async () => {
    const workspaceRoot = "/mock/workspace";
    await engine.init(workspaceRoot);

    let eventEmitted = false;
    eventBus.subscribe(EventTypes.PERCEPTION_UPDATE, (event) => {
      eventEmitted = true;
      expect(event.payload.graph).toBeDefined();
    });

    // Simulate a graph update by manually triggering the 'update' event
    // that the engine is listening to
    (mockGraph as any).emitter.emit("update", { nodes: [], edges: {} });

    expect(eventEmitted).toBe(true);
  });

  it("should clean up resources on destroy", async () => {
     await engine.destroy();
     expect(mockLsp.stop).toHaveBeenCalled();
     expect((mockGraph as any).stopWatching).toHaveBeenCalled();
  });
});
