export interface DependencyGraph {
  nodes: string[];
  edges: Record<string, string[]>;
}

export interface GraphProcessor {
  initialize(workspaceRoot: string): Promise<void>;
  updateGraph(fileUri: string): Promise<void>;
  getGraph(): DependencyGraph;
  on(event: 'update', listener: (graph: DependencyGraph) => void): void;
}
