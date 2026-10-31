/**
 * WCAG 2.4.11 Focus Not Obscured (Minimum), level AA (TEST-014).
 *
 * When keyboard focus moves, the browser scrolls the focused element into view. Fixed or sticky
 * UI (the toast region, a sticky DataTable header, an AppShell top bar) must not end up on top of
 * it. Each fixture tabs (or focuses) through a long list of controls with that UI present and
 * checks, with `elementFromPoint`, that the center of the focused element is not covered by an
 * unrelated element. Level AA only requires the element not to be entirely hidden; checking the
 * center is deliberately stricter.
 */
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { toast, ToastRegion } from '../components/Toast';
import { TopBar } from '../components/TopBar';
import { DSProvider } from '../providers/DSProvider';
import { settle } from './stories';

/** The element covering the center of `el`, or null when the center is free. */
function coveredBy(el: Element): Element | null {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return el; // scrolled out of view
  const top = document.elementFromPoint(x, y);
  if (!top || top === el || el.contains(top) || top.contains(el)) return null;
  return top;
}

function label(el: Element | null): string {
  if (!el) return 'nothing';
  const text = el.textContent.trim().slice(0, 30);
  return `<${el.tagName.toLowerCase()} class="${el.className}"> "${text}"`;
}

const unmounts: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  toast.clear();
  for (const unmount of unmounts.splice(0)) await unmount();
});

const buttons = Array.from({ length: 40 }, (_, index) => index + 1);

function Buttons({ prefix }: { prefix: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {buttons.map((n) => (
        <Button key={n} variant="secondary" fullWidth>
          {prefix} {n}
        </Button>
      ))}
    </div>
  );
}

function ToastsOn() {
  useEffect(() => {
    toast.info('Draft saved', { timeout: null });
    toast.success('Order created', { timeout: null });
    return () => {
      toast.clear();
    };
  }, []);
  return null;
}

async function tabThrough(count: number): Promise<string[]> {
  const failures: string[] = [];
  const visited = new Set<Element>();
  for (let index = 0; index < count; index += 1) {
    await userEvent.keyboard('{Tab}');
    const focused = document.activeElement;
    if (!focused || focused === document.body) continue;
    visited.add(focused);
    // Toast controls and the page scroller itself are not the content under test.
    if (focused.closest('[aria-label="Toast notifications"]')) continue;
    const cover = coveredBy(focused);
    if (cover) failures.push(`${label(focused)} is covered by ${label(cover)}`);
  }
  // Guards against a fixture that silently stops moving focus and so checks nothing.
  if (visited.size < count / 2)
    failures.push(`focus only visited ${String(visited.size)} elements`);
  return failures;
}

describe('WCAG 2.4.11 focus not obscured', () => {
  it('the toast region does not cover the focused element on the page', async () => {
    const screen = await render(
      <DSProvider>
        <Buttons prefix="Action" />
        <ToastsOn />
        <ToastRegion />
      </DSProvider>,
    );
    unmounts.push(screen.unmount);
    await settle();
    const failures = await tabThrough(buttons.length);
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('the toast region does not cover the focused element in the AppShell main area', async () => {
    const screen = await render(
      <DSProvider>
        <div style={{ blockSize: '100dvh' }}>
          <AppShell topBar={<TopBar title="Orders" />}>
            <Buttons prefix="Row" />
          </AppShell>
        </div>
        <ToastsOn />
        <ToastRegion />
      </DSProvider>,
    );
    unmounts.push(screen.unmount);
    await settle();
    const failures = await tabThrough(buttons.length);
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('the AppShell top bar does not cover the focused element', async () => {
    const screen = await render(
      <DSProvider>
        <div style={{ blockSize: '100dvh' }}>
          <AppShell topBar={<TopBar title="Orders" />}>
            <Buttons prefix="Row" />
          </AppShell>
        </div>
      </DSProvider>,
    );
    unmounts.push(screen.unmount);
    await settle();
    const failures = await tabThrough(buttons.length);
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('a sticky DataTable header does not cover the focused row', async () => {
    interface Row {
      id: string;
      name: string;
    }
    const rows: Row[] = Array.from({ length: 30 }, (_, index) => ({
      id: `r${String(index)}`,
      name: `Customer ${String(index)}`,
    }));
    const screen = await render(
      <DSProvider>
        <DataTable<Row>
          aria-label="Customers"
          columns={[{ key: 'name', label: 'Name' }]}
          rows={rows}
          rowKey="id"
          stickyHeader
          maxHeight={220}
          pageSize={false}
        />
      </DSProvider>,
    );
    unmounts.push(screen.unmount);
    await settle();
    const failures: string[] = [];
    const visited = new Set<Element>();
    // Start on the first body row (not a Tab sequence, which depends on what had focus before).
    const first = document.querySelector<HTMLElement>('tbody [role="row"]');
    first?.focus();
    for (let index = 0; index < rows.length; index += 1) {
      await userEvent.keyboard('{ArrowDown}');
      const focused = document.activeElement;
      if (!focused || focused === document.body) continue;
      visited.add(focused);
      const cover = coveredBy(focused);
      if (cover) failures.push(`${label(focused)} is covered by ${label(cover)}`);
    }
    // Guards against a fixture that stops moving focus and so checks nothing.
    if (visited.size < 20)
      failures.push(`arrow keys only visited ${String(visited.size)} elements`);
    expect(failures, failures.join('\n')).toEqual([]);
  });
});
