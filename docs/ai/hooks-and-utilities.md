# Hooks and utilities

> Hooks, locale-aware utilities and message helpers exported from `loui-ds`. Money is an integer in minor units with an ISO 4217 code (ADR-0006).

## Hooks

### useControllableState

Controlled/uncontrolled state for the `value` / `defaultValue` / `onValueChange`
convention (AGENTS.md section 9). Thin wrapper over react-stately's `useControlledState`,
which also warns in development when a component switches between modes.

```tsx
const [value, setValue] = useControllableState({
  value: props.value,
  defaultValue: props.defaultValue ?? '',
  onChange: props.onValueChange,
});
```

```ts
useControllableState<T>({ value, defaultValue, onChange, }: UseControllableStateOptions<T>): [T, (value: T) => void]
```

### useDSLocale

Returns the active locale (BCP 47 tag) set by `DSProvider`; `en-US` without a provider.

```ts
useDSLocale(): string
```

### useHotkey

Runs `handler` when a single key combo is pressed.

- `combo`: modifiers joined with `+` and one key, e.g. `Mod+K`, `Shift+/`, `Alt+N`, `Escape`.
  `Mod` is Command on macOS and Control elsewhere.
- Ignores events from editable fields (unless `allowInEditable`), IME composition,
  key auto-repeat (unless `allowRepeat`) and events another handler already prevented.

This is deliberately small. A shortcut registry with conflict detection and a help
overlay is a separate task (GAP-004).

```ts
useHotkey(combo: string, handler: (event: KeyboardEvent) => void, { enabled, scope, allowInEditable, allowRepeat, preventDefault, platform, }?: UseHotkeyOptions): void
```

### useHotkeys

Registers keyboard shortcuts in the registry (see `HotkeyProvider`) for as long as the
component is mounted.

- `keys`: `Mod+K`, `F2`, `N`, `1`, `Shift+/`, `Escape`. `Mod` is Command on macOS and Control
  elsewhere.
- Ignores editable fields (`allowInEditable`), IME composition, auto-repeat (`allowRepeat`),
  events another handler already prevented and, for page-level shortcuts, focus inside an open
  dialog or menu (`allowInOverlay`).
- Only one named scope is active at a time (`useHotkeyScope`); shortcuts of other scopes wait.
- In development, registering the same combo twice in one scope logs a warning; the most
  recent registration wins.
- `description` and `group` make a shortcut appear in `useRegisteredHotkeys`, the
  command palette and `ShortcutsHelp`.

Handlers may close over props and state: the latest handler always runs. The array can be
created inline on each render.

```ts
useHotkeys(definitions: readonly HotkeyDefinition[]): void
```

### useHotkeyScope

Makes `name` the active scope while the component is mounted (and `isActive`): shortcuts
registered with `scope: name` fire and `global` ones stop, until the component unmounts.
Scopes stack: the most recently mounted one wins. Use it in the body of a panel, a wizard or
an editor that has its own shortcuts. Dialogs do not need it for page shortcuts: those are
already ignored while focus is inside an open dialog.

```ts
useHotkeyScope(name: string, { isActive }?: UseHotkeyScopeOptions): void
```

### useMediaQuery

Subscribes to a CSS media query. SSR-safe: on the server (and during hydration)
it returns `defaultValue` (`false` unless given), then the real value after hydration.

Prefer CSS media queries for styling; use this only when behavior (not appearance) depends on the query.

```ts
useMediaQuery(query: string, defaultValue?: boolean): boolean
```

### useMessages

Returns a component's messages for the active locale.

```ts
useMessages<M extends MessageSet>(componentKey: string, catalog: MessageCatalog<M>, overrides?: MessageOverrides): M
```

### usePrefersReducedMotion

True when the user asks the OS for reduced motion (`prefers-reduced-motion: reduce`).

```ts
usePrefersReducedMotion(): boolean
```

### useRegisteredHotkeys

The shortcuts that have a `description`, in registration order, for a help dialog or a
command list. By default only those that can fire now (active scope). Updates when
shortcuts mount, unmount or the active scope changes. Empty during server rendering.

```ts
useRegisteredHotkeys({ includeInactive, }?: UseRegisteredHotkeysOptions): readonly RegisteredHotkey[]
```

### useToast

