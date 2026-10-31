/**
 * TOK-013: state and icon rendering in forced-colors mode.
 *
 * With forced colors on, author colors collapse to a handful of system colors, so a state that is
 * only a different fill or text color becomes invisible. These suites require that:
 *
 * - a selected / checked / current / expanded element paints differently from an unselected peer
 *   (a border, outline, underline, weight or glyph change survives; a color-only change does not),
 * - a disabled element paints differently from an enabled peer,
 * - icons (`currentColor` strokes) stay visible against the surface behind them.
 *
 * Peers are found inside each story: elements of the same component part (same tag, role and CSS
 * module class) where one is in the state and another is not.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Checkbox } from '../components/Checkbox';
import { Switch } from '../components/Switch';
import { DSProvider } from '../providers/DSProvider';
import { paintSignature, setForcedColors } from './forcedColors';
import { allStories, renderStory } from './stories';
import { allowedFor } from './wcag-allowlist';

beforeAll(async () => {
  await setForcedColors(true);
});
afterAll(async () => {
  await setForcedColors(false);
});

const unmounts: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const unmount of unmounts.splice(0)) await unmount();
});

function isHiddenInput(el: Element): boolean {
  if (el.tagName !== 'INPUT') return false;
  // React Aria wraps the native input in a clipped, absolutely positioned span.
  for (let node: Element | null = el; node && node.tagName !== 'LABEL'; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.position === 'absolute' && style.clipPath === 'inset(50%)') return true;
  }
  return false;
}

/** The element that paints the state: for a visually hidden input, its label. */
function paintRoot(el: Element): Element {
  return isHiddenInput(el) ? (el.closest('label') ?? el) : el;
}

function isRendered(el: Element): boolean {
  if (el.closest('[hidden], [inert], [data-live-announcer]')) return false;
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function groupKey(el: Element): string {
  const root = paintRoot(el);
  return `${root.tagName}|${root.getAttribute('role') ?? ''}|${root.getAttribute('class') ?? ''}`;
}

function describe_(el: Element): string {
  const root = paintRoot(el);
  const name = root.getAttribute('aria-label') ?? root.textContent.trim().slice(0, 24);
  return `<${root.tagName.toLowerCase()} class="${root.getAttribute('class') ?? ''}"> "${name}"`;
}

function isOn(el: Element, attribute: string): boolean {
  const value = el.getAttribute(attribute);
  return value !== null && value !== 'false';
}

interface StateProbe {
  name: string;
  /** Selector for elements that can be in or out of the state. */
  selector: string;
  isOn: (el: Element) => boolean;
  /** Elements that are intentionally not distinguishable by paint alone. */
  skip?: (el: Element) => boolean;
}

const notDisabled = (el: Element) =>
  !el.matches(':disabled, [aria-disabled="true"], [data-disabled]');

const SELECTED_PROBES: StateProbe[] = [
  {
    name: 'aria-selected',
    selector: '[aria-selected]',
    isOn: (el) => isOn(el, 'aria-selected'),
    skip: (el) => !notDisabled(el),
  },
  {
    name: 'aria-checked',
    selector: '[aria-checked]:not([aria-checked="mixed"])',
    isOn: (el) => isOn(el, 'aria-checked'),
    skip: (el) => !notDisabled(el),
  },
  {
    name: 'checked input',
    selector: 'input[type="checkbox"], input[type="radio"]',
    isOn: (el) => (el as HTMLInputElement).checked,
    skip: (el) => !notDisabled(el) || !notDisabled(paintRoot(el)),
  },
  {
    name: 'aria-pressed',
    selector: '[aria-pressed]',
    isOn: (el) => isOn(el, 'aria-pressed'),
    skip: (el) => !notDisabled(el),
  },
  {
    name: 'aria-current',
    selector: '[aria-current]',
    isOn: (el) => isOn(el, 'aria-current'),
    skip: (el) => !notDisabled(el),
  },
  {
    name: 'aria-expanded',
    selector: 'button[aria-expanded], summary[aria-expanded]',
    isOn: (el) => isOn(el, 'aria-expanded'),
    skip: (el) => !notDisabled(el),
  },
];

function peerFailures(root: ParentNode, probe: StateProbe): string[] {
  const groups = new Map<string, { on: Element[]; off: Element[] }>();
  for (const el of Array.from(root.querySelectorAll(probe.selector))) {
    if (!isRendered(paintRoot(el)) || probe.skip?.(el)) continue;
    const key = groupKey(el);
    const group = groups.get(key) ?? { on: [], off: [] };
    (probe.isOn(el) ? group.on : group.off).push(el);
    groups.set(key, group);
  }
  const failures: string[] = [];
  for (const { on, off } of groups.values()) {
    const [selected] = on;
    const [unselected] = off;
    if (!selected || !unselected) continue;
    if (paintSignature(paintRoot(selected)) === paintSignature(paintRoot(unselected))) {
      failures.push(
        `${probe.name}: ${describe_(selected)} paints the same as ${describe_(unselected)} in forced colors`,
      );
    }
  }
  return failures;
}

function disabledFailures(root: ParentNode): string[] {
  const groups = new Map<string, { on: Element[]; off: Element[] }>();
  const selector =
    'button, a[href], input:not([type="hidden"]), select, textarea, [role="tab"], [role="option"], [role="menuitem"], [role="radio"], [role="checkbox"], [role="switch"], [role="gridcell"]';
  for (const el of Array.from(root.querySelectorAll(selector))) {
    const rendered = paintRoot(el);
    if (!isRendered(rendered)) continue;
    const disabled =
      el.matches(':disabled, [aria-disabled="true"]') || rendered.hasAttribute('data-disabled');
    const key = groupKey(el);
    const group = groups.get(key) ?? { on: [], off: [] };
    (disabled ? group.on : group.off).push(el);
    groups.set(key, group);
  }
  const failures: string[] = [];
  for (const { on, off } of groups.values()) {
    const [disabled] = on;
    // Compare with an enabled peer in the same state so a selected-vs-not difference is not counted.
    const peer = off.find(
      (candidate) =>
        disabled !== undefined &&
        candidate.getAttribute('aria-selected') === disabled.getAttribute('aria-selected') &&
        candidate.getAttribute('aria-checked') === disabled.getAttribute('aria-checked') &&
        (candidate as HTMLInputElement).checked === (disabled as HTMLInputElement).checked,
    );
    if (!disabled || !peer) continue;
    if (paintSignature(paintRoot(disabled)) === paintSignature(paintRoot(peer))) {
      failures.push(`disabled: ${describe_(disabled)} paints the same as ${describe_(peer)}`);
    }
  }
  return failures;
}

function effectiveBackground(el: Element): string {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
  }
  return getComputedStyle(document.body).backgroundColor;
}

