import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    keyboardActivation: { control: 'inline-radio', options: ['automatic', 'manual'] },
  },
  args: { children: null },
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Order sections">
        <Tab id="details">Details</Tab>
        <Tab id="items">Items</Tab>
        <Tab id="history">History</Tab>
      </TabList>
      <TabPanel id="details">Customer, address and payment terms.</TabPanel>
      <TabPanel id="items">Items and quantities on this order.</TabPanel>
      <TabPanel id="history">Every change made to the order.</TabPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Customer, address');
  },
};

/** Roving tab stop: Tab enters the list once, arrows move and select, Home and End jump. */
export const ArrowKeys: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('tab', { name: 'Details' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Items' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Items and quantities');
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'History' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Details' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'History' })).toHaveFocus();
  },
};

/** Tab moves from the selected tab into its panel. */
export const FocusMovesIntoPanel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  },
};

const onSelectionChange = fn();

/** Manual activation: arrows only move focus; Enter or Space selects. */
export const ManualActivation: Story = {
  args: { keyboardActivation: 'manual', onSelectionChange },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Items' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('tab', { name: 'Items' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(onSelectionChange).toHaveBeenCalledWith('items');
  },
};

export const Counts: Story = {
  render: () => (
    <Tabs>
      <TabList aria-label="Orders by status">
        <Tab id="all" count={1248}>
          All
        </Tab>
        <Tab id="pending" count={3} countTone="warning" countLabel="3 pending">
          Pending
        </Tab>
        <Tab id="late" count={2} countTone="danger" countLabel="2 late">
          Late
        </Tab>
        <Tab id="shipped" count={18} countTone="success" countLabel="18 shipped">
          Shipped
        </Tab>
        <Tab id="open" count={5} countTone="accent" countLabel="5 open">
          Open
        </Tab>
      </TabList>
      <TabPanel id="all">All orders.</TabPanel>
      <TabPanel id="pending">Pending orders.</TabPanel>
      <TabPanel id="late">Late orders.</TabPanel>
      <TabPanel id="shipped">Shipped orders.</TabPanel>
      <TabPanel id="open">Open orders.</TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Pending 3 pending' })).toBeInTheDocument();
  },
};

/** The shortcut hint is decorative: it is not part of the accessible name. */
export const ShortcutHints: Story = {
  render: () => (
    <Tabs>
      <TabList aria-label="Views">
        <Tab id="list" shortcut={['1']}>
          List
        </Tab>
        <Tab id="board" shortcut={['2']}>
          Board
        </Tab>
      </TabList>
      <TabPanel id="list">List view.</TabPanel>
      <TabPanel id="board">Board view.</TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('tab', { name: 'List' })).toBeInTheDocument();
  },
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs>
      <TabList aria-label="Order sections">
        <Tab id="details">Details</Tab>
        <Tab id="items" isDisabled>
          Items
        </Tab>
        <Tab id="history">History</Tab>
      </TabList>
      <TabPanel id="details">Customer, address and payment terms.</TabPanel>
      <TabPanel id="items">Items and quantities on this order.</TabPanel>
      <TabPanel id="history">Every change made to the order.</TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'History' })).toHaveFocus();
  },
};

function ControlledTabs() {
  const [key, setKey] = useState<string>('items');
  return (
    <>
      <Tabs
        selectedKey={key}
        onSelectionChange={(next) => {
          setKey(String(next));
        }}
      >
        <TabList aria-label="Order sections">
          <Tab id="details">Details</Tab>
          <Tab id="items">Items</Tab>
        </TabList>
        <TabPanel id="details">Customer and payment terms.</TabPanel>
        <TabPanel id="items">Items and quantities.</TabPanel>
      </Tabs>
      <p style={{ margin: 0 }}>Selected: {key}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Details' }));
    await expect(canvas.getByText('Selected: details')).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={280}>
        <Story />
      </StoryFrame>
    ),
  ],
  render: () => (
    <Tabs>
      <TabList aria-label="Sections">
        <Tab id="a">Purchase orders awaiting approval</Tab>
        <Tab id="b">Supplier invoices and credit notes</Tab>
      </TabList>
      <TabPanel id="a">First.</TabPanel>
      <TabPanel id="b">Second.</TabPanel>
    </Tabs>
  ),
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DSProvider locale="ar">
        <div dir="rtl">
          <Story />
        </div>
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Items' })).toHaveFocus();
  },
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