Hook form of `toast`, for components that prefer a hook. It returns the same stable object,
so it is safe in dependency arrays.

```ts
useToast(): ToastApi
```

### useUndoable

Undo, don't confirm (AGENTS.md section 5): applies a reversible action immediately, shows a
toast with an **Undo** button, then either reverts it (Undo) or commits it (the toast times
out or is dismissed).

- `apply` runs now; the screen updates at once.
- Undo calls `revert`. Closing or timing out calls the optional async `commit`; if that
  fails, the change is reverted and an error toast stays until dismissed.
- The timer lives in the toast, so it pauses on hover and focus (WCAG 2.2.1) and the commit
  waits for it. A pending commit still runs if the component that started it unmounts.
- Mount one `ToastRegion` near the app root.

Use it for reversible actions (archive, mark as done, change status). Deleting still asks
for a confirmation first (`ConfirmDialog`); the Undo toast follows it.

Deferring the commit means a closed tab loses a pending change. When that matters, persist in
`apply` and make `revert` send the inverse change instead (omit `commit`).

```ts
useUndoable({ toast, messages: overrides, }?: UseUndoableOptions): UseUndoableResult
```

## Utilities and constants

### chartAverage

The arithmetic mean of chart values, for an `average` reference line:
`referenceLines={[{ kind: 'average', label: 'Average', value: chartAverage(data) }]}`.

Accepts numbers or chart data (`{ value }`). Non-finite entries are ignored; with nothing
left to average (or the sum overflows) the result is `0`. The result is never `NaN`.

```ts
chartAverage(values: readonly (number | { readonly value: number; })[]): number
```

### compareText

Compares two strings alphabetically for `locale`; usable as an `Array.prototype.sort` comparator.

```ts
compareText(a: string, b: string, locale: string): number
```

### contrastRatio

WCAG contrast ratio between two hex colors, from `1` (identical) to `21` (black on white). Order does not matter.

```ts
contrastRatio(a: string, b: string): number
```

### createTextCollator

Collator for alphabetical order as the product requires (AGENTS.md section 5, rule 5b):
accent- and case-insensitive (`sensitivity: 'base'`) with natural number order
(`numeric: true`, so `Item 2` sorts before `Item 10`). The instance is shared
and cached per locale; do not mutate it.

```ts
createTextCollator(locale: string): Intl.Collator
```

### createToastApi

Builds the `toast()` function for a queue.

```ts
createToastApi(queue: ToastQueue): ToastApi
```

### createToastQueue

Creates an independent queue, for tests or for a second region. Most apps use `toast`.

```ts
createToastQueue(): ToastQueue
```

### daysBetween

Whole days from `isoA` to `isoB` (positive when `isoB` is later). Uses UTC
date math, so daylight-saving changes cannot produce 23- or 25-hour "days".
Invalid input throws in development and returns `NaN` in production.

```ts
daysBetween(isoA: ISODate, isoB: ISODate): number
```

### DEFAULT_LOCALE

Default locale.

```ts
'en-US' | 'pt-BR';
```

### DEFAULT_TOAST_TIMEOUT

Default time a toast stays on screen, in milliseconds. The handoff used 3.6 s, which is too
short to read a sentence and press Undo (WCAG 2.2.1 Timing Adjustable); 5 s plus pause on
hover and focus lets keyboard and slow readers finish.

```ts
5000;
```

### defineMessages

Declares a component's catalog. Identity function that type-checks that
`pt-BR` has exactly the same keys and signatures as `en`.

```ts
defineMessages<M extends MessageSet>(catalog: { readonly en: M; readonly "pt-BR": NoInfer<M>; readonly [locale: string]: NoInfer<M> | undefined; }): MessageCatalog<M>
```

### dueStatus

Urgency of a due date: overdue (`< 0` days) is `danger`, due within a week
(`0` to `7`) is `warning`, later is `neutral`. The visible text always comes
from messages (color is never the only signal, AGENTS.md section 5).

```ts
dueStatus(dueISO: ISODate, todayISO: ISODate): DueStatus
```

### formatCurrency

Formats money held as an integer in minor units (ADR-0006):
`formatCurrency(123456, 'USD', 'en-US')` is `$1,234.56`.

The amount is passed to `Intl` as an exact decimal string, so there is no
floating-point drift. Non-integer or unsafe amounts throw in development
(a sign of a unit bug at the call site) and are rounded in production.

