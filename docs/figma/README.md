# Figma workflow

Code is the source of truth for Loui DS. Figma follows it: tokens flow from code to Figma through Tokens Studio, and components in Figma mirror the code components by name. Nothing here calls the Figma API; the generated files are inputs for the Tokens Studio plugin and for people.

| File                                                           | Content                                                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`tokens-studio/tokens.json`](../../tokens-studio/tokens.json) | Generated Tokens Studio token set (all `--ds-*` tokens). Never edit.  |
| [`component-parity.md`](./component-parity.md)                 | Generated table: code component, Figma component, variant properties. |

## Tokens Studio sync

The export is built from the same DTCG sources as `src/styles/tokens.css` (`src/tokens/*.json`, built by Terrazzo), so a token name, alias and value in Figma are the ones in code.

### What the export contains

- One single-file token set with three sets in load order: `primitive`, `semantic`, `core`. Enable all three in Tokens Studio. Aliases cross sets (`{color.gray.0}`), so enabling only `semantic` shows unresolved references.
- Names are the DTCG paths (`color.bg-canvas`, `space.4`, `button.hover-brightness`). The CSS variable of each token is stored in `$extensions["com.loui-ds"].cssVar` (`--ds-bg-canvas`).
- Aliases stay aliases, including alias chains (`chart.color` points at `color.accent`, which points at `color.blue.5`).
- The `*-soft` colors are the base color with an alpha modifier (`{color.accent}` with `modify: alpha 0.14`), matching the `color-mix` in CSS. Focus-ring shadows keep the resolved color and carry the mix in `$extensions["com.loui-ds"].mix`.
- Typography composites (`typography.*`) are Tokens Studio `typography` tokens. They have no CSS variable; CSS uses the `--ds-fs-*`, `--ds-lh-*` and `--ds-weight-*` tokens.
- Dark only (ADR-0007): there is one theme. `$themes` is empty. The `[data-theme="paper"]` scope is not exported.

### Code to Figma (the normal direction)

1. Change tokens in `src/tokens/` and run `pnpm tokens:build`. It regenerates the CSS, the TypeScript map, the flat JSON **and** `tokens-studio/tokens.json`.
2. Commit the source and all regenerated outputs together. `pnpm tokens:check` fails when any of them is stale, including the Tokens Studio file.
3. In Figma, open the Tokens Studio plugin. Pick the sync provider (below), pull, and apply the sets to the document. Variables are created by Tokens Studio ("Styles & variables" export); do not hand-create variables with the same names.

### Choosing a sync provider

- **GitHub (recommended once the repository is reachable by the design team):** Tokens Studio, Settings, Add new, GitHub. Repository `xrazai/loUI`, branch `main`, file path `tokens-studio/tokens.json`. Set it to **pull only**; designers must not push to this path.
- **Local file / JSON paste (works today):** open `tokens-studio/tokens.json`, copy it, and in Tokens Studio use Settings, Token storage, Local document, then Import, JSON. Repeat after each token change.

### Figma to code (exceptions only)

Do not edit tokens in Figma and push them back. If a designer needs a new or changed token:

1. Open a TODO item or an issue with the token name, value, and where it is used.
2. A developer edits `src/tokens/`, runs `pnpm tokens:build`, and the next pull brings it into Figma.

Tokens that exist only in Figma are treated as drift and removed on the next pull.

### How drift is prevented

`scripts/tokens/studio.test.ts` (run by `pnpm test:unit`) reads the committed `src/styles/tokens.css` and `tokens-studio/tokens.json`, resolves every value independently of the generators, and requires:

- the same set of tokens on both sides (every CSS variable has a Tokens Studio token and the reverse);
- the same resolved value for each pair (colors normalized, aliases followed, soft colors compared by base and alpha);
- the same alias structure (a CSS `var()` reference is a Tokens Studio `{reference}` to the matching token);
- the committed export equals a fresh build.

`pnpm tokens:check` also runs `tsx scripts/tokens/studio.ts --check`. If you change the export format, update the test's resolver in the same change.

## Component naming parity

Figma components mirror code components so a designer, a developer and an agent can find the same thing by name. The full table is generated: [`component-parity.md`](./component-parity.md). Regenerate it after `pnpm manifest:build` with `pnpm figma:parity` (`--check` fails when it is stale).

Rules, applied by the generator:

| Concept           | Code                                                    | Figma                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component         | Export name, PascalCase (`IconButton`)                  | Component set named `<Group>/<Name>` with the same PascalCase name (`Components/IconButton`). The group is the Storybook group (`Components`, `Patterns`, `Layout`, `Typography`, `Primitives`). |
| Variant           | `variant` prop (`'primary' \| 'ghost'`)                 | Variant property `Variant` with sentence-case values (`Primary`, `Danger solid`).                                                                                                                |
| Size              | `size` prop (`'sm' \| 'md' \| 'lg'`)                    | Variant property `Size` with the values as written (`sm`, `md`, `lg`).                                                                                                                           |
| Tone              | `tone` prop                                             | Variant property `Tone` with sentence-case values.                                                                                                                                               |
| State flags       | Boolean props `isX`, `fullWidth`                        | Boolean property in sentence case without the `is` prefix (`isReadOnly` becomes `Read only`). `isDisabled` is modeled as the `State` below, not as a boolean.                                    |
| Interaction state | CSS `:hover`, `[data-focus-visible]`, `[data-disabled]` | Variant property `State` = `Default`, `Hover`, `Focus`, `Pressed`, `Disabled`. Only where the component has the state.                                                                           |
| Text content      | `children`, label props                                 | Text property named after the prop (`Label`).                                                                                                                                                    |
| Layers            | Anatomy sections in `<Name>.md`                         | Layer names follow the anatomy names in the component doc.                                                                                                                                       |

Only `variant`, `size`, `tone` and boolean state props are generated; the rest of the contract (content, interaction states, layers) is applied by hand when a component is drawn. Never invent a property that has no counterpart in code: add the prop to the component first, or leave it out of Figma.

Use the component's `docs/ai/components/<Name>.md` for the full prop list and `docs/tokens.json` for the allowed color pairings when drawing.

## Code Connect (optional)

Code Connect links a Figma component to its code snippet so Dev Mode shows real usage. It is optional and needs a Figma organization or enterprise plan; nothing in the repository depends on it.

If the team adopts it:

1. Keep the naming rules above; Code Connect maps by component set, and parity is what makes the mapping mechanical.
2. Add `*.figma.tsx` files **next to the component** (`src/components/Button/Button.figma.tsx`), not under `docs/`. Use `figma.connect(Button, '<figma-url>', { props: { variant: figma.enum('Variant', { Primary: 'primary', ... }), size: figma.enum('Size', { sm: 'sm', md: 'md', lg: 'lg' }), fullWidth: figma.boolean('Full width') }, example: (props) => <Button {...props}>...</Button> })`.
3. Derive each `figma.enum` map from the parity table rather than by hand: the Figma values are the sentence-case form of the code values and the code values are in `docs/manifest.json`.
4. Publish with `npx figma connect publish` using a token with Code Connect write scope. Keep the token in CI secrets, never in the repository.
5. Exclude `*.figma.tsx` from the library build and from the manifest (they are not exports). Add that exclusion in the same change that adds the first file.

Until then, record the Figma file URL in the component's `<Name>.md` under a "Design" heading so people can still jump from code to design.
