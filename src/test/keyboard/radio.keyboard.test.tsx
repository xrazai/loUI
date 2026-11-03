/**
 * Keyboard contract: radio group, SegmentedControl, ChoiceTiles, ToggleGroup.
 * Spec: AGENTS.md section 8, row "Radio group / segmented / choice tiles": one tab stop (roving),
 * prev/next arrows (radio groups wrap, ToggleButtonGroup stops at the ends), Space selects (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ChoiceTiles } from '../../components/ChoiceTiles';
import { Radio, RadioGroup } from '../../components/RadioGroup';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Toggle } from '../../components/Toggle';
import { ToggleGroup } from '../../components/ToggleGroup';
import { renderWithProvider } from '../render';
import { activeLabel, expectFocus, press, tabOrder } from './contract';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];

function Around({ children }: { children: React.ReactNode }) {
  return (
    <>
      <button type="button">Before</button>
      {children}
      <button type="button">After</button>
    </>
  );
}

interface Props {
  defaultValue?: string;
  onChange?: (value: string) => void;
  disableBravo?: boolean;
}

const radioLikes: Record<string, (props: Props) => React.ReactElement> = {
  RadioGroup: ({ disableBravo, ...props }) => (
    <Around>
      <RadioGroup label="Choice" {...props}>
        <Radio value="a" label="Alpha" />
        <Radio value="b" label="Bravo" {...(disableBravo ? { isDisabled: true } : {})} />
        <Radio value="c" label="Charlie" />
      </RadioGroup>
    </Around>
  ),
  ChoiceTiles: ({ disableBravo, ...props }) => (
    <Around>
      <ChoiceTiles
        label="Choice"
        options={options.map((o) =>
          disableBravo && o.value === 'b' ? { ...o, isDisabled: true } : o,
        )}
        {...props}
      />
    </Around>
  ),
};

/** Moves focus to the first option, the way a keyboard user arrives. */
async function enterGroup() {
  await userEvent.tab();
  await userEvent.tab();
}

describe.each(Object.keys(radioLikes))('keyboard contract: %s as a radio group', (name) => {
  const ui = radioLikes[name];
  if (!ui) throw new Error(`Unknown case ${name}`);

  it('is one Tab stop: Tab enters on the first option, the next Tab leaves the group', async () => {
    await renderWithProvider(ui({}));
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Alpha', 'After']);
    // Shift+Tab re-enters the group on one option (native radios pick first or last), then leaves.
    expect(['Alpha', 'Charlie']).toContain((await tabOrder(1, true))[0]);
    expect(await tabOrder(1, true)).toEqual(['Before']);
  });

  it('Tab enters on the selected option, not the first', async () => {
    await renderWithProvider(ui({ defaultValue: 'b' }));
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['Bravo']);
  });

  it('next arrows (Right/Down) move and select, previous arrows (Left/Up) go back', async () => {
    const onChange = vi.fn();
    await renderWithProvider(ui({ onChange }));
    await enterGroup();
    await press('{ArrowRight}');
    await expectFocus('Bravo');
    expect(onChange).toHaveBeenLastCalledWith('b');
    await press('{ArrowDown}');
    await expectFocus('Charlie');
    expect(onChange).toHaveBeenLastCalledWith('c');
    await press('{ArrowLeft}');
    await expectFocus('Bravo');
    await press('{ArrowUp}');
    await expectFocus('Alpha');
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('wraps around at both ends (React Aria radio pattern)', async () => {
    await renderWithProvider(ui({}));
    await enterGroup();
    await press('{ArrowLeft}');
    await expectFocus('Charlie');
    await press('{ArrowRight}');
    await expectFocus('Alpha');
  });

  it('Space selects the focused option when nothing is selected', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(ui({ onChange }));
    await enterGroup();
    await press(' ');
    expect(onChange).toHaveBeenLastCalledWith('a');
    await expect.element(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();
  });

  it('only one option is checked at a time while arrowing', async () => {
    const screen = await renderWithProvider(ui({}));
    await enterGroup();
    await press('{ArrowRight}{ArrowRight}');
    const checked = screen
      .getByRole('radio')
      .elements()
      .filter((el) => (el as HTMLInputElement).checked)
      .map((el) => (el as HTMLInputElement).labels?.[0]?.textContent.trim());
    expect(checked).toEqual(['Charlie']);
  });

  it('disabled options are skipped by arrows', async () => {
    await renderWithProvider(ui({ disableBravo: true }));
    await enterGroup();
    await press('{ArrowRight}');
    await expectFocus('Charlie');
  });
});

describe('keyboard contract: ToggleGroup (single selection)', () => {
  function Group({ onChange }: { onChange?: (v: string[]) => void }) {
    return (
      <Around>
        <ToggleGroup
          aria-label="Alignment"
          selectionMode="single"
          {...(onChange ? { onChange } : {})}
        >
          <Toggle id="left">Left</Toggle>
          <Toggle id="center">Center</Toggle>
          <Toggle id="right">Right</Toggle>
        </ToggleGroup>
      </Around>
    );
  }

  it('is one Tab stop (roving) and the next Tab leaves the group', async () => {
    await renderWithProvider(<Group />);
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Left', 'After']);
  });

  it('arrows move focus and stop at the ends (no wrapping)', async () => {
    await renderWithProvider(<Group />);
    await enterGroup();
    await press('{ArrowRight}{ArrowRight}');
    await expectFocus('Right');
    await press('{ArrowRight}');
    expect(activeLabel()).toBe('Right');
    await press('{ArrowLeft}{ArrowLeft}');
    await expectFocus('Left');
    await press('{ArrowLeft}');
    expect(activeLabel()).toBe('Left');
  });

  it('Space and Enter select without moving focus; single mode keeps one selected', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Group onChange={onChange} />);
    await enterGroup();
    await press(' ');
    expect(onChange).toHaveBeenLastCalledWith(['left']);
    await press('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['center']);
    const selected = [
      ...document.querySelectorAll('[aria-checked="true"],[aria-pressed="true"]'),
    ].map((el) => el.textContent.trim());
    expect(selected).toEqual(['Center']);
  });
});