```ts
formatCurrency(minorUnits: number, currency: string, locale: string, options?: FormatCurrencyOptions): string
```

### formatDate

Formats an ISO date for `locale`. Formatting happens in UTC, so the day never
shifts with the viewer's time zone. Invalid input throws in development and
is returned unchanged in production.

`formatDate('2026-10-31', 'en-US', 'medium')` is `Oct 31, 2026`.

```ts
formatDate(iso: ISODate, locale: string, style?: DateStyle): string
```

### formatNumber

Formats a decimal number for `locale` (`1234.5` becomes `1,234.5` in `en-US`).

```ts
formatNumber(value: number, locale: string, options?: FormatNumberOptions): string
```

### formatPercent

Formats a ratio as a percentage: `0.256` becomes `26%` in `en-US`.
Pass `maximumFractionDigits` for more precision.

```ts
formatPercent(ratio: number, locale: string, options?: Omit<FormatNumberOptions, "unit" | "unitDisplay">): string
```

### formatRelativeDays

Relative day label from `Intl.RelativeTimeFormat` with `numeric: 'auto'`:
`-1` is `yesterday`, `0` is `today`, `1` is `tomorrow`, `3` is `in 3 days`.
`days` must be an integer (throws in development, rounded in production).

```ts
formatRelativeDays(days: number, locale: string): string
```

### getCurrencyDigits

Number of minor-unit digits of a currency (2 for USD/BRL, 0 for JPY, 3 for KWD),
read from `Intl` so we never keep our own table.

```ts
getCurrencyDigits(currency: string, locale: string): number
```

### getInitials

Initials of a person's name: the first letter of the first and of the last word
(`Ana Maria da Silva` gives `AS`), or one letter for a single word. Uses `Intl.Segmenter`,
so combined characters stay whole, and upper-cases with the locale rules (`i` in `tr`).

```ts
getInitials(name: string, locale: string): string
```

### getItemRange

The 1-based range of items on `page`, or `null` when there are no items.

```ts
getItemRange(page: number, pageSize: number, total: number): { from: number; to: number; } | null
```

### getPageCount

Number of pages for `total` items shown `pageSize` at a time (at least 1).

```ts
getPageCount(total: number, pageSize: number): number
```

### getPageItems

Which page buttons to show, with ellipses for the pages that are left out.

Up to 7 pages all of them are listed. Beyond that the first page, the last page, the current
page and its two neighbours are listed, and a gap between two of them becomes an ellipsis.
A gap that hides exactly one page shows that page instead (an ellipsis for a single page
would be wider than the page it hides). `current` is clamped into `1..pageCount`; a
`pageCount` below 1 is treated as 1.

```
getPageItems(1, 10)  // 1 2 3 4 5 6 7 8 9 10 collapses to: 1 2 … 10
getPageItems(5, 10)  // 1 … 4 5 6 … 10
```

```ts
getPageItems(current: number, pageCount: number): PageItem[]
```

### getSourceElementId

The DOM id of one source of a list. `Citation` builds the same id from `listId` and `sourceId`.

```ts
getSourceElementId(listId: string, sourceId: string): string
```

### highlightMatch

Splits `text` into matched and unmatched segments for highlighting, ignoring case
and accents. The segments always concatenate back to `text` exactly, and a match
keeps any combining marks attached to its last letter. All occurrences are returned.

`highlightMatch('Crème brûlée', 'creme')` gives `[{ text: 'Crème', match: true }, { text: ' brûlée', match: false }]`.

```ts
highlightMatch(text: string, query: string): HighlightSegment[]
```

### hotkeyKeys

The parts of a combo in display order, ready for `Kbd`'s `keys`: `'Mod+K'` gives
`['Mod', 'K']`, `'Shift+/'` gives `['Shift', '/']`. Returns `[]` for a malformed combo (never throws).

```ts
hotkeyKeys(combo: string): string[]
```

### HotkeyProvider

Optional root provider for the shortcut registry. Without it `useHotkeys` uses one shared
registry for the whole page, which is enough for most apps; add the provider to isolate the
shortcuts of a subtree (micro frontends, tests, Storybook) or to pin the platform.

Place it inside `DSProvider` and above the `CommandPalette` and `ShortcutsHelp` it feeds.

