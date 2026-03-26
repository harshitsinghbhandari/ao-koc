import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimpleLSPClient } from "../perception/lsp/index.js";
import { spawn } from "node:child_process";
import * as fs from "node:fs";

vi.mock("node:child_process");
vi.mock("node:fs");

describe("SimpleLSPClient", () => {
  let client: SimpleLSPClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SimpleLSPClient();
  });

  it("should detect tsconfig.json and start tsserver", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fs.existsSync).mockImplementation((path: any) => path.includes("tsconfig.json"));

    const mockChildProcess = {
      on: vi.fn(),
      kill: vi.fn(),
    };
    vi.mocked(spawn).mockReturnValue(mockChildProcess as any);

    await client.start(workspaceRoot);

    expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining("tsconfig.json"));
    expect(spawn).toHaveBeenCalledWith("tsserver", [], { cwd: workspaceRoot });
  });

  it("should detect requirements.txt and start pyright", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fs.existsSync).mockImplementation((path: any) => path.includes("requirements.txt"));

    const mockChildProcess = {
      on: vi.fn(),
      kill: vi.fn(),
    };
    vi.mocked(spawn).mockReturnValue(mockChildProcess as any);

    await client.start(workspaceRoot);

    expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining("requirements.txt"));
    expect(spawn).toHaveBeenCalledWith("pyright", [], { cwd: workspaceRoot });
  });

  it("should fallback gracefully and not crash if no known config is found", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await client.start(workspaceRoot);

    expect(spawn).not.toHaveBeenCalled();
    const symbols = await client.querySymbol("test");
    expect(symbols).toEqual([]);

    const definition = await client.getDefinition("file.ts", 1, 1);
    expect(definition).toEqual([]);

    const references = await client.getReferences("file.ts", 1, 1);
    expect(references).toEqual([]);
  });

  it("should handle LSP crash by falling back", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fs.existsSync).mockImplementation((path: any) => path.includes("tsconfig.json"));

    let errorCallback: any;
    const mockChildProcess = {
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          errorCallback = callback;
        }
      }),
      kill: vi.fn(),
    };
    vi.mocked(spawn).mockReturnValue(mockChildProcess as any);

    await client.start(workspaceRoot);

    // Simulate crash
    if (errorCallback) {
        errorCallback(new Error("Crash!"));
    }

    // Since it crashed, isRunning should be false, and it should use fallback
    const symbols = await client.querySymbol("test");
    expect(symbols).toEqual([]);

    const definition = await client.getDefinition("file.ts", 1, 1);
    expect(definition).toEqual([]);

    const references = await client.getReferences("file.ts", 1, 1);
    expect(references).toEqual([]);
  });

  it("should stop the process gracefully", async () => {
    const workspaceRoot = "/mock/workspace";
    vi.mocked(fs.existsSync).mockImplementation((path: any) => path.includes("tsconfig.json"));

    const mockChildProcess = {
      on: vi.fn(),
      kill: vi.fn(),
    };
    vi.mocked(spawn).mockReturnValue(mockChildProcess as any);

    await client.start(workspaceRoot);
    await client.stop();

    expect(mockChildProcess.kill).toHaveBeenCalled();
  });
});
