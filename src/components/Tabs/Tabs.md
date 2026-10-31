# Tabs

Status: experimental

Tabs switch between panels of related content on the same page. Built on React Aria `Tabs`, `TabList`, `Tab` and `TabPanel`: one tab stop, arrow keys between tabs, panels linked to their tabs.

- Handoff source: `components/navigation/Tabs.jsx` (TODO `CMP-NAV-01`).

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

## Props

| Component  | Prop                                 | Notes                                                                                             |
| ---------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `Tabs`     | `selectedKey` / `defaultSelectedKey` | Controlled / uncontrolled selection (React Aria naming). Defaults to the first enabled tab.       |
|            | `onSelectionChange(key)`             | Called when the user selects a tab.                                                               |
|            | `keyboardActivation`                 | `'automatic'` (default): arrows select. `'manual'`: arrows move focus, `Enter` / `Space` select.  |
|            | `isDisabled`, `disabledKeys`         | Disable all or some tabs.                                                                         |
| `TabList`  | `aria-label` / `aria-labelledby`     | Name the list. Required when there is more than one tab list on the page.                         |
| `Tab`      | `id`                                 | Required; must equal the `id` of its `TabPanel`.                                                  |
|            | `count`                              | Number (formatted for the locale) or string shown after the label.                                |
|            | `countTone`                          | `neutral` (default, plain mono text), `accent`, `success`, `warning`, `danger` (soft pill).       |
|            | `countLabel`                         | Accessible text for the count ("3 pending"). Replaces the bare number in the accessible name.     |
|            | `shortcut`                           | `Kbd` keys (`['1']`). Decorative: `aria-hidden`, registers nothing. Register it with `useHotkey`. |
|            | `isDisabled`, `href`                 | Disabled tab; or a tab that is a link.                                                            |
| `TabPanel` | `id`, `shouldForceMount`             | `id` matches the tab. Force-mounted inactive panels are inert.                                    |

All parts accept `className` and `ref`; other props pass through.

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

## Differences from the handoff

- Compound parts (`Tabs`, `TabList`, `Tab`, `TabPanel`) instead of an `items` array, so panels can be linked. The handoff had no panels.
- Real `tablist` semantics with roving focus, `Home` / `End`, `aria-controls` / `aria-labelledby`, and automatic or manual activation. The handoff only had click handlers.
- The count and shortcut live on `Tab`; counts are formatted with `Intl` and can carry a text alternative.
- The vertical orientation is not supported (the prop is omitted).
- No inline strings, so there is no message catalog; the shortcut hint reuses `Kbd`.