```ts
HotkeyProvider({ children, platform }: HotkeyProviderProps): React.JSX.Element
```

### HotkeyRegistry

The store behind `HotkeyProvider`, `useHotkeys` and `useRegisteredHotkeys`. One `keydown`
listener on `document` is attached while at least one shortcut is registered. Framework
independent so it can be tested without React.

```ts
typeof HotkeyRegistry;
```

### iconNames

Kebab-case names of the curated set with the use each icon is meant for. Source of the
allow-list in the component manifest; keep it in sync with the exports above (tested).

```ts
{ readonly 'arrow-down': "Descending sort, move down"; readonly 'arrow-left': "Back, previous page"; readonly 'arrow-right': "Forward, next step"; readonly 'arrow-up': "Ascending sort, move up"; readonly archive: "Archive an item (reversible, with Undo); not for delete"; readonly bell: "Notifications and alerts entry point"; readonly bot: "An AI agent as an actor, for example an agent avatar or a bot-authored message"; readonly calendar: "Date fields and date pickers"; readonly check: "Done, selected, checkbox mark"; readonly 'chevron-down': "Collapsed disclosure, select trigger, menu button"; readonly 'chevron-left': "Previous month or page (use the directional prop so it mirrors in RTL)"; readonly 'chevron-right': "Next month or page, submenu, breadcrumb separator (directional)"; readonly 'chevron-up': "Expanded disclosure"; readonly 'chevrons-up-down': "Sortable column, select trigger with many options"; readonly 'circle-alert': "Error and danger status"; readonly 'circle-check': "Success status"; readonly 'circle-x': "Failed status, clear input"; readonly ellipsis: "More actions (overflow menu)"; readonly 'external-link': "Link that opens in a new tab"; readonly filter: "Filter a list or table (opens filter controls)"; readonly info: "Neutral information status"; readonly link: "Copy or insert a link, linked records"; readonly loader: "Loading glyph (static); animated loading uses Spinner"; readonly message: "Messages, chat and comments, for example a conversational agent"; readonly menu: "Opens the navigation menu (hamburger), for example the app shell nav toggle"; readonly minus: "Remove one, indeterminate checkbox"; readonly pencil: "Edit an item or a field in place"; readonly plus: "Add, create"; readonly printer: "Print a document or a receipt"; readonly search: "Search fields"; readonly sparkles: "AI-generated content or an AI-assisted action (suggest, generate)"; readonly star: "Rating, favorite"; readonly 'triangle-alert': "Warning status"; readonly copy: "Copy to the clipboard"; readonly refresh: "Regenerate, reload, sync again"; readonly 'thumbs-down': "Negative feedback on a response"; readonly 'thumbs-up': "Positive feedback on a response"; readonly trash: "Delete an item; always paired with a confirmation dialog"; readonly users: "A group of people, for example team, members or assignees"; readonly x: "Close, dismiss, remove"; }
```

### iconSet

The curated set by kebab-case name, for tooling and name-driven rendering.

```ts
{ readonly 'arrow-down': LucideIcon; readonly 'arrow-left': LucideIcon; readonly 'arrow-right': LucideIcon; readonly 'arrow-up': LucideIcon; readonly archive: LucideIcon; readonly bell: LucideIcon; readonly bot: LucideIcon; readonly calendar: LucideIcon; readonly check: LucideIcon; readonly 'chevron-down': LucideIcon; readonly 'chevron-left': LucideIcon; readonly 'chevron-right': LucideIcon; readonly 'chevron-up': LucideIcon; readonly 'chevrons-up-down': LucideIcon; readonly 'circle-alert': LucideIcon; readonly 'circle-check': LucideIcon; readonly 'circle-x': LucideIcon; readonly ellipsis: LucideIcon; readonly 'external-link': LucideIcon; readonly filter: LucideIcon; readonly info: LucideIcon; readonly link: LucideIcon; readonly loader: LucideIcon; readonly menu: LucideIcon; readonly message: LucideIcon; readonly minus: LucideIcon; readonly pencil: LucideIcon; readonly plus: LucideIcon; readonly printer: LucideIcon; readonly search: LucideIcon; readonly sparkles: LucideIcon; readonly star: LucideIcon; readonly 'triangle-alert': LucideIcon; readonly copy: LucideIcon; readonly refresh: LucideIcon; readonly 'thumbs-down': LucideIcon; readonly 'thumbs-up': LucideIcon; readonly trash: LucideIcon; readonly users: LucideIcon; readonly x: LucideIcon; }
```

