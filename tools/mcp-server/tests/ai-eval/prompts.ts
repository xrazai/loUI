/**
 * AI-014: natural-language UI requests and what the AI-facing docs must surface for them.
 *
 * Each case is run against the MCP server's `list_components` (ranked search) and
 * `get_recipe` (ranked recipe search). Fix a failure by improving the manifest data
 * (the component's "When to use" text) or the ranking code, not by loosening a case.
 */
export interface EvalCase {
  /** What a person or agent would ask for. */
  prompt: string;
  /** Components that must be in the top `top` results (default 5). */
  include: string[];
  /** Components that must NOT be in the top `excludeTop` results (default 3). */
  exclude?: string[];
  /** Pairs [first, second]: `first` must rank above `second` (or `second` be absent). */
  before?: [string, string][];
  /** Recipes (file names) that must be in the top 2 recipe matches; their code is validated. */
  recipes?: string[];
  /** Search hooks and utilities too (default: components only). */
  anyKind?: boolean;
  top?: number;
  excludeTop?: number;
  /** `get_component` text for `name` must contain every phrase (case-insensitive). */
  facts?: { name: string; contains: string[] }[];
}

export const CASES: EvalCase[] = [
  {
    prompt: 'a confirmation before deleting a customer',
    include: ['ConfirmDialog'],
    before: [['ConfirmDialog', 'Button']],
    recipes: ['destructive-confirm'],
    facts: [{ name: 'ConfirmDialog', contains: ['cancel'] }],
  },
  {
    prompt: 'a settings page with email alerts',
    include: ['Switch'],
    recipes: ['settings-page'],
  },
  { prompt: 'show the progress of a 5-step setup', include: ['Stepper'], exclude: ['Spinner'] },
  {
    prompt: 'a table of orders with sorting and pagination',
    include: ['DataTable', 'Pagination'],
    recipes: ['filterable-table'],
  },
  { prompt: 'cite sources under an AI answer', include: ['SourceList', 'Citation'] },
  {
    prompt: 'archive an item and let the user undo it',
    include: ['ToastRegion'],
    recipes: ['undoable-action'],
    anyKind: true,
  },
  {
    prompt: 'open a command palette with a keyboard shortcut',
    include: ['CommandPalette'],
    recipes: ['command-palette-setup'],
  },
  {
    prompt: 'a form with validation errors and a summary',
    include: ['Form', 'FormErrorSummary'],
    recipes: ['form-with-validation'],
  },
  {
    prompt: 'view and edit one record in a side panel without leaving the list',
    include: ['Sheet'],
    recipes: ['detail-sheet'],
  },
  {
    prompt: 'let the owner approve an agent reply before it is sent to the customer',
    include: ['ApprovalCard'],
    recipes: ['approval-queue'],
  },
  { prompt: 'render markdown in a chat message', include: [], recipes: ['markdown-message'] },
  {
    prompt: 'thumbs up and down feedback under an assistant response',
    include: ['ResponseFeedback'],
  },
  { prompt: 'a chat with an AI agent with suggested prompts', include: ['ChatPanel'] },
  { prompt: 'show a due date that is overdue', include: ['DueIndicator'] },
  { prompt: 'a field to type a money amount', include: ['CurrencyInput'] },
  { prompt: 'placeholder shapes while content is loading', include: ['Skeleton'] },
  { prompt: 'nothing found, tell the user what to do next', include: ['EmptyState'] },
  { prompt: 'switch between panels of related content', include: ['Tabs'] },
  { prompt: 'search and choose one option from a long list', include: ['Combobox'] },
  { prompt: 'pick a date from a calendar', include: ['DatePicker'] },
  { prompt: 'let the user upload files by dragging them', include: ['FileUpload'] },
  { prompt: 'a tiny trend line inside a table row', include: ['Sparkline'] },
  { prompt: 'a key number at the top of a dashboard', include: ['StatCard'] },
  { prompt: 'show where the user is in the site hierarchy', include: ['Breadcrumb'] },
  { prompt: 'a persistent message that the system is under maintenance', include: ['Banner'] },
  { prompt: 'a hint that explains an icon-only button', include: ['Tooltip', 'IconButton'] },
  { prompt: 'a setting that turns on or off immediately', include: ['Switch'] },
  { prompt: 'enter labels as removable tags', include: ['TagInput'] },
  { prompt: 'history of events for an order, newest first', include: ['Timeline'] },
  { prompt: 'guide new users through the interface with hints', include: ['Tour'] },
  { prompt: 'a row menu with more actions', include: ['MoreActionsMenu'] },
  { prompt: 'a short status label like paid or pending', include: ['Badge'] },
  { prompt: 'a number field with plus and minus buttons', include: ['NumberField'] },
  {
    prompt: 'show the tools an agent called and whether they succeeded',
    include: ['ToolCallStep', 'ToolCallList'],
  },
  { prompt: 'how much of the storage is used', include: ['DonutMeter', 'Meter'] },
  {
    prompt: 'edit a price inline in a table row',
    include: ['CurrencyInput'],
    recipes: ['inline-price-edit'],
  },
  {
    prompt: 'pick a label from a list or create a new one by typing',
    include: ['Combobox'],
    recipes: ['create-on-the-fly'],
  },
  {
    prompt: 'a password field with a show password toggle on the sign in form',
    include: ['Input'],
    recipes: ['password-field'],
  },
];
