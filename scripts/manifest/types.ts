/** Shape of `manifest.json` (see `schemas/manifest.schema.json`). */

export type Status = 'experimental' | 'stable' | 'deprecated';

export interface ManifestProp {
  name: string;
  /** Type as written in the source, e.g. `'sm' | 'md' | 'lg'` or `(e: PressEvent) => void`. */
  type: string;
  required: boolean;
  default?: string;
  description: string;
  /** Allowed values when the type is a union of string literals. */
  values?: string[];
}

export interface InheritedGroup {
  /** Package or library the props come from, e.g. `react-aria-components`. */
  source: string;
  /** Interface the props are declared on, e.g. `AriaBaseButtonProps`. */
  interface: string;
  /** True for the standard DOM/ARIA attribute and event interfaces (summarized by count only). */
  domGeneric: boolean;
  count: number;
  /** Prop names and types; omitted for DOM-generic groups. */
  props?: { name: string; type: string; required: boolean }[];
}

export interface ManifestMessage {
  key: string;
  kind: 'string' | 'function';
  /** English text (strings) or an example output (functions). */
  default?: string;
  /** Parameter list for function messages, e.g. `(label: string)`. */
  signature?: string;
  description?: string;
}

export interface StoryEntry {
  /** Export name, e.g. `DangerSolid`. */
  name: string;
  /** Storybook story id, e.g. `components-button--danger-solid`. */
  id: string;
  description?: string;
  hasPlay: boolean;
}

export interface Related {
  /** Components the "When not to use" section sends the reader to. */
  alternatives: { name: string; reason: string }[];
  /** Exported components this one renders internally. */
  uses: string[];
  /** Exported components that render this one internally. */
  usedBy: string[];
}

export interface ComponentDocs {
  /** Repository-relative path of the hand-written doc. */
  path: string;
  summary: string;
  whenToUse: string[];
  whenNotToUse: string[];
  /** Bullets of the accessibility section that mention a key, e.g. `Enter` or `Esc`. */
  keyboard: string[];
  examples: string[];
  sections: { id: string; heading: string; content: string }[];
}

export interface ManifestComponent {
  name: string;
  kind: 'component';
  entryPoint: string;
  importStatement: string;
  /** Repository-relative folder, e.g. `src/components/Alert`. */
  folder: string;
  sourceFile: string;
  status: Status;
  /** Where the status came from: a `@status` tag, the `Status:` line of the doc, or the default. */
  statusSource: 'jsdoc' | 'doc' | 'default';
  description: string;
  props: ManifestProp[];
  inheritedProps: InheritedGroup[];
  variants: { variant?: string[]; size?: string[]; tone?: string[] };
  messages?: {
    /** Key for `DSProvider messages={{ [providerKey]: { ... } }}`. */
    providerKey?: string;
    locales: string[];
    keys: ManifestMessage[];
  };
  /** Design tokens (`--ds-*`) referenced by the component CSS. */
  cssVariables: string[];
  stories: { title: string; tags: string[]; items: StoryEntry[] };
  docs: ComponentDocs | null;
  related: Related;
}

export interface ManifestProvider {
  name: string;
  kind: 'provider';
  entryPoint: string;
  importStatement: string;
  sourceFile: string;
  status: Status;
  description: string;
  props: ManifestProp[];
  docs: string;
}

export interface ManifestFunction {
  name: string;
  kind: 'hook' | 'utility' | 'constant';
  entryPoint: string;
  importStatement: string;
  sourceFile: string;
  description: string;
  /** Full signature for functions and hooks; type for constants. */
  signature: string;
  params: { name: string; type: string; required: boolean }[];
  returns: string;
  docs: string;
}

export interface ManifestIcons {
  entryPoint: string;
  source: string;
  description: string;
  names: string[];
}

/** A tested composition of components, documented in `docs/recipes/<name>.md`. */
export interface ManifestRecipe {
  /** PascalCase name, also the Storybook title `Recipes/<name>`. */
  name: string;
  /** What the recipe does, in one paragraph. */
  description: string;
  status: string;
  /** Path of the doc, relative to the docs root (`docs/` and `dist/`). */
  doc: string;
}

export interface Manifest {
  $schema: string;
  schemaVersion: 1;
  package: { name: string; version: string };
  generator: string;
  entryPoints: { path: string; importPath: string; description: string }[];
  counts: {
    components: number;
    hooks: number;
    utilities: number;
    icons: number;
    recipes: number;
  };
  components: ManifestComponent[];
  recipes: ManifestRecipe[];
  providers: ManifestProvider[];
  hooks: ManifestFunction[];
  utilities: ManifestFunction[];
  icons: ManifestIcons;
  /** Names re-exported from other packages (for example the React Aria locale helpers). */
  reexports: { name: string; from: string }[];
}

export interface TokenPairing {
  /** Background layer tokens, bottom first. */
  on: string[];
  ratio: number;
  min: number;
  passes: boolean;
  /** `checked` pairs are asserted by the contrast test; `computed` ones are derived here. */
  source: 'checked' | 'computed';
  usage?: string;
}

export interface TokenEntry {
  name: string;
  /** Null for composite tokens (typography) that are expanded into several variables. */
  cssVar: string | null;
  /** Resolved value (objects such as typography are JSON-encoded). */
  value: string;
  /** The value as written in CSS, usually a reference to another token. */
  cssValue: string;
  type: string;
  tier: string;
  aliasOf: string | null;
  description: string;
  /** For foreground tokens: surfaces where the token passes and fails. */
  pairings?: { allowed: TokenPairing[]; notAllowed: TokenPairing[] };
  /** For surface tokens: foreground tokens that pass on it. */
  foregrounds?: { token: string; ratio: number; min: number }[];
}

export interface TokenManifest {
  $schema: string;
  schemaVersion: 1;
  package: { name: string; version: string };
  generator: string;
  counts: { tokens: number; pairs: number };
  notes: string[];
  tokens: TokenEntry[];
}