### isHexColor

True for `#rgb` and `#rrggbb` (the `#` is required). Accepts model data typed
`string | null | undefined`; `null`, `undefined`, `transparent`, a CSS name and an empty string are
false. Deliberately a plain boolean, not a type predicate: a string that fails the check is still a
string.

```ts
isHexColor(value: string | null | undefined): boolean
```

### isISODate

True if `value` is a real calendar date written as `YYYY-MM-DD`.

```ts
isISODate(value: string): value is ISODate
```

### matchesSearch

True when `text` contains `query`, ignoring case and accents. An empty query matches everything.

```ts
matchesSearch(text: string, query: string): boolean
```

### niceScale

Computes a "nice" value axis for data between `minValue` and `maxValue`.

The axis always includes zero (bars grow from it), so an all-positive data set starts at 0,
an all-negative one ends at 0, and mixed data spans both sides. The step is a round number
(1, 2, 2.5, 5 or 10 times a power of ten) and the ends are multiples of it, aiming for about
`tickCount` ticks. It handles zero data (axis 0 to 1), tiny values (`0.00003`), huge values
and non-finite input (treated as 0).

```ts
niceScale(0, 42).ticks; // [0, 10, 20, 30, 40, 50]
niceScale(-3, 8).ticks; // [-5, -2.5, 0, 2.5, 5, 7.5, 10]
```

```ts
niceScale(minValue: number, maxValue: number, tickCount?: number): NiceScale
```

### normalizeSearch

Normalizes text for accent- and case-insensitive search: `Café` and `cafe` both
become `cafe`. Works per code point so it stays index-aligned with `highlightMatch`.

```ts
normalizeSearch(text: string): string
```

### parseCurrencyAmount

Parses what the user typed in **whole units** into integer minor units (the `amount` typing
mode of `CurrencyInput`): `200` is 200.00, so `20000` in BRL; `12,5` is `1250`.

Rules, applied with string manipulation only (no floats):

- Digits are whole units until a decimal mark; the locale's own digits and full-width digits
  count. Other characters (symbols, spaces, signs, letters) are ignored.
