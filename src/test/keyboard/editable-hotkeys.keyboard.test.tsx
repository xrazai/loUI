/**
 * Keyboard contract: hotkeys while an editable DS field has focus (GAP-035).
 * A consumer `onKeyDown` on a field must not stop `useHotkeys(..., { allowInEditable })`
 * shortcuts (F9, F2, N) from reaching the registry, unless that handler handled the key by
 * calling `preventDefault()`.
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Combobox } from '../../components/Combobox';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Input } from '../../components/Input';
import { NumberField } from '../../components/NumberField';
import { SearchInput } from '../../components/SearchInput';
import { Textarea } from '../../components/Textarea';
import { HotkeyProvider } from '../../hooks/HotkeyProvider';
import { useHotkeys } from '../../hooks/useHotkeys';
import { renderWithProvider } from '../render';

function Hotkeys({ onF9, onN }: { onF9: () => void; onN: () => void }) {
  useHotkeys([
    { keys: 'F9', handler: onF9, allowInEditable: true },
    { keys: 'N', handler: onN, allowInEditable: true },
  ]);
  return null;
}

type OnKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => void;

const fields: { name: string; ui: (onKeyDown: OnKeyDown) => React.ReactElement }[] = [
  { name: 'Input', ui: (onKeyDown) => <Input label="Field" onKeyDown={onKeyDown} /> },
  {
    name: 'CurrencyInput',
    ui: (onKeyDown) => <CurrencyInput label="Field" currency="USD" onKeyDown={onKeyDown} />,
  },
  {
    name: 'Combobox',
    ui: (onKeyDown) => (
      <Combobox label="Field" options={[{ value: 'a', label: 'Alpha' }]} onKeyDown={onKeyDown} />
    ),
  },
  { name: 'Textarea', ui: (onKeyDown) => <Textarea label="Field" onKeyDown={onKeyDown} /> },
  { name: 'SearchInput', ui: (onKeyDown) => <SearchInput label="Field" onKeyDown={onKeyDown} /> },
  {
    name: 'NumberField',
    ui: (onKeyDown) => <NumberField label="Field" onKeyDown={onKeyDown} />,
  },
];

describe.each(fields)('$name with a consumer onKeyDown', ({ ui }) => {
  async function setup(onKeyDown: OnKeyDown) {
    const onF9 = vi.fn();
    const onN = vi.fn();
    await renderWithProvider(
      <HotkeyProvider platform="other">
        <Hotkeys onF9={onF9} onN={onN} />
        {ui(onKeyDown)}
      </HotkeyProvider>,
    );
    const input = document.querySelector('input:not([type="hidden"]), textarea');
    if (!input) throw new Error('No editable element rendered');
    await userEvent.click(input);
    return { onF9, onN };
  }

  it('lets keys the handler ignored reach allowInEditable hotkeys', async () => {
    const seen = vi.fn();
    const { onF9, onN } = await setup(seen);
    await userEvent.keyboard('{F9}');
    await userEvent.keyboard('n');
    expect(seen).toHaveBeenCalled();
    expect(onF9).toHaveBeenCalledTimes(1);
    expect(onN).toHaveBeenCalledTimes(1);
  });

  it('keeps a key the handler handled with preventDefault away from hotkeys', async () => {
    const { onF9 } = await setup((event) => {
      if (event.key === 'F9') event.preventDefault();
    });
    await userEvent.keyboard('{F9}');
    expect(onF9).not.toHaveBeenCalled();
  });
});
