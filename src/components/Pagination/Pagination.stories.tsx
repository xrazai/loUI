import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Pagination } from './Pagination';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { pageCount: 10, onChange: fn() },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(canvas.getByRole('status')).toHaveTextContent('Page 1 of 10');
  },
};

export const WithRange: Story = {
  render: (args) => <Pagination {...args} pageCount={5} total={42} pageSize={10} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('1–10 of 42');
  },
};

export const MiddlePage: Story = {
  args: { defaultPage: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Page 5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('button', { name: 'Page 4' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Page 6' })).toBeInTheDocument();
  },
};

export const LastPage: Story = {
  args: { defaultPage: 10 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Next page' })).toBeDisabled();
  },
};

export const FewPages: Story = { args: { pageCount: 4 } };

export const SinglePage: Story = {
  args: { pageCount: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
  },
};

export const NoResults: Story = {
  render: () => <Pagination total={0} pageSize={10} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('No results');
  },
};

/** Tab reaches the buttons; Enter or Space pick a page and the range text updates. */
export const KeyboardNavigation: Story = {
  render: () => <Pagination total={42} pageSize={10} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Page 1' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('11–20 of 42');
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

/** Pressing Next on the second to last page disables it; focus moves to the current page. */
export const FocusStaysAfterLastPage: Story = {
  args: { pageCount: 3, defaultPage: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toHaveFocus();
  },
};

function ControlledPagination() {
  const [page, setPage] = useState(3);
  return (
    <>
      <Pagination page={page} pageCount={8} onChange={setPage} />
      <p style={{ margin: 0 }}>Page state: {page}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledPagination />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByText('Page state: 4')).toBeInTheDocument();
  },
};

export const Portuguese: Story = {
  render: () => (
    <DSProvider locale="pt-BR">
      <Pagination total={1248} pageSize={10} defaultPage={3} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument();
    await expect(canvas.getByRole('status')).toHaveTextContent('21–30 de 1.248');
  },
};

export const NarrowContainer: Story = {
  render: (args) => (
    <Pagination {...args} pageCount={125} defaultPage={5} total={1248} pageSize={10} />
  ),
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={280}>
        <Story />
      </StoryFrame>
    ),
  ],
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
  args: { defaultPage: 5 },
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
