import type { Meta, StoryObj } from '@storybook/react-vite';
import { DSProvider } from '../../providers';
import { Kbd } from './Kbd';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  args: { keys: ['Mod', 'K'] },
  argTypes: {
    platform: { control: 'inline-radio', options: [undefined, 'apple', 'other'] },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `Mod` follows the platform of the browser that views the story. */
export const Default: Story = {};

export const Apple: Story = { args: { platform: 'apple', keys: ['Mod', 'Shift', 'P'] } };

export const Windows: Story = { args: { platform: 'other', keys: ['Mod', 'Shift', 'P'] } };

export const SingleKey: Story = { args: { keys: ['Esc'] } };

export const Arrows: Story = { args: { keys: ['Alt', 'ArrowUp'] } };

export const WithChildren: Story = {
  render: () => <Kbd>⌘K</Kbd>,
};

export const InText: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      Press <Kbd keys={['Mod', 'K']} /> to search or <Kbd keys={['Esc']} /> to close.
    </p>
  ),
};

/** Spoken names come from the `Kbd` message catalog and follow the `DSProvider` locale. */
export const PortugueseLocale: Story = {
  args: { platform: 'other', keys: ['Mod', 'Space'] },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Kbd keys={['Mod', 'K']} />
    </div>
  ),
};
