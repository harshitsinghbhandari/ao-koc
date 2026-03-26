import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  type LSPClient,
  type SymbolInformation,
  type Location,
} from "./types.js";

export class SimpleLSPClient implements LSPClient {
  private process: ChildProcess | null = null;
  private isRunning: boolean = false;
  private root: string = "";

  async start(workspaceRoot: string): Promise<void> {
    this.root = workspaceRoot;

    let command = "";
    let args: string[] = [];

    // Auto-detect language
    if (existsSync(join(workspaceRoot, "tsconfig.json"))) {
      command = "tsserver";
    } else if (existsSync(join(workspaceRoot, "requirements.txt"))) {
      command = "pyright";
    } else {
      console.warn("No specific language config found, falling back to dummy LSP");
      this.isRunning = false;
      return;
    }

    try {
      this.process = spawn(command, args, { cwd: workspaceRoot });
      this.isRunning = true;

      this.process.on("error", (err) => {
        console.error(`LSP process error: ${err.message}`);
        this.isRunning = false;
      });

      this.process.on("exit", () => {
        this.isRunning = false;
      });
    } catch (e) {
      console.error(`Failed to start LSP: ${e}`);
      this.isRunning = false;
    }
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.isRunning = false;
    }
  }

  async querySymbol(_query: string): Promise<SymbolInformation[]> {
    if (!this.isRunning) return this.fallbackQuerySymbol();
    // In a real implementation, we would send a JSON-RPC request to the LSP process
    // For this dummy implementation we return empty or fallback
    return [];
  }

  async getDefinition(_uri: string, _line: number, _character: number): Promise<Location[]> {
    if (!this.isRunning) return this.fallbackGetLocation();
    return [];
  }

  async getReferences(_uri: string, _line: number, _character: number): Promise<Location[]> {
    if (!this.isRunning) return this.fallbackGetLocation();
    return [];
  }

  private fallbackQuerySymbol(): SymbolInformation[] {
     // Graceful fallback to grep-like mock or empty
     return [];
  }

  private fallbackGetLocation(): Location[] {
    return [];
  }
}
