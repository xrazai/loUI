import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Timeline } from './Timeline';
import type { TimelineItem, TimelineProps } from './Timeline';

const items: TimelineItem[] = [
  { id: 'a', time: '2026-10-28T09:15:00Z', title: 'Request created', actor: 'Ana Costa' },
  {
    id: 'b',
    time: '2026-10-29T13:40:00Z',
    title: 'Review started',
    description: 'Assigned to the operations team.',
  },
  { id: 'c', time: '2026-10-31T16:05:00Z', title: 'Request approved', tone: 'success' },
];

function Example(props: Partial<TimelineProps>) {
  return <Timeline aria-label="Request history" items={items} timeZone="UTC" {...props} />;
}

function titles(container: Element): string[] {
  return Array.from(container.querySelectorAll('li')).map(
    (li) => li.querySelector('div > div')?.textContent.trim() ?? '',
  );
}

describe('Timeline', () => {
  describe('structure', () => {
    it('is a named ordered list with one item per event', async () => {
      const screen = await renderWithProvider(<Example />);
      const list = screen.getByRole('list', { name: 'Request history' });
      expect(list.element().tagName).toBe('OL');
      expect(screen.getByRole('listitem').elements()).toHaveLength(3);
    });

    it('renders title, description and actor', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByText('Review started')).toBeVisible();
      await expect.element(screen.getByText('Assigned to the operations team.')).toBeVisible();
      await expect.element(screen.getByText('By Ana Costa')).toBeVisible();
    });

    it('draws the marker as decoration', async () => {
      const screen = await renderWithProvider(<Example />);
      const markers = screen.container.querySelectorAll('li > span[aria-hidden="true"]');
      expect(markers).toHaveLength(3);
    });

    it('renders the empty content when there are no events', async () => {
      const screen = await renderWithProvider(<Example items={[]} empty={<p>No events yet.</p>} />);
      await expect.element(screen.getByText('No events yet.')).toBeVisible();
      expect(screen.getByRole('list').elements()).toHaveLength(0);
    });

    it('renders nothing for no events and no empty content', async () => {
      const screen = await renderWithProvider(<Example items={[]} />);
      expect(screen.container.querySelector('ol')).toBeNull();
    });
  });

  describe('order', () => {
    it('shows the newest event first by default', async () => {
      const screen = await renderWithProvider(<Example />);
      expect(titles(screen.container)).toEqual([
        'Success Request approved',
        'Review started',
        'Request created',
      ]);
    });

    it('can show the oldest first', async () => {
      const screen = await renderWithProvider(<Example order="oldest-first" />);
      expect(titles(screen.container)[0]).toBe('Request created');
    });

    it('can keep the given order', async () => {
      const screen = await renderWithProvider(
        <Example order="as-given" items={[items[1] as TimelineItem, items[0] as TimelineItem]} />,
      );
      expect(titles(screen.container)).toEqual(['Review started', 'Request created']);
    });

    it('keeps the given order for events with the same time, and does not mutate items', async () => {
      const same = [
        { id: '1', time: '2026-10-31T10:00:00Z', title: 'First' },
        { id: '2', time: '2026-10-31T10:00:00Z', title: 'Second' },
      ];
      const screen = await renderWithProvider(<Example items={same} />);
      expect(titles(screen.container)).toEqual(['First', 'Second']);
      expect(items.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('time', () => {
    it('renders a <time> with the machine-readable value and Intl text', async () => {
      const screen = await renderWithProvider(<Example />);
      const times = Array.from(screen.container.querySelectorAll('time'));
      expect(times.map((el) => el.getAttribute('dateTime'))).toEqual([
        '2026-10-31T16:05:00Z',
        '2026-10-29T13:40:00Z',
        '2026-10-28T09:15:00Z',
      ]);
      expect(times[2]?.textContent).toBe('Oct 28, 2026, 9:15 AM');
    });

    it('follows the locale', async () => {
      const screen = await renderWithProvider(<Example />, { locale: 'pt-BR' });
      const time = screen.container.querySelectorAll('time')[2];
      expect(time?.textContent).toContain('28 de out. de 2026');
    });

    it('formats in the given time zone', async () => {
      const screen = await renderWithProvider(<Example timeZone="Asia/Tokyo" />);
      expect(screen.container.querySelectorAll('time')[2]?.textContent).toBe(
        'Oct 28, 2026, 6:15 PM',
      );
    });

    it('accepts a Date and serializes it', async () => {
      const screen = await renderWithProvider(
        <Example items={[{ id: 'd', time: new Date('2026-10-31T16:05:00Z'), title: 'Dated' }]} />,
      );
      const time = screen.container.querySelector('time');
      expect(time?.getAttribute('dateTime')).toBe('2026-10-31T16:05:00.000Z');
      expect(time?.textContent).toBe('Oct 31, 2026, 4:05 PM');
    });

    it('shows a date-only value as a date without a time', async () => {
      const screen = await renderWithProvider(
        <Example items={[{ id: 'd', time: '2026-10-31', title: 'Dated' }]} />,
      );
      const time = screen.container.querySelector('time');
      expect(time?.getAttribute('dateTime')).toBe('2026-10-31');
      expect(time?.textContent).toBe('Oct 31, 2026');
    });
  });

  describe('tone', () => {
    it.each([
      ['accent', 'Highlighted'],
      ['success', 'Success'],
      ['warning', 'Warning'],
      ['danger', 'Error'],
    ] as const)('states the %s tone as text and marks it with an icon', async (tone, name) => {
      const screen = await renderWithProvider(
        <Example items={[{ id: 't', time: '2026-10-31T10:00:00Z', title: 'Event', tone }]} />,
      );
      const li = screen.getByRole('listitem').element();
      expect(li.textContent).toContain(`${name} Event`);
      expect(li.getAttribute('data-tone')).toBe(tone);
      expect(li.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('does not add tone text or an icon to a neutral event', async () => {
      const screen = await renderWithProvider(
        <Example items={[{ id: 't', time: '2026-10-31T10:00:00Z', title: 'Event' }]} />,
      );
      const li = screen.getByRole('listitem').element();
      expect(li.querySelector('svg')).toBeNull();
      expect(li.textContent).toMatch(/^Event/);
    });
  });

  describe('messages', () => {
    it('uses the pt-BR catalog', async () => {
      const screen = await renderWithProvider(<Example />, { locale: 'pt-BR' });
      await expect.element(screen.getByText('Por Ana Costa')).toBeVisible();
      expect(titles(screen.container)[0]).toBe('Sucesso Request approved');
    });

    it('applies provider and instance overrides', async () => {
      const provider = await renderWithProvider(<Example />, {
        messages: { Timeline: { actor: (actor: string) => `Done by ${actor}` } },
      });
      await expect.element(provider.getByText('Done by Ana Costa')).toBeVisible();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Example messages={{ actor: (actor: string) => `Owner ${actor}` }} />,
        { messages: { Timeline: { actor: (actor: string) => `Done by ${actor}` } } },
      );
      await expect.element(instance.getByText('Owner Ana Costa')).toBeVisible();
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLOListElement>();
    await renderWithProvider(<Example ref={ref} className="extra" id="tl1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('tl1');
  });

  it('has no axe violations with every tone, description and actor', async () => {
    const screen = await renderWithProvider(
      <main>
        <Example />
        <Timeline
          aria-label="All tones"
          timeZone="UTC"
          items={(['neutral', 'accent', 'success', 'warning', 'danger'] as const).map(
            (tone, index) => ({
              id: tone,
              time: `2026-10-${String(10 + index)}T10:00:00Z`,
              title: `${tone} event`,
              description: 'Detail text',
              actor: 'Ana Costa',
              tone,
            }),
          )}
        />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
