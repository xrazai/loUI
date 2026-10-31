import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Block: Story = { args: { width: 120, height: 22 } };

export const Circle: Story = { args: { circle: true, height: 28 } };

export const Lines: Story = { args: { lines: 3 } };

export const SingleLine: Story = { args: { lines: 1 } };

export const Pill: Story = { args: { width: 96, height: 24 } };

/** The loading region carries `aria-busy`; the skeletons themselves are hidden from assistive technology. */
export const BusyRegion: Story = {
  render: () => (
    <section
      aria-busy="true"
      aria-label="Recent orders"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}
    >
      {[0, 1, 2].map((row) => (
        <div key={row} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton circle height={28} />
          <Skeleton lines={2} />
        </div>
      ))}
    </section>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" style={{ maxWidth: 240 }}>
      <Skeleton lines={3} />
    </div>
  ),
};
