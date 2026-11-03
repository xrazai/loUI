import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Stepper } from './Stepper';
import type { StepperProps } from './Stepper';
import { StoryFrame } from '../../test/StoryFrame';

const SETUP_STEPS = [
  { id: 'basics', label: 'Basics', description: 'Name and purpose' },
  { id: 'source', label: 'Source', description: 'Where the data comes from' },
  { id: 'rules', label: 'Rules', description: 'What is allowed' },
  { id: 'review', label: 'Review', description: 'Check before you finish' },
];

const NINE_STEPS = Array.from({ length: 9 }, (_, index) => ({
  id: `step-${String(index + 1)}`,
  label: `Step name ${String(index + 1)}`,
}));

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Setup progress',
    steps: SETUP_STEPS,
    current: 1,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={640}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<Extract<StepperProps, { 'aria-label': string }>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstStep: Story = { args: { current: 0 } };

export const AllComplete: Story = { args: { current: 3, complete: true } };

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

/** Nine steps in 320 px: the labels collapse into the summary "Step 3 of 9". */
export const NineStepsNarrow: Story = {
  args: { steps: NINE_STEPS, current: 2, 'aria-label': 'New agent steps' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const NineStepsWide: Story = {
  args: { steps: NINE_STEPS, current: 2, 'aria-label': 'New agent steps' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={960}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const LongLabels: Story = {
  args: {
    orientation: 'vertical',
    steps: [
      { id: 'a', label: 'Choose the template that matches the kind of work you do every day' },
      { id: 'b', label: 'Connect the sources', description: 'This can take a few minutes.' },
      { id: 'c', label: 'Finish' },
    ],
    current: 1,
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
};

function NavigableStepper() {
  const [current, setCurrent] = useState(2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-4)' }}>
      <Stepper
        aria-label="Setup progress"
        steps={SETUP_STEPS}
        current={current}
        onStepPress={(index) => {
          setCurrent(index);
        }}
      />
      <div>
        <Button
          onPress={() => {
            setCurrent((value) => Math.min(value + 1, SETUP_STEPS.length - 1));
          }}
        >
          Go to next step
        </Button>
      </div>
    </div>
  );
}

/** Completed steps are buttons. Tab to "Basics" and press Enter to go back. */
export const GoBackToCompletedSteps: Story = {
  render: () => <NavigableStepper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /Basics/ })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /Source/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByText('Source', { selector: 'span' }).closest('[aria-current]'),
    ).not.toBeNull();
  },
};

export const RightToLeft: Story = {
  args: { onStepPress: () => undefined },
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" maxWidth={640}>
        <Story />
      </StoryFrame>
    ),
  ],
};
