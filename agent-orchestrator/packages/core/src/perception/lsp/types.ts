export interface SymbolInformation {
  name: string;
  kind: number;
  location: Location;
}

export interface Location {
  uri: string;
  range: Range;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  character: number;
}

export interface LSPClient {
  start(workspaceRoot: string): Promise<void>;
  stop(): Promise<void>;
  querySymbol(query: string): Promise<SymbolInformation[]>;
  getDefinition(uri: string, line: number, character: number): Promise<Location[]>;
  getReferences(uri: string, line: number, character: number): Promise<Location[]>;
}
