import { describe, expect, it, vi } from 'vitest';
import { renderWithProvider } from '../test/render';
import { useControllableState } from './useControllableState';

function Counter({
  value,
  defaultValue = 0,
  onChange,
}: {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}) {
  const [count, setCount] = useControllableState({ value, defaultValue, onChange });
  return (
    <button
      type="button"
      onClick={() => {
        setCount(count + 1);
      }}
    >
      {`count ${count}`}
    </button>
  );
}

describe('useControllableState', () => {
  it('is uncontrolled when no value is given', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Counter defaultValue={5} onChange={onChange} />);
    await screen.getByRole('button', { name: 'count 5' }).click();
    await expect.element(screen.getByRole('button', { name: 'count 6' })).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(6);
  });

  it('is controlled when a value is given: reports changes but does not move on its own', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Counter value={1} onChange={onChange} />);
    await screen.getByRole('button', { name: 'count 1' }).click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(2);
    await expect.element(screen.getByRole('button', { name: 'count 1' })).toBeInTheDocument();
    await screen.rerender(<Counter value={2} onChange={onChange} />);
    await expect.element(screen.getByRole('button', { name: 'count 2' })).toBeInTheDocument();
  });

  it('does not call onChange when the value is unchanged', async () => {
    const onChange = vi.fn();
    function Setter() {
      const [value, setValue] = useControllableState({ defaultValue: 'a', onChange });
      return (
        <button
          type="button"
          onClick={() => {
            setValue('a');
          }}
        >
          {value}
        </button>
      );
    }
    const screen = await renderWithProvider(<Setter />);
    await screen.getByRole('button', { name: 'a' }).click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('works without onChange', async () => {
    const screen = await renderWithProvider(<Counter />);
    await screen.getByRole('button', { name: 'count 0' }).click();
    await expect.element(screen.getByRole('button', { name: 'count 1' })).toBeInTheDocument();
  });
});
