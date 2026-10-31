import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { FileUpload } from './FileUpload';
import type { FileUploadProps } from './FileUpload';
import { StoryFrame } from '../../test/StoryFrame';

function file(name: string, bytes = 2048, type = 'application/pdf'): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  args: { label: 'Attachments', description: 'PNG, JPG or PDF up to 10 MB.' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={440}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<FileUploadProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    // React Aria's stop on the zone (accepts pasted files), then the button.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Choose files' })).toHaveFocus();
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, [file('order.pdf', 1536), file('invoice.pdf', 4 * 1024 * 1024)]);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove order.pdf' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1);
  },
};

export const WithFiles: Story = {
  args: {
    defaultValue: [file('order-1048.pdf', 182_000), file('swatch.png', 904_000, 'image/png')],
  },
};

export const Validation: Story = {
  args: { accept: ['.pdf', 'image/*'], maxSize: 1024 * 1024, maxFiles: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, [
      file('ok.pdf'),
      file('big.pdf', 2 * 1024 * 1024),
      file('photo.png', 10, 'image/png'),
      file('extra.pdf'),
    ]);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvasElement).toHaveTextContent('"big.pdf" is larger than 1 MB.');
    await expect(canvasElement).toHaveTextContent('Only 2 files can be added. 1 not added.');
  },
};

export const SingleFile: Story = {
  args: { maxFiles: 1, label: 'Logo', accept: ['image/*'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Choose a file' })).toBeVisible();
  },
};

/** The progress values are supplied by the consumer; this story fakes them with a timer. */
function SimulatedUpload(args: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<ReadonlyMap<File, number>>(new Map());
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((current) => {
        const next = new Map(current);
        for (const entry of files) next.set(entry, Math.min(100, (next.get(entry) ?? 0) + 20));
        return next;
      });
    }, 300);
    return () => {
      clearInterval(timer);
    };
  }, [files]);
  return <FileUpload {...args} value={files} onChange={setFiles} progress={progress} />;
}

export const WithProgress: Story = {
  render: (args) => <SimulatedUpload {...args} />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, [file('big-upload.pdf', 3 * 1024 * 1024)]);
    await expect(await within(canvasElement).findByRole('progressbar')).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: [file('locked.pdf')] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Choose files' }),
    ).toBeDisabled();
  },
};

export const LongFileName: Story = {
  args: {
    defaultValue: [
      file('a-very-long-file-name-that-keeps-going-and-going-for-the-whole-width.pdf'),
    ],
  },
};