function iconFailures(root: ParentNode): string[] {
  const failures: string[] = [];
  for (const svg of Array.from(root.querySelectorAll('svg.lucide'))) {
    if (!isRendered(svg)) continue;
    const style = getComputedStyle(svg);
    const paint = style.stroke !== 'none' ? style.stroke : style.fill;
    if (paint === 'none' || paint === 'transparent' || paint === 'rgba(0, 0, 0, 0)') {
      failures.push(`icon has no stroke or fill (${svg.parentElement?.className ?? ''})`);
      continue;
    }
    if (paint === effectiveBackground(svg)) {
      failures.push(`icon ${paint} equals its background (${svg.parentElement?.className ?? ''})`);
    }
  }
  return failures;
}

describe('forced colors: states and icons per story', () => {
  for (const entry of allStories()) {
    it(`${entry.id} (${entry.file})`, async () => {
      const rendered = await renderStory(entry);
      unmounts.push(rendered.unmount);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      const failures = [
        ...SELECTED_PROBES.flatMap((probe) => peerFailures(document.body, probe)),
        ...disabledFailures(document.body),
        ...iconFailures(document.body),
      ];
      const allowed = allowedFor('forced-colors-state', entry.id);
      const remaining = failures.filter(
        (failure) => !allowed.some((a) => a.selector !== undefined && failure.includes(a.selector)),
      );
      expect(remaining, remaining.join('\n')).toEqual([]);
    });
  }
});

describe('forced colors: standalone control states', () => {
  async function pair(on: React.ReactElement, off: React.ReactElement) {
    const onScreen = await render(<DSProvider>{on}</DSProvider>);
    const onSignature = paintSignature(onScreen.container);
    await onScreen.unmount();
    const offScreen = await render(<DSProvider>{off}</DSProvider>);
    const offSignature = paintSignature(offScreen.container);
    await offScreen.unmount();
    return { onSignature, offSignature };
  }

  it('control: a color-only difference collapses in forced colors', async () => {
    const result = await pair(
      <span style={{ background: 'red', color: 'blue' }}>State</span>,
      <span style={{ background: 'green', color: 'yellow' }}>State</span>,
    );
    // If this ever differs, forced colors is not active and the suites above prove nothing.
    expect(result.onSignature).toBe(result.offSignature);
  });

  it('Checkbox: checked and indeterminate differ from unchecked', async () => {
    const checked = await pair(
      <Checkbox defaultSelected label="Label" />,
      <Checkbox label="Label" />,
    );
    expect(checked.onSignature).not.toBe(checked.offSignature);
    const mixed = await pair(
      <Checkbox isIndeterminate label="Label" />,
      <Checkbox label="Label" />,
    );
    expect(mixed.onSignature).not.toBe(mixed.offSignature);
  });

  it('Switch: on differs from off', async () => {
    const result = await pair(<Switch defaultSelected label="Label" />, <Switch label="Label" />);
    expect(result.onSignature).not.toBe(result.offSignature);
  });

  it('Checkbox and Switch: disabled differs from enabled', async () => {
    const checkbox = await pair(<Checkbox isDisabled label="Label" />, <Checkbox label="Label" />);
    expect(checkbox.onSignature).not.toBe(checkbox.offSignature);
    const toggle = await pair(<Switch isDisabled label="Label" />, <Switch label="Label" />);
    expect(toggle.onSignature).not.toBe(toggle.offSignature);
  });
});
