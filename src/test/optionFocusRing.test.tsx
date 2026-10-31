/**
 * GAP-011: the focus ring of a focused option or item must not be clipped.
 *
 * The ring is a 3px box-shadow, which an `overflow: auto` list clips at its scrollport edge. The
 * option boxes span the full width of the list, so the ring was cut off on the left and right.
 * For Select, Combobox and Menu: open the list, move focus with the keyboard to the first, a middle
 * and the last option, and require that the option grown by its ring spread fits inside the
 * scrollport (the scroll container's padding box without the scrollbar) horizontally, and
 * vertically when the option is at the start or end of the list.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '../components/Button';
import { Combobox } from '../components/Combobox';
import { Menu, MenuItem } from '../components/Menu';
import { Select } from '../components/Select';
import { DSProvider } from '../providers/DSProvider';
import { settle } from './stories';

const options = Array.from({ length: 12 }, (_, index) => ({
  value: `o${String(index)}`,
  label: `Option number ${String(index + 1)}`,
}));

/** Spread of the last box-shadow layer, for example `rgba(...) 0px 0px 0px 3px` gives 3. */
function ringSpread(el: Element): number {
  const shadow = getComputedStyle(el).boxShadow;
  if (shadow === 'none') return 0;
  const lengths = shadow.replace(/rgba?\([^)]*\)/g, '').match(/-?[\d.]+px/g) ?? [];
  return Math.max(0, ...lengths.slice(3, 4).map((value) => parseFloat(value)));
}

function scrollParent(el: Element): HTMLElement {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
  }
  throw new Error('The option has no scroll container.');
}

interface Check {
  label: string;
  ok: boolean;
  detail: string;
}

function checkRing(option: Element, position: 'first' | 'middle' | 'last'): Check {
  const spread = ringSpread(option);
  const container = scrollParent(option);
  const box = option.getBoundingClientRect();
  const port = container.getBoundingClientRect();
  const left = port.left + container.clientLeft;
  const top = port.top + container.clientTop;
  const right = left + container.clientWidth;
  const bottom = top + container.clientHeight;
  const horizontal = box.left - spread >= left - 0.5 && box.right + spread <= right + 0.5;
  const vertical =
    (position !== 'first' || box.top - spread >= top - 0.5) &&
    (position !== 'last' || box.bottom + spread <= bottom + 0.5);
  return {
    label: `${position} option "${option.textContent.trim().slice(0, 20)}"`,
    ok: spread >= 3 && horizontal && vertical,
    detail: `ring ${String(spread)}px; option ${box.left.toFixed(1)}..${box.right.toFixed(1)} x ${box.top.toFixed(1)}..${box.bottom.toFixed(1)}, scrollport ${left.toFixed(1)}..${right.toFixed(1)} x ${top.toFixed(1)}..${bottom.toFixed(1)}`,
  };
}

function focusedOption(): Element | null {
  return document.querySelector(
    '[role="listbox"] [role="option"][data-focus-visible], [role="menu"] [role="menuitem"][data-focus-visible], [role="listbox"] [role="option"][data-focused]',
  );
}

const unmounts: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const unmount of unmounts.splice(0)) await unmount();
});

async function checkList(open: () => Promise<void>): Promise<void> {
  await open();
  await settle();
  const failures: string[] = [];
  const visit = async (position: 'first' | 'middle' | 'last') => {
    await settle();
    const option = focusedOption();
    if (!option) {
      failures.push(`${position}: no focused option`);
      return;
    }
    const result = checkRing(option, position);
    if (!result.ok) failures.push(`${result.label}: ${result.detail}`);
  };
  await userEvent.keyboard('{Home}');
  await visit('first');
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
  await visit('middle');
  await userEvent.keyboard('{End}');
  await visit('last');
  expect(failures, failures.join('\n')).toEqual([]);
}

describe('GAP-011: option focus ring is not clipped', () => {
  it('Select', async () => {
    const screen = await render(
      <DSProvider>
        <Select label="Region" options={options} />
      </DSProvider>,
    );
    unmounts.push(screen.unmount);
    await checkList(async () => {
      await userEvent.tab();
      await userEvent.keyboard('{ArrowDown}');
      screen.getByRole('listbox').element();
    });
  });

  it('Combobox', async () => {
    const screen = await render(
      <DSProvider>
        <Combobox label="Customer" options={options} />
      </DSProvider>,
    );
    unmounts.push(screen.unmount);
    await checkList(async () => {
      await userEvent.tab();
      await userEvent.keyboard('{ArrowDown}');
      screen.getByRole('listbox').element();
    });
  });

  it('Menu', async () => {
    const screen = await render(
      <DSProvider>
        <Menu trigger={<Button>Actions</Button>}>
          {options.map((option) => (
            <MenuItem key={option.value} id={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </DSProvider>,
    );
    unmounts.push(screen.unmount);
    await checkList(async () => {
      await userEvent.tab();
      await userEvent.keyboard('{Enter}');
      screen.getByRole('menu').element();
    });
  });
});
