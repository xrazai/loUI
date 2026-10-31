import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { toast, useToast } from './queue';
import { ToastRegion } from './Toast';

/** Mounts the region once and empties the shared queue when a story unmounts. */
function Region() {
  useEffect(
    () => () => {
      toast.clear();
    },
    [],
  );
  return <ToastRegion />;
}

const meta = {
  title: 'Components/Toast',
  component: ToastRegion,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Region />
      </>
    ),
  ],
  parameters: { docs: { story: { inline: false, iframeHeight: 260 } } },
} satisfies Meta<typeof ToastRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Everything a toast can show, for the visual review. The toasts stay until dismissed. */
export const AllTones: Story = {
  parameters: { visual: { selector: '[role="region"][aria-label="Toast notifications"]' } },
  render: function Render() {
    useEffect(() => {
      toast.info('Draft saved', { timeout: null });
      toast.success('Order #1051 created', { timeout: null });
      toast.warning('Stock is low for 2 items', { timeout: null });
      toast.danger('Payment failed', { timeout: null });
    }, []);
    return <p style={{ margin: 0 }}>Toasts appear at the bottom center.</p>;
  },
};

export const WithAction: Story = {
  parameters: { visual: { selector: '[role="region"][aria-label="Toast notifications"]' } },
  render: function Render() {
    useEffect(() => {
      toast.success('3 items archived', {
        timeout: null,
        action: { label: 'Undo', onPress: () => undefined },
      });
    }, []);
    return <p style={{ margin: 0 }}>Toast with Undo.</p>;
  },
};

export const LongMessage: Story = {
  parameters: { visual: { selector: '[role="region"][aria-label="Toast notifications"]' } },
  render: function Render() {
    useEffect(() => {
      toast.info(
        'The import finished with 12 warnings. Open the report to see which rows were skipped and why.',
        { timeout: null, action: { label: 'Open report', onPress: () => undefined } },
      );
    }, []);
    return <p style={{ margin: 0 }}>Long message wraps.</p>;
  },
};

/**
 * The undo pattern: do the action at once, tell the user in a toast, offer Undo. No
 * confirmation dialog for reversible actions. Press the button, then Tab to Undo.
 */
export const UndoPattern: Story = {
  render: function Render() {
    const notify = useToast();
    const [archived, setArchived] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 'var(--ds-space-3)', justifyItems: 'start' }}>
        <p style={{ margin: 0 }}>Order #1051: {archived ? 'archived' : 'active'}</p>
        <Button
          isDisabled={archived}
          onPress={() => {
            setArchived(true);
            notify.success('Order #1051 archived', {
              action: {
                label: 'Undo',
                onPress: () => {
                  setArchived(false);
                },
              },
            });
          }}
        >
          Archive order
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Archive order' }));
    await expect(canvas.getByText('Order #1051: archived')).toBeVisible();
    const undo = await screen.findByRole('button', { name: 'Undo' });
    undo.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('Order #1051: active')).toBeVisible());
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull());
  },
};

/** Hovering or focusing the toast pauses its timer (WCAG 2.2.1). */
export const PausesOnHoverAndFocus: Story = {
  render: function Render() {
    const notify = useToast();
    return (
      <Button
        onPress={() => {
          notify('Saved', { timeout: 800, action: { label: 'Undo', onPress: () => undefined } });
        }}
      >
        Save
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save' }));
    const undo = await screen.findByRole('button', { name: 'Undo' });
    undo.focus();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await expect(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
  },
};

/** F6 moves focus into the Toast notifications region. */
export const KeyboardRegion: Story = {
  render: function Render() {
    const notify = useToast();
    return (
      <Button
        onPress={() => {
          notify.success('Order archived', {
            timeout: null,
            action: { label: 'Undo', onPress: () => undefined },
          });
        }}
      >
        Archive order
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Archive order' }));
    const region = await screen.findByRole('region', { name: 'Toast notifications' });
    await userEvent.keyboard('{F6}');
    await waitFor(() => expect(region.contains(document.activeElement)).toBe(true));
  },
};
