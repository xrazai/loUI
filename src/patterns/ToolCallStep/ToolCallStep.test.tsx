import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ToolCallList } from './ToolCallList';
import { ToolCallStep } from './ToolCallStep';
import type { ToolCallStepProps } from './ToolCallStep';

const done: ToolCallStepProps = {
  name: 'search_orders',
  status: 'succeeded',
  durationMs: 1240,
  input: '{ "customer": "C-204" }',
  output: '{ "count": 3 }',
};

describe('ToolCallStep', () => {
  describe('header', () => {
    it('shows the name, the status as text and the duration', async () => {
      const screen = await renderWithProvider(<ToolCallStep {...done} />);
      const trigger = screen.getByRole('button', { name: /search_orders/ });
      expect(trigger.element().textContent).toContain('Succeeded');
      expect(trigger.element().textContent).toContain('1.2 s');
    });

    it('formats short durations in milliseconds and follows the locale', async () => {
      const screen = await renderWithProvider(<ToolCallStep {...done} durationMs={85} />);
      await expect.element(screen.getByText('85 ms')).toBeVisible();
      await screen.unmount();
      const pt = await renderWithProvider(<ToolCallStep {...done} durationMs={1240} />, {
        locale: 'pt-BR',
      });
      await expect.element(pt.getByText('1,2 s')).toBeVisible();
    });

    it.each([
      ['running', 'Running'],
      ['succeeded', 'Succeeded'],
      ['failed', 'Failed'],
    ] as const)('says %s in words', async (status, text) => {
      const screen = await renderWithProvider(<ToolCallStep name="t" status={status} />);
      await expect.element(screen.getByText(text)).toBeVisible();
    });

    it('is a heading of the chosen level wrapping the button', async () => {
      const screen = await renderWithProvider(<ToolCallStep {...done} headingLevel={5} />);
      await expect.element(screen.getByRole('heading', { level: 5 })).toBeVisible();
    });

    it('is plain text, not a button, without input or output', async () => {
      const screen = await renderWithProvider(<ToolCallStep name="t" status="succeeded" />);
      expect(screen.getByRole('button').elements()).toHaveLength(0);
      expect(screen.getByRole('heading').elements()).toHaveLength(0);
    });

    it('spreads rest props and forwards the ref', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(<ToolCallStep {...done} ref={ref} data-testid="step" />);
      expect(ref.current?.getAttribute('data-testid')).toBe('step');
    });
  });

  describe('details', () => {
    it('opens and closes with Enter and Space and labels the blocks', async () => {
      const screen = await renderWithProvider(<ToolCallStep {...done} />);
      const trigger = screen.getByRole('button', { name: /search_orders/ });
      await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
      trigger.element().focus();
      await userEvent.keyboard('{Enter}');
      await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect.element(screen.getByText('Input')).toBeVisible();
      await expect.element(screen.getByText('Output')).toBeVisible();
      await expect.element(screen.getByText('{ "count": 3 }')).toBeVisible();
      await userEvent.keyboard(' ');
      await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('labels the output as Error when the step failed', async () => {
      const screen = await renderWithProvider(
        <ToolCallStep name="t" status="failed" output="Timeout" defaultExpanded />,
      );
      await expect.element(screen.getByText('Error')).toBeVisible();
    });

    it('works controlled', async () => {
      const onExpandedChange = vi.fn();
      const screen = await renderWithProvider(
        <ToolCallStep {...done} isExpanded={false} onExpandedChange={onExpandedChange} />,
      );
      await userEvent.click(screen.getByRole('button', { name: /search_orders/ }));
      expect(onExpandedChange).toHaveBeenCalledWith(true);
      await expect
        .element(screen.getByRole('button', { name: /search_orders/ }))
        .toHaveAttribute('aria-expanded', 'false');
    });

    it('renders nodes as given instead of wrapping them in a code block', async () => {
      const screen = await renderWithProvider(
        <ToolCallStep {...done} input={<p>Custom input</p>} defaultExpanded />,
      );
      await expect.element(screen.getByText('Custom input')).toBeVisible();
    });
  });

  describe('announcements', () => {
    it('stays silent on first render, then says when a running step finishes', async () => {
      const screen = await renderWithProvider(<ToolCallStep name="draft_reply" status="running" />);
      const region = screen.getByRole('status');
      await expect.element(region).toHaveTextContent('');
      await screen.rerender(<ToolCallStep name="draft_reply" status="succeeded" />);
      await expect.element(region).toHaveTextContent('draft_reply succeeded');
      await screen.rerender(<ToolCallStep name="draft_reply" status="running" />);
      await expect.element(region).toHaveTextContent('');
      await screen.rerender(<ToolCallStep name="draft_reply" status="failed" />);
      await expect.element(region).toHaveTextContent('draft_reply failed');
    });

    it('does not announce a step that was already finished', async () => {
      const screen = await renderWithProvider(<ToolCallStep {...done} />);
      await expect.element(screen.getByRole('status')).toHaveTextContent('');
    });
  });

  describe('messages', () => {
    it('renders pt-BR', async () => {
      const screen = await renderWithProvider(<ToolCallStep {...done} defaultExpanded />, {
        locale: 'pt-BR',
      });
      await expect.element(screen.getByText('Concluída')).toBeVisible();
      await expect.element(screen.getByText('Entrada')).toBeVisible();
    });

    it('takes overrides from the provider and from the instance', async () => {
      const provider = await renderWithProvider(<ToolCallStep {...done} />, {
        messages: { ToolCallStep: { succeeded: 'Done' } },
      });
      await expect.element(provider.getByText('Done')).toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <ToolCallStep {...done} messages={{ succeeded: 'Finished' }} />,
      );
      await expect.element(instance.getByText('Finished')).toBeVisible();
    });
  });

  describe('ToolCallList', () => {
    const steps = [
      { stepId: 'a', ...done },
      { stepId: 'b', name: 'read_order', status: 'failed', output: 'Not found' },
      { stepId: 'c', name: 'draft_reply', status: 'running' },
    ] as const;

    it('is a named ordered list with one step per item', async () => {
      const screen = await renderWithProvider(<ToolCallList steps={steps} />);
      await expect.element(screen.getByRole('list', { name: 'Steps' })).toBeVisible();
      expect(screen.getByRole('listitem').elements()).toHaveLength(3);
      expect(screen.getByRole('list').element().tagName).toBe('OL');
    });

    it('takes a custom name and shares message overrides with its steps', async () => {
      const screen = await renderWithProvider(
        <ToolCallList steps={steps} aria-label="Order check" messages={{ running: 'Working' }} />,
      );
      await expect.element(screen.getByRole('list', { name: 'Order check' })).toBeVisible();
      await expect.element(screen.getByText('Working')).toBeVisible();
    });

    it('renders pt-BR', async () => {
      const screen = await renderWithProvider(<ToolCallList steps={steps} />, {
        locale: 'pt-BR',
      });
      await expect.element(screen.getByRole('list', { name: 'Etapas' })).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations: collapsed, expanded, failed, running, list', async () => {
      const screen = await renderWithProvider(
        <>
          <ToolCallStep {...done} />
          <ToolCallStep {...done} name="expanded" defaultExpanded />
          <ToolCallStep name="failed" status="failed" output="Timeout" defaultExpanded />
          <ToolCallStep name="running" status="running" />
          <ToolCallList
            steps={[
              { stepId: 'a', ...done, name: 'one' },
              { stepId: 'b', name: 'two', status: 'running' },
            ]}
          />
        </>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
