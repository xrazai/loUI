/** Loose views of the generated files. Only the fields the server reads are typed. */

export interface ManifestProp {
  name: string;
  type?: string;
  required?: boolean;
  default?: string;
  description?: string;
  values?: string[];
  deprecated?: string | boolean;
}

export interface MessageKey {
  key: string;
  kind?: string;
  default?: string;
  signature?: string;
  description?: string;
}

export interface ManifestDocs {
  path?: string;
  summary?: string;
  whenToUse?: string[];
  whenNotToUse?: string[];
  keyboard?: string[];
  examples?: string[];
  sections?: { id: string; heading: string; content: string }[];
}

export interface Related {
  alternatives?: { name: string; reason?: string }[];
  uses?: string[];
  usedBy?: string[];
}

export interface ManifestEntry {
  name: string;
  kind: 'component' | 'provider' | 'hook' | 'utility';
  entryPoint: string;
  importStatement: string;
  sourceFile?: string;
  status?: string;
  description?: string;
  signature?: string;
  props?: ManifestProp[];
  variants?: Record<string, string[]>;
  cssVariables?: string[];
  stories?: { title?: string; items?: { name: string; id: string; description?: string }[] };
  docs?: ManifestDocs;
  related?: Related;
  messages?: { providerKey?: string; locales?: string[]; keys?: MessageKey[] };
}

export interface Manifest {
  package?: { name?: string; version?: string };
  entryPoints?: { path: string; importPath: string; description?: string }[];
  components: ManifestEntry[];
  providers?: ManifestEntry[];
  hooks?: ManifestEntry[];
  utilities?: ManifestEntry[];
  icons?: { names?: string[]; source?: string; description?: string };
  reexports?: { name: string; from: string }[];
}

export interface TokenPairing {
  on: string[];
  ratio: number;
  min: number;
  passes: boolean;
  usage?: string;
}

export interface Token {
  name: string;
  cssVar: string;
  value: string;
  cssValue?: string;
  type: string;
  tier: string;
  aliasOf?: string | null;
  description?: string;
  pairings?: { allowed?: TokenPairing[]; notAllowed?: TokenPairing[] };
  foregrounds?: { token: string; ratio: number; min: number }[];
}
