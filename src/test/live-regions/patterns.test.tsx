/**
 * Screen-reader verification of the one-shot announcements of ToolCallStep and ResponseFeedback
 * (TEST-018): one polite announcement per state change, none on first render.
 */
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { ResponseFeedback } from '../../patterns/ResponseFeedback/ResponseFeedback';
import { ToolCallStep } from '../../patterns/ToolCallStep/ToolCallStep';
import { renderWithProvider } from '../render';
import { axFind, axNodes, recordAnnouncements } from './helpers';

describe('ToolCallStep announcements', () => {
  it('is silent on first render, in every status', async () => {
    for (const status of ['running', 'succeeded', 'failed'] as const) {
      const recorder = recordAnnouncements();
      const { unmount } = await renderWithProvider(
        <ToolCallStep name="search_orders" status={status} output="3 results" />,
      );
      expect(recorder.stop()).toEqual([]);
      await unmount();
    }
  });

  it('announces once when a running step succeeds, and nothing for later re-renders', async () => {
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<ToolCallStep name="search_orders" status="running" />);
    await screen.rerender(<ToolCallStep name="search_orders" status="running" durationMs={300} />);
    expect(recorder.records).toEqual([]);
    await screen.rerender(
      <ToolCallStep name="search_orders" status="succeeded" durationMs={1200} />,
    );
    await screen.rerender(
      <ToolCallStep name="search_orders" status="succeeded" durationMs={1300} />,
    );
    expect(recorder.stop()).toEqual([
      {
        kind: 'change',
        politeness: 'polite',
        role: 'status',
        text: 'search_orders succeeded',
      },
    ]);
  });

  it('announces a failure once', async () => {
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<ToolCallStep name="send_email" status="running" />);
    await screen.rerender(<ToolCallStep name="send_email" status="failed" />);
    expect(recorder.stop().map((r) => r.text)).toEqual(['send_email failed']);
  });

  it('exposes one polite atomic status and a named disclosure button', async () => {
    await renderWithProvider(
      <ToolCallStep name="search_orders" status="succeeded" input="q=1048" output="3 results" />,
    );
    const statuses = (await axNodes()).filter((n) => n.role === 'status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]?.properties['live']).toBe('polite');
    expect(statuses[0]?.properties['atomic']).toBe(true);
    const trigger = (await axNodes()).find(
      (n) => n.role === 'button' && n.name.includes('search_orders'),
    );
    expect(trigger?.properties['expanded']).toBe(false);
  });
});

describe('ResponseFeedback announcements', () => {
  it('is silent on first render, even with a rating already chosen', async () => {
    const recorder = recordAnnouncements();
    await renderWithProvider(<ResponseFeedback defaultValue="positive" />);
    expect(recorder.stop()).toEqual([]);
  });

  it('announces "sent" once per rating and "removed" when it is taken back', async () => {
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<ResponseFeedback />);
    const good = screen.getByRole('button', { name: 'Good response' });
    await good.click();
    await expect.poll(() => recorder.texts()).toEqual(['Feedback sent']);
    await good.click();
    await expect.poll(() => recorder.texts()).toEqual(['Feedback sent', 'Feedback removed']);
    expect(recorder.stop().every((r) => r.politeness === 'polite' && r.role === 'status')).toBe(
      true,
    );
  });

  it('announces again when the rating changes from good to bad', async () => {
    const recorder = recordAnnouncements();
    const screen = await renderWithProvider(<ResponseFeedback />);
    await screen.getByRole('button', { name: 'Good response' }).click();
    await expect.poll(() => recorder.texts()).toEqual(['Feedback sent']);
    await screen.getByRole('button', { name: 'Bad response' }).click();
    await expect.poll(() => recorder.texts()).toEqual(['Feedback sent', 'Feedback sent']);
  });

  it('exposes pressed state on the toggles and one polite atomic status', async () => {
    const screen = await renderWithProvider(<ResponseFeedback />);
    await screen.getByRole('button', { name: 'Good response' }).click();
    const good = await axFind('button', 'Good response');
    expect(good?.properties['pressed']).toBe('true');
    const statuses = (await axNodes()).filter((n) => n.role === 'status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]?.properties['live']).toBe('polite');
    expect(statuses[0]?.properties['atomic']).toBe(true);
    await userEvent.keyboard('{Tab}');
  });
});
