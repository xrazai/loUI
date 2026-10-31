import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import type { WithLabel } from '../Field';
import { Calendar } from './Calendar';
import { DatePicker } from './DatePicker';
import type { DatePickerProps } from './DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: { label: 'Delivery date' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    // Without a provider React Aria would follow the browser locale; stories pin en-US.
    (Story) => (
      <DSProvider locale="en-US">
        <div style={{ maxInlineSize: 280, minBlockSize: 420 }}>
          <Story />
        </div>
      </DSProvider>
    ),
  ],
} satisfies Meta<WithLabel<DatePickerProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.tab();
    await userEvent.keyboard('10152026');
    await expect(args.onChange).toHaveBeenLastCalledWith('2026-10-15');
    await expect(within(canvasElement).getByRole('group', { name: /Delivery date/ })).toBeVisible();
  },
};

export const CalendarKeyboard: Story = {
  args: { defaultValue: '2026-10-15', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Open calendar/ }));
    await screen.findByRole('grid');
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName(/October 15, 2026/));
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(document.activeElement).toHaveAccessibleName(/October 23, 2026/);
    await userEvent.keyboard('{PageDown}');
    await expect(document.activeElement).toHaveAccessibleName(/November 23, 2026/);
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('2026-11-23');
  },
};

export const EscapeRestoresFocus: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /Open calendar/ });
    await userEvent.click(trigger);
    await screen.findByRole('grid');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('grid')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const WithValue: Story = {
  args: { defaultValue: '2026-10-15', description: 'When the order should arrive.' },
};

export const MinAndMax: Story = {
  args: { defaultValue: '2026-10-15', min: '2026-10-10', max: '2026-10-20' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Open calendar/ }));
    const day = await screen.findByRole('button', { name: /October 9, 2026/ });
    await expect(day).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Required: Story = {
  args: { isRequired: true },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Choose a date after today.', defaultValue: '2020-01-01' },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: '2026-10-15' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: /Open calendar/ }),
    ).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: '2026-10-15' },
};

export const Brazilian: Story = {
  args: { label: 'Data de entrega', defaultValue: '2026-10-15' },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Abrir calendário/ }));
    const grid = await screen.findByRole('grid');
    await expect(grid).toBeVisible();
    await expect(screen.getByRole('button', { name: 'Hoje' })).toBeVisible();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <DatePicker {...args} size="sm" label="Small" />
      <DatePicker {...args} size="md" label="Medium" />
      <DatePicker {...args} size="lg" label="Large" />
    </div>
  ),
};

function StandaloneCalendarDemo() {
  const [value, setValue] = useState('2026-10-15');
  return (
    <div>
      <Calendar aria-label="Delivery date" value={value} onChange={setValue} />
      <p>
        <output data-testid="picked">{value}</output>
      </p>
    </div>
  );
}

export const StandaloneCalendar: Story = {
  render: () => <StandaloneCalendarDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /October 20, 2026/ }));
    await expect(within(canvasElement).getByTestId('picked')).toHaveTextContent('2026-10-20');
  },
};
