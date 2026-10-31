import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';
import { StoryFrame } from '../../test/StoryFrame';

function Content() {
  return (
    <div
      style={{
        padding: 'var(--ds-space-4)',
        border: '1px dashed var(--ds-line-strong)',
        color: 'var(--ds-text)',
      }}
    >
      Content: the dashed box shows the width the container allows.
    </div>
  );
}

const meta = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { children: <Content /> },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'full'] },
    gutter: { control: 'boolean' },
    as: { control: 'select', options: ['div', 'section', 'article'] },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page content maximum (1200px) with a 24px gutter. */
export const Default: Story = {};

export const Small: Story = { args: { size: 'sm' } };

export const Medium: Story = { args: { size: 'md' } };

export const Large: Story = { args: { size: 'lg' } };

export const Full: Story = { args: { size: 'full' } };

export const NoGutter: Story = { args: { gutter: false } };

/** On a 320px screen the container shrinks to the viewport and keeps its gutter. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <StoryFrame width={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
