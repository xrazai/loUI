import { useState } from 'react';
import { Combobox, Stack, Swatch, Text, sortByText, useUndoable } from '../../index';
import type { ComboboxOption } from '../../index';

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
