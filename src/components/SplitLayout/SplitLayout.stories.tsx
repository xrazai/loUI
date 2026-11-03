import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, within } from 'storybook/test';
import { Card } from '../Card';
import { Stack } from '../Stack';
import { SplitLayout } from './SplitLayout';
import type { SplitLayoutProps } from './SplitLayout';
import { StoryFrame } from '../../test/StoryFrame';

const rows = Array.from({ length: 6 }, (_, index) => (
  <Card key={index} title={`Section ${String(index + 1)}`}>
    <p style={{ margin: 0, color: 'var(--ds-text-2)' }}>
      Editor content for section {index + 1}. It takes the free width of the row.
    </p>
  </Card>
));

const main = <Stack gap={4}>{rows}</Stack>;
const side = (
  <Card title="Assistant">
    <p style={{ margin: 0, color: 'var(--ds-text-2)' }}>Ask about this page.</p>
  </Card>
);

const longMain = (
  <Stack gap={4}>
    {Array.from({ length: 14 }, (_, index) => (
      <Card key={index} title={`Section ${String(index + 1)}`}>
        <p style={{ margin: 0, color: 'var(--ds-text-2)' }}>
          Long editor content, row {index + 1}.
        </p>
      </Card>
    ))}
  </Stack>
);

/** A scrolling area of a fixed height, like the main region of an `AppShell`. */
function Scroller({ children }: { children: ReactNode }) {
  return (
    <div
      // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex -- a scroll container must be a keyboard stop (WCAG 2.1.1)
      tabIndex={0}
      role="region"
      aria-label="Scrolling page"
      style={{
        blockSize: '100%',
        overflow: 'auto',
        padding: 'var(--ds-space-4)',
        border: '1px solid var(--ds-line)',
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'Layout/SplitLayout',
  component: SplitLayout,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { children: main, aside: side, asideLabel: 'Assistant' },
  argTypes: {
    asideWidth: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    asidePosition: { control: 'inline-radio', options: ['start', 'end'] },
    collapseBelow: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'never'] },
    gap: { control: 'select', options: [1, 2, 3, 4, 5, 6, 8, 12, 16] },
  },
  decorators: [
    (Story) => (
      <StoryFrame width={1000}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<SplitLayoutProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The aside sits at the inline end, 360px wide. The main content comes first in the DOM. */
export const End: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('complementary', { name: 'Assistant' }),
    ).toBeVisible();
  },
};

export const Start: Story = { args: { asidePosition: 'start' } };

export const SmallAside: Story = { args: { asideWidth: 'sm' } };

export const LargeAside: Story = { args: { asideWidth: 'lg' } };

/** Without `asideLabel` the aside is a plain `div`: no landmark is added. */
export const WithoutLandmark: Story = { args: { asideLabel: undefined } };

/** The aside stays in view while the long main content scrolls. Scroll the frame to see it. */
export const Sticky: Story = {
  args: { sticky: true, children: longMain },
  decorators: [
    (Story) => (
      <StoryFrame width={1000} height={360}>
        <Scroller>
          <Story />
        </Scroller>
      </StoryFrame>
    ),
  ],
};

/** Narrower than 768px the aside stacks under the main content and is no longer sticky. */
export const CollapsedNarrowContainer: Story = {
  args: { sticky: true },
  decorators: [
    (Story) => (
      <StoryFrame width={600}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const CollapseNever: Story = {
  args: { collapseBelow: 'never', asideWidth: 'sm', gap: 3 },
  decorators: [
    (Story) => (
      <StoryFrame width={600}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" width={1000}>
        <Story />
      </StoryFrame>
    ),
  ],
};
