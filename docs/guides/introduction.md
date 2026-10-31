# Introduction

Loui DS is a dark, minimal, functional design system for internal tools, dashboards and apps. It ships design tokens, React components and the documentation that lets people and AI agents use them correctly.

It was designed for low-friction, focus-first use: one main action per screen, the most important thing first and largest, color only with meaning, and a keyboard-first workflow. It is operated by humans and by AI agents, so every rule is written down and, where possible, machine-readable.

## What is in the package

| Piece                | Import                                      | What it is                                                                               |
| -------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Components           | `import { Button } from '@loui/ds'`         | Accessible React components built on React Aria Components, styled with CSS Modules.     |
| Hooks and utilities  | `import { formatCurrency } from '@loui/ds'` | Locale-aware formatting, sorting, search, color contrast, `useHotkey`, `useMediaQuery`.  |
| Internationalization | `import { DSProvider } from '@loui/ds'`     | English by default, `pt-BR` included, every built-in string overridable.                 |
| Styles and tokens    | `import '@loui/ds/styles.css'`              | Layered CSS with every design token as a `--ds-*` custom property.                       |
| Patterns             | `import { ... } from '@loui/ds/patterns'`   | Domain compositions with generic names. Empty until the pattern migration lands.         |
| AI interface         | `manifest.json`, `tokens.json`, `llms.txt`  | Machine-readable component and token reference. See [Using with AI](./using-with-ai.md). |

## How it is built

- **Behavior from React Aria Components.** Focus, keyboard, overlays and ARIA come from RAC; we never re-implement them.
- **Tokens first.** Components use semantic tokens only (no raw colors or pixel values). Tokens are DTCG JSON built with Terrazzo.
- **Accessibility is part of done.** WCAG 2.2 AA is the target. A component is finished only when its axe tests, keyboard-contract tests and visual baselines pass.
- **Dark only.** The semantic token layer is theme-able, but dark is the only shipped theme. A `paper` scope is the single light surface (receipt and PDF previews).
- **React 19 only.** Refs are props; there is no `forwardRef`. Components are SSR-safe.

## Where to go next

- [Getting started](./getting-started.md): install, stylesheet, provider, fonts, SSR.
- [Principles](./principles.md): the rules every screen follows.
- [Content guidelines](./content-guidelines.md): how the interface talks.
- [Accessibility](./accessibility.md): what we promise and how we test it.
- [Using with AI](./using-with-ai.md): manifest, `llms.txt`, Storybook MCP.

## Component status

Every component carries a lifecycle status: `experimental`, `stable` or `deprecated`. All components are currently `experimental`, which means the API can still change before the first stable release. Do not use `experimental` or `deprecated` components in recipes unless you accept that.
