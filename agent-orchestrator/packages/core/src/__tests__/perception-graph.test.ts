import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimpleGraphProcessor } from "../perception/graph/index.js";
import * as fsPromises from "node:fs/promises";
import * as fs from "node:fs";

vi.mock("node:fs/promises");
vi.mock("node:fs");

describe("SimpleGraphProcessor", () => {
  let processor: SimpleGraphProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new SimpleGraphProcessor();
  });

  it("should initialize the graph with files from root", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fsPromises.readdir).mockResolvedValue(["index.ts", "utils.ts", "README.md"] as any);
    vi.mocked(fs.watch).mockReturnValue({ close: vi.fn() } as any);

    await processor.initialize(workspaceRoot);

    const graph = processor.getGraph();
    expect(graph.nodes).toEqual(["index.ts", "utils.ts"]);
    expect(graph.edges).toEqual({
      "index.ts": [],
      "utils.ts": [],
    });
  });

  it("should incrementally update graph when a file is modified", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fsPromises.readdir).mockResolvedValue(["index.ts"] as any);

    // To trigger watch, we need to capture the callback
    let watchCallback: any;
    vi.mocked(fs.watch).mockImplementation((path, options, callback) => {
        watchCallback = callback;
        return { close: vi.fn() } as any;
    });

    const updateSpy = vi.spyOn(processor, "updateGraph");

    await processor.initialize(workspaceRoot);

    let updateEmitted = false;
    processor.on("update", (g) => {
        updateEmitted = true;
    });

    if (watchCallback) {
        await watchCallback("rename", "newFile.ts");
    }

    expect(updateSpy).toHaveBeenCalledWith("newFile.ts");

    const graph = processor.getGraph();
    expect(graph.nodes).toContain("newFile.ts");
    expect(graph.edges["newFile.ts"]).toContain("index.ts");
    expect(updateEmitted).toBe(true);
  });

  it("should stop watching when stopWatching is called", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fsPromises.readdir).mockResolvedValue(["index.ts"] as any);

    const mockClose = vi.fn();
    vi.mocked(fs.watch).mockReturnValue({ close: mockClose } as any);

    await processor.initialize(workspaceRoot);
    processor.stopWatching();

    expect(mockClose).toHaveBeenCalled();
  });

  it("should handle initialize errors gracefully", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fsPromises.readdir).mockRejectedValue(new Error("Dir not found"));
    vi.mocked(fs.watch).mockReturnValue({ close: vi.fn() } as any);

    await processor.initialize(workspaceRoot);

    const graph = processor.getGraph();
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual({});
  });

  it("should handle watch errors gracefully", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fsPromises.readdir).mockResolvedValue(["index.ts"] as any);
    vi.mocked(fs.watch).mockImplementation(() => {
        throw new Error("Cannot watch");
    });

    await processor.initialize(workspaceRoot);

    const graph = processor.getGraph();
    expect(graph.nodes).toEqual(["index.ts"]);
  });

});