describe('keyboard contract: SegmentedControl (toggle-button group exposed as radios)', () => {
  function Segmented({
    onChange,
    disableBravo,
  }: {
    onChange?: (value: string) => void;
    disableBravo?: boolean;
  }) {
    return (
      <Around>
        <SegmentedControl
          aria-label="Choice"
          options={options.map((o) =>
            disableBravo && o.value === 'b' ? { ...o, isDisabled: true } : o,
          )}
          {...(onChange ? { onChange } : {})}
        />
      </Around>
    );
  }

  it('is one Tab stop and the next Tab leaves the group', async () => {
    await renderWithProvider(<Segmented />);
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Alpha', 'After']);
    expect(await tabOrder(1, true)).toEqual(['Alpha']);
    expect(await tabOrder(1, true)).toEqual(['Before']);
  });

  it('arrows move focus without selecting and stop at the ends (ToggleButtonGroup, no wrapping)', async () => {
    const onChange = vi.fn();
    await renderWithProvider(<Segmented onChange={onChange} />);
    await enterGroup();
    await press('{ArrowRight}');
    await expectFocus('Bravo');
    await press('{ArrowRight}');
    await expectFocus('Charlie');
    await press('{ArrowRight}');
    expect(activeLabel()).toBe('Charlie');
    await press('{ArrowLeft}{ArrowLeft}');
    await expectFocus('Alpha');
    await press('{ArrowLeft}');
    expect(activeLabel()).toBe('Alpha');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Space selects the focused option', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Segmented onChange={onChange} />);
    await enterGroup();
    await press('{ArrowRight} ');
    expect(onChange).toHaveBeenLastCalledWith('b');
    await expect.element(screen.getByRole('radio', { name: 'Bravo' })).toBeChecked();
    await expect.element(screen.getByRole('radio', { name: 'Alpha' })).not.toBeChecked();
  });

  it('skips disabled options', async () => {
    await renderWithProvider(<Segmented disableBravo />);
    await enterGroup();
    await press('{ArrowRight}');
    await expectFocus('Charlie');
  });
});