- The **last** `.` or `,` (or the locale's decimal mark) starts the fraction when it is the
  only one of its kind and either it is the locale's decimal mark, or it is followed by at
  most as many digits as the currency has minor digits (and is not the locale's grouping
  mark followed by exactly three digits, as in `1.234` for KWD in pt-BR). Otherwise it is
  grouping and ignored: `1.234,56` and `1,234.56` are both 1234.56; `1,234` is 1234 in USD.
- Fraction digits beyond the currency's minor digits are cut (not rounded). Currencies with
  0 minor digits (JPY) have no fraction: every mark is ignored.
- A missing fraction is padded with zeros. Text without digits is `0`. The result is cut to
  15 digits so it is always a safe integer. The sign is not handled here.

```ts
parseCurrencyAmount(text: string, currency: string, locale: string): number
```

### parseCurrencyInput

Parses what the user typed in a currency field into integer minor units, using
the digits-only typing model: every digit shifts in from the right, and any
other character (separators, symbols, spaces, a sign) is ignored. Typing
`1`, `2`, `3` into a USD field yields `1`, `12`, `123`, shown as `$0.01`,
`$0.12`, `$1.23`. Digits of the locale's numbering system (e.g. Arabic-Indic)
and full-width digits count as digits. Empty input is `0`. Input longer than
15 digits is cut, so the result is always a safe integer.

`currency` is validated through `Intl` (throws `RangeError` for an invalid code).
Pasting `12` into a USD field means `$0.12` by this model; callers that want
to accept pasted decimals must handle paste before calling this function.

```ts
parseCurrencyInput(text: string, currency: string, locale: string): number
```

### plural

Picks a plural form for `count` using `Intl.PluralRules`.
Call it from catalog functions, passing that catalog's own locale:
`selected: (n: number) => plural('en', n, { one: '1 selected', other: `${n} selected` })`.

```ts
plural(locale: string, count: number, forms: PluralForms): string
```

### readableTextOn

Which text color is more readable on a background color: `'light'` (white-ish
text, for dark backgrounds) or `'dark'`. Picks whichever of white or black has
the higher WCAG contrast, replacing the handoff's 0.299/0.587/0.114 shortcut.

```ts
readableTextOn(backgroundHex: string): "light" | "dark"
```

### relativeLuminance

WCAG 2.x relative luminance of a hex color: `0` (black) to `1` (white).
Accepts `#rgb` and `#rrggbb`. Invalid colors throw in development and count as black in production.

```ts
relativeLuminance(hex: string): number
```

### sortByText

Returns a new array sorted alphabetically by `getText(item)`. Stable: items whose
text compares equal (for example `Ana` and `ana`, or `é` and `e`) keep their input order.

```ts
sortByText<T>(items: readonly T[], getText: (item: T) => string, locale: string): T[]
```

### SUPPORTED_LOCALES

Locales that ship with built-in message catalogs (ADR-0005).

```ts
readonly[('en-US', 'pt-BR')];
```

### toast

Shows a toast in the default queue. Mount one `ToastRegion` near the app root.

```ts
toast(message: ReactNode, options?: ToastOptions): string
```

### toastWithUndo

Non-hook form of the undo toast, for plain modules (stores, services, event handlers outside
React). Shows `message` with an **Undo** action whose label comes from the message catalogue
and the active locale, so callers never repeat the word by hand. Returns the toast key, like
`toast()`.

Unlike `useUndoable` it does not defer anything: do the change first, then call this with a
function that reverses it. Use `useUndoable` inside components when you also need a deferred
`commit` or failure handling.

Outside React there is no context, so the locale is the one of the mounted `ToastRegion`
(inside `DSProvider`); pass `locale` or `messages` to decide it yourself.

```ts
toastWithUndo(message: ReactNode, options: ToastWithUndoOptions): string
```

### toCalendarDay

Normalizes a calendar-day input to `YYYY-MM-DD`. Accepts an `ISODate` (returned unchanged, so a
plain date is never shifted by a time zone), a `Date` (its **local** day) or an ISO date-time
string such as `2026-10-31T23:30:00-03:00` (parsed with `new Date()`, then its **local** day).
Any other string is returned unchanged for the caller's own validation. An unparsable `Date`
or date-time throws in development and gives `''` in production.

```ts
toCalendarDay(value: Date | string): ISODate
```

### toISODate

Converts a `Date` to `YYYY-MM-DD` using its **local** calendar day (what the
user sees on their clock). Pass `{ utc: true }` to use the UTC day instead.
Invalid dates and years outside 0000-9999 throw in development and give `''` in production.

```ts
toISODate(date: Date, options?: { utc?: boolean; }): ISODate
```

### TOOLTIP_DELAY

Default time in milliseconds the pointer must rest on the trigger before the tooltip opens.

```ts
500;
```

### warnDeprecated

Logs a deprecation warning once per `name`. Development only: a no-op in
production builds and on the server-side of production. Call it from the
deprecated component's body or module, passing what to use instead.

`warnDeprecated('OldButton', 'Use Button with variant="ghost" instead.')`

```ts
warnDeprecated(name: string, message: string): void
```

## Icons

Bundled Lucide icons, exported with an `Icon` suffix. Pass one to `Icon`, `IconButton` or a `leading`/`trailing` slot. Decorative unless labelled.

`ArchiveIcon`, `ArrowDownIcon`, `ArrowLeftIcon`, `ArrowRightIcon`, `ArrowUpIcon`, `BellIcon`, `BotIcon`, `CalendarIcon`, `CheckIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronsUpDownIcon`, `ChevronUpIcon`, `CircleAlertIcon`, `CircleCheckIcon`, `CircleXIcon`, `CopyIcon`, `EllipsisIcon`, `ExternalLinkIcon`, `FilterIcon`, `InfoIcon`, `LinkIcon`, `LoaderIcon`, `MenuIcon`, `MessageIcon`, `MinusIcon`, `PencilIcon`, `PlusIcon`, `PrinterIcon`, `RefreshIcon`, `SearchIcon`, `SparklesIcon`, `StarIcon`, `ThumbsDownIcon`, `ThumbsUpIcon`, `TrashIcon`, `TriangleAlertIcon`, `UsersIcon`, `XIcon`
