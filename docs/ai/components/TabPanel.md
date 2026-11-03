# TabPanel

> The content of one tab. `id` must equal the `id` of its `Tab`; the panel is then labelled by
> the tab and the tab points to the panel (`aria-controls`). The panel is focusable when it
> has no focusable content, so keyboard users can reach it.

Tabs switch between panels of related content on the same page. Built on React Aria `Tabs`, `TabList`, `Tab` and `TabPanel`: one tab stop, arrow keys between tabs, panels linked to their tabs.

- Handoff source: `components/navigation/Tabs.jsx` (TODO `CMP-NAV-01`).

- Import: `import { TabPanel } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Tabs/Tabs.tsx`
- Stories (Storybook title `Components/Tabs`): Default, ArrowKeys, FocusMovesIntoPanel, ManualActivation, Counts, ShortcutHints, DisabledTab, Controlled, LongLabels, RightToLeft, Focused

## Props

| Prop        | Type                  | Required | Default | Description                    |
| ----------- | --------------------- | -------- | ------- | ------------------------------ |
| `children`  | `ReactNode`           |          |         | Panel content.                 |
| `className` | `string`              |          |         |                                |
| `ref`       | `Ref<HTMLDivElement>` |          |         | Ref to the `tabpanel` element. |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `AriaTabPanelProps` (react-aria): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `TabPanelProps` (react-aria-components): `shouldForceMount`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-accent-soft`, `--ds-danger`, `--ds-danger-soft`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-small`, `--ds-line`, `--ds-opacity-disabled`, `--ds-radius-pill`, `--ds-radius-sm`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-success`, `--ds-success-soft`, `--ds-tabs-count-padding-inline`, `--ds-tabs-count-size`, `--ds-tabs-gap`, `--ds-tabs-indicator-height`, `--ds-target-min`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-warning`, `--ds-warning-soft`, `--ds-weight-medium`, `--ds-weight-regular`

## When to use

- Several views of the same object (Details, Items, History) where only one is shown at a time.
- Filtering a list into a few named groups that each have their own panel.

## When not to use

- To pick a value without panels (a view mode, a unit): use `SegmentedControl`.
- To move between pages or routes: use `NavItem` in a navigation list, or `Link`s. (`Tab` does accept `href`, but a primary navigation is not a tab list.)
- For more than about seven tabs, or for steps of a process.

## Anatomy

```
Tabs                         (root, flex column)
  TabList  aria-label        (role=tablist, 1px bottom line)
    Tab id                   (role=tab; 2px ink underline when selected)
      label
      count                  (optional; neutral text or a toned pill)
      shortcut hint          (optional Kbd, aria-hidden)
  TabPanel id                (role=tabpanel, labelled by its tab)
```

## Accessibility

- Roles: `tablist` > `tab` (with `aria-selected`, `aria-controls`) and `tabpanel` (`aria-labelledby` the tab).
- Keyboard: `Tab` enters the list once (roving tab stop) and the next `Tab` goes to the panel; `←` / `→` move (and wrap), `Home` / `End` jump. In right-to-left locales the arrows swap. Disabled tabs are skipped.
- Activation: automatic by default. Use `keyboardActivation="manual"` when showing a panel is slow or has side effects, so arrowing across tabs does not trigger work.
- Count: the visible count is part of the tab name ("Orders 12"). With `countLabel` the visible number is hidden from assistive technology and the label is read instead ("Pending 3 pending"). Color never carries the meaning, so a toned count always needs words.
- Shortcut hint: decorative; it does not change the name. Tell users about the shortcut elsewhere (help, tooltip) if it matters.
- Contrast: inactive tab text is `--ds-text-3` on `--ds-bg` (passes). Do not place tabs on a raised or hover surface without checking.
- Focus: accent ring on the tab and on a focused panel. Forced colors: the selected underline uses `Highlight`.
- Reduced motion: only a color transition, neutralized by the base styles.

## Content rules

- Labels are nouns in sentence case ("Order items"), one or two words.
- Do not repeat the count in the label. `countLabel` says what the number counts ("3 pending").

## Examples

```tsx
<Tabs defaultSelectedKey="items">
  <TabList aria-label="Order sections">
    <Tab id="details">Details</Tab>
    <Tab id="items" count={12} countTone="warning" countLabel="12 pending">
      Items
    </Tab>
    <Tab id="history" shortcut={['3']}>
      History
    </Tab>
  </TabList>
  <TabPanel id="details">…</TabPanel>
  <TabPanel id="items">…</TabPanel>
  <TabPanel id="history">…</TabPanel>
</Tabs>
```

## Related components

- Instead, see SegmentedControl: To pick a value without panels (a view mode, a unit): use `SegmentedControl`.
- Instead, see NavItem: To move between pages or routes: use `NavItem` in a navigation list, or `Link`s. (`Tab` does accept `href`, but a primary navigation is not a tab list.)
- Instead, see Link: To move between pages or routes: use `NavItem` in a navigation list, or `Link`s. (`Tab` does accept `href`, but a primary navigation is not a tab list.)
- Instead, see Tab: To move between pages or routes: use `NavItem` in a navigation list, or `Link`s. (`Tab` does accept `href`, but a primary navigation is not a tab list.)
- Renders: Kbd, VisuallyHidden
