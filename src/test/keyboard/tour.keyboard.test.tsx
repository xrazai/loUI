/**
 * Keyboard contract: Tour (a non-modal dialog, so the page stays reachable).
 * Spec: AGENTS.md section 8, row "Dialog / sheet": focus contained, Esc closes and focus returns
 * to the trigger (TEST-004).
 */
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Button } from '../../components/Button';
import { Tour } from '../../components/Tour';
import { renderWithProvider } from '../render';
import { expectFocus, expectFocusOn, press, tabTo } from './contract';

const stepOpen = (title: string) =>
  [...document.querySelectorAll('[role="dialog"]')].some(
    (d) => d.getAttribute('aria-label') === title || d.textContent.includes(title),
  );
const none = () => document.querySelector('[role="dialog"]') === null;

function Page({ onSkip, onComplete }: { onSkip?: () => void; onComplete?: () => void }) {
  const [open, setOpen] = useState(false);
  const search = useRef<HTMLButtonElement>(null);
  const filters = useRef<HTMLButtonElement>(null);
  return (
    <main>
      <Button
        onPress={() => {
          setOpen(true);
        }}
      >
        Start tour
      </Button>
      <Button ref={search}>Search</Button>
      <Button ref={filters}>Filters</Button>
      <Tour
        steps={[
          { target: search, title: 'Search step', content: 'Find any item by name.' },
          { target: filters, title: 'Filters step', content: 'Narrow the list.' },
        ]}
        isOpen={open}
        onOpenChange={setOpen}
        {...(onSkip ? { onSkip } : {})}
        {...(onComplete ? { onComplete } : {})}
      />
    </main>
  );
}

async function startTour() {
  await userEvent.tab();
  await expectFocus('Start tour');
  const trigger = document.activeElement as HTMLElement;
  await press('{Enter}');
  await expect.poll(() => stepOpen('Search step')).toBe(true);
  return trigger;
}

describe('keyboard contract: tour', () => {
  it('Enter on the start button opens the first step and moves focus to it', async () => {
    await renderWithProvider(<Page />);
    await startTour();
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('dialog');
  });

  it('Tab reaches Skip tour and Next inside the step; Enter on Next advances', async () => {
    await renderWithProvider(<Page />);
    await startTour();
    await tabTo('Skip tour');
    await tabTo('Next');
    await press('{Enter}');
    await expect.poll(() => stepOpen('Filters step')).toBe(true);
  });

  it('Escape skips the tour and returns focus to the button that started it', async () => {
    const onSkip = vi.fn();
    await renderWithProvider(<Page onSkip={onSkip} />);
    const trigger = await startTour();
    await press('{Escape}');
    await expect.poll(none).toBe(true);
    expect(onSkip).toHaveBeenCalledTimes(1);
    await expectFocusOn(trigger);
  });

  it('Tab cycles through the step controls only; Escape is the way back to the page', async () => {
    // Observed behavior: the step is aria-modal-free but keyboard focus is contained in it
    // (Skip tour, Next, Skip tour, ...). See the TEST-004 report for the open question.
    await renderWithProvider(<Page />);
    await startTour();
    const seen = new Set<string>();
    for (let i = 0; i < 8; i += 1) {
      await userEvent.tab();
      seen.add(document.activeElement?.textContent.trim() ?? '');
    }
    expect([...seen].sort()).toEqual(['Next', 'Skip tour']);
  });
});
