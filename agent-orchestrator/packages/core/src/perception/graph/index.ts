import { EventEmitter } from "node:events";
import * as fs from "node:fs/promises";
import { watch } from "node:fs";
import { join } from "node:path";
import { type DependencyGraph, type GraphProcessor } from "./types.js";

export class SimpleGraphProcessor implements GraphProcessor {
  private graph: DependencyGraph = { nodes: [], edges: {} };
  private emitter = new EventEmitter();
  private root: string = "";
  private watcher: ReturnType<typeof watch> | null = null;

  async initialize(workspaceRoot: string): Promise<void> {
    this.root = workspaceRoot;
    // In a real implementation, we would traverse the directory and parse imports.
    // For this dummy implementation we'll just mock a basic file read and start watching.
    this.graph = { nodes: [], edges: {} };

    try {
        // Dummy logic: read the root directory and add some files as nodes
        const files = await fs.readdir(workspaceRoot);
        for (const file of files) {
             if (file.endsWith(".ts") || file.endsWith(".js") || file.endsWith(".py")) {
                 this.graph.nodes.push(file);
                 this.graph.edges[file] = [];
             }
        }
    } catch (e) {
        // ignore
    }

    this.startWatching();
  }

  private startWatching() {
      try {
        this.watcher = watch(this.root, { recursive: true }, async (eventType, filename) => {
            if (filename) {
               await this.updateGraph(filename);
            }
        });
      } catch (e) {
         console.warn("Could not start fs watcher:", e);
      }
  }

  async updateGraph(fileUri: string): Promise<void> {
    // In a real implementation, we would parse the file for dependencies here
    if (!this.graph.nodes.includes(fileUri)) {
        this.graph.nodes.push(fileUri);
        this.graph.edges[fileUri] = [];
    }

    // Dummy logic: assume it depends on 'index.ts' if it's not 'index.ts'
    if (fileUri !== "index.ts" && this.graph.nodes.includes("index.ts")) {
         if (!this.graph.edges[fileUri].includes("index.ts")) {
             this.graph.edges[fileUri].push("index.ts");
         }
    }

    this.emitter.emit("update", this.graph);
  }

  getGraph(): DependencyGraph {
    return this.graph;
  }

  on(event: 'update', listener: (graph: DependencyGraph) => void): void {
    this.emitter.on(event, listener);
  }

  stopWatching() {
      if (this.watcher) {
          this.watcher.close();
      }
  }
}
