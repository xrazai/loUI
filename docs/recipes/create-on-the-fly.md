# CreateOnTheFly

Status: experimental

Pick an item from a list, or create it without leaving the field: typing a name that matches nothing ends the list with a `Create "name"` row. Choosing it creates the item, selects it and shows a toast with Undo. Built on `Combobox` (`onCreate`, option `leading`) and the `useUndoable` hook.

Components: `Combobox`, `Swatch`, `Text`, `Toast` (through `useUndoable`).

## When to use

- A field whose list the user can extend as they go: labels, categories, tags, customers, colours.
- The new item needs nothing more than a name (the rest has a sensible default).

## When not to use

- The new item needs several fields: open a `Sheet` or `Dialog` from `onCreate` instead (see `sheet-form`).
- The typed text is itself the value and nothing is stored (a free-text field with suggestions): use `allowsCustomValue`.

## What it does

1. The options are alphabetical, each with a decorative `Swatch` as `leading`. The selected option's swatch also shows at the start of the input.
2. While the typed text is not blank and matches no label (accent- and case-insensitive), the list ends with `Create “name”`. It is reachable with `ArrowDown` and chosen with `Enter` or a click, like any option.
3. Choosing it calls `onCreate(name)` and not `onChange`. The handler adds the label and sets `value` to it; the input then shows the new label.
4. A toast says what happened, in the past tense, with **Undo**. Undo removes the label and restores the previous selection. Creating is reversible, so nothing is asked first. The optional `saveLabel` runs when the Undo window closes.

## Things to keep when you adapt it

- Keep `value` controlled. The Create row never becomes the selection; the handler is what selects the new item.
- Give the new item every default it needs inside `onCreate` (here, the next colour of a palette).
- Trim and normalise the name in the handler; `onCreate` already receives it trimmed.
- The `leading` node is hidden from assistive technology: the option name is its text. Do not use it as the only carrier of meaning.
- If the handler selects nothing, the input empties when the list closes, as in any combobox without `allowsCustomValue`.

## Code

<!-- recipe-source:start -->

```tsx
import { useState } from 'react';
import { Combobox, sortByText, Stack, Swatch, Text, useUndoable } from 'loui-ds';
import type { ComboboxOption } from 'loui-ds';

export interface Label {
  value: string;
  label: string;
  /** Hex colour, `#rrggbb`. */
  color: string;
}

const LABELS: Label[] = [
  { value: 'fragile', label: 'Fragile', color: '#c2764f' },
  { value: 'gift', label: 'Gift', color: '#6f8fc8' },
  { value: 'priority', label: 'Priority', color: '#d2a44a' },
];

/** Colours given to labels created on the fly, in turn. */
const PALETTE = ['#5fd49a', '#8ab4ff', '#e9b65c', '#f07a6e', '#b49ae8'];

export interface CreateOnTheFlyProps {
  initialLabels?: Label[];
  /** Saves the new label on the server. Runs after the Undo window closes. */
  saveLabel?: (label: Label) => Promise<void>;
}

function toOption(label: Label): ComboboxOption {
  return {
    value: label.value,
    label: label.label,
    leading: <Swatch color={label.color} decorative />,
  };
}

/**
 * Pick a label, or create it without leaving the field. Typing a name that matches no label adds
 * a `Create "name"` row at the end of the list; choosing it creates the label, selects it and
 * shows a toast with Undo (creating is reversible, so it never asks first).
 */
export function CreateOnTheFly({ initialLabels = LABELS, saveLabel }: CreateOnTheFlyProps) {
  const [labels, setLabels] = useState(initialLabels);
  const [value, setValue] = useState<string | null>(null);
  const undoable = useUndoable();
  const options = sortByText(labels.map(toOption), (option) => option.label, 'en');
  const selected = labels.find((label) => label.value === value);

  function create(name: string) {
    const label: Label = {
      value: name.toLowerCase().replace(/\s+/g, '-'),
      label: name,
      color: PALETTE[labels.length % PALETTE.length] ?? '#8ab4ff',
    };
    const previous = value;
    undoable.run({
      message: `Label “${name}” created`,
      apply: () => {
        setLabels((list) => [...list, label]);
        setValue(label.value);
      },
      revert: () => {
        setLabels((list) => list.filter((item) => item.value !== label.value));
        setValue((current) => (current === label.value ? previous : current));
      },
      commit: () => saveLabel?.(label),
    });
  }

  return (
    <Stack gap={3}>
      <Combobox
        label="Label"
        description="Type a new name to create a label."
        options={options}
        value={value}
        onChange={setValue}
        onCreate={create}
        placeholder="Search or create"
      />
      <Text tone="secondary" size="small" as="p">
        {selected ? `Selected: ${selected.label}` : 'No label selected'}
      </Text>
    </Stack>
  );
}
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/CreateOnTheFly/CreateOnTheFly.test.tsx` (alphabetical list with swatches, Create only without a match, create and select from the keyboard, Undo, deferred save, axe), `src/components/Combobox/Combobox.test.tsx` (the `onCreate` and `leading` contracts) and the `Recipes/CreateOnTheFly` stories.
