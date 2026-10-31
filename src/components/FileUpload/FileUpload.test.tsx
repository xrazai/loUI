import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { borderContrast } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { FileUpload } from './FileUpload';
import type { FileUploadProps } from './FileUpload';

function file(name: string, bytes = 1024, type = 'application/pdf'): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

function Attachments(props: Partial<Extract<FileUploadProps, { label: unknown }>>) {
  return <FileUpload label="Attachments" {...props} />;
}

function fileInput(container: Element): HTMLInputElement {
  return container.querySelector('input[type="file"]:not([name])') as HTMLInputElement;
}

async function choose(container: Element, ...files: File[]) {
  await userEvent.upload(fileInput(container), files);
}

describe('FileUpload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a group named by its label with a drop target and a Choose files button', async () => {
    const screen = await renderWithProvider(<Attachments description="PDF up to 1 MB." />);
    await expect.element(screen.getByRole('group', { name: 'Attachments' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Choose files' })).toBeVisible();
    expect(screen.container.textContent).toContain('Drop files here');
    expect(screen.container.textContent).toContain('PDF up to 1 MB.');
  });

  it('adds files chosen with the dialog, lists name and formatted size, and announces politely', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Attachments onChange={onChange} />);
    await choose(screen.container, file('order.pdf', 1536), file('big.pdf', 5 * 1024 * 1024));
    const items = screen.getByRole('listitem');
    expect(items.elements()).toHaveLength(2);
    await expect.poll(() => items.first().element().textContent).toMatch(/order\.pdf/);
    await expect.poll(() => items.first().element().textContent).toMatch(/1\.5\sKB/);
    await expect.poll(() => items.last().element().textContent).toMatch(/5\sMB/);
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'order.pdf' }),
      expect.objectContaining({ name: 'big.pdf' }),
    ]);
    const status = screen.container.querySelector('[role="status"]');
    expect(status?.getAttribute('aria-live')).toBe('polite');
    expect(status?.textContent).toBe('2 files added.');
  });

  it('styles the drop target: dashed boundary, accent border and soft fill while dragging over it', async () => {
    const screen = await renderWithProvider(<Attachments />);
    const zone = screen.container.querySelector('[class*="zone"]') as HTMLElement;
    const style = getComputedStyle(zone);
    expect(style.borderTopStyle).toBe('dashed');
    expect(borderContrast(zone)).toBeGreaterThanOrEqual(3);
    const rest = { border: style.borderTopColor, background: style.backgroundColor };
    zone.setAttribute('data-drop-target', 'true');
    // The change is animated (150ms), so wait for it.
    await expect.poll(() => getComputedStyle(zone).borderTopColor).not.toBe(rest.border);
    await expect.poll(() => getComputedStyle(zone).backgroundColor).not.toBe(rest.background);
  });

  it('removes a file with a button named after it, announces it and keeps the others', async () => {
    const screen = await renderWithProvider(
      <Attachments defaultValue={[file('a.pdf'), file('b.pdf')]} />,
    );
    await screen.getByRole('button', { name: 'Remove a.pdf' }).click();
    expect(screen.getByRole('listitem').elements()).toHaveLength(1);
    await expect.element(screen.getByRole('button', { name: 'Remove b.pdf' })).toBeVisible();
    expect(screen.container.querySelector('[role="status"]')?.textContent).toBe('Removed a.pdf');
  });

  it('rejects wrong types by MIME, wildcard and extension, with a message', async () => {
    const onReject = vi.fn();
    const screen = await renderWithProvider(
      <Attachments accept={['image/*', '.pdf']} onReject={onReject} />,
    );
    await choose(
      screen.container,
      file('photo.png', 10, 'image/png'),
      file('doc.PDF', 10, ''),
      file('sheet.xlsx', 10, 'application/vnd.ms-excel'),
    );
    expect(screen.getByRole('listitem').elements()).toHaveLength(2);
    expect(screen.container.textContent).toContain('"sheet.xlsx" is not an accepted file type.');
    const rejected = onReject.mock.calls[0]?.[0] as { reason: string; file: File }[];
    expect(rejected.map((entry) => [entry.reason, entry.file.name])).toEqual([
      ['type', 'sheet.xlsx'],
    ]);
    expect(fileInput(screen.container).getAttribute('accept')).toContain('image/*');
  });

  it('rejects files over maxSize, with the limit formatted for the locale', async () => {
    const screen = await renderWithProvider(<Attachments maxSize={1.5 * 1024 * 1024} />);
    await choose(screen.container, file('huge.pdf', 3 * 1024 * 1024), file('ok.pdf', 100));
    expect(screen.getByRole('listitem').elements()).toHaveLength(1);
    expect(screen.container.textContent).toContain('"huge.pdf" is larger than 1.5 MB.');
    await screen.unmount();
    const ptBR = await renderWithProvider(<Attachments maxSize={1.5 * 1024 * 1024} />, {
      locale: 'pt-BR',
    });
    await choose(ptBR.container, file('grande.pdf', 3 * 1024 * 1024));
    expect(ptBR.container.textContent).toContain('"grande.pdf" é maior que 1,5 MB.');
  });

  it('limits the count with maxFiles and says how many were not added (plural)', async () => {
    const screen = await renderWithProvider(<Attachments maxFiles={2} />);
    await choose(screen.container, file('1.pdf'), file('2.pdf'), file('3.pdf'), file('4.pdf'));
    expect(screen.getByRole('listitem').elements()).toHaveLength(2);
    expect(screen.container.textContent).toContain('Only 2 files can be added. 2 not added.');
    expect(screen.container.querySelector('[role="status"]')?.textContent).toContain(
      '2 files added',
    );
    await screen.unmount();
    const one = await renderWithProvider(<Attachments maxFiles={1} />);
    await expect.element(one.getByRole('button', { name: 'Choose a file' })).toBeVisible();
    await choose(one.container, file('first.pdf'));
    await choose(one.container, file('second.pdf'));
    // A single-file field replaces the file instead of failing.
    expect(one.getByRole('listitem').elements()).toHaveLength(1);
    await expect.poll(() => one.getByRole('listitem').element().textContent).toMatch(/second\.pdf/);
  });

  it('shows consumer-supplied progress and Done, and never invents progress', async () => {
    const uploading = file('up.pdf');
    const finished = file('done.pdf');
    const idle = file('idle.pdf');
    const screen = await renderWithProvider(
      <Attachments
        defaultValue={[uploading, finished, idle]}
        progress={
          new Map([
            [uploading, 40],
            [finished, 100],
          ])
        }
      />,
    );
    const bars = screen.getByRole('progressbar');
    expect(bars.elements()).toHaveLength(1);
    await expect.element(bars).toHaveAttribute('aria-valuenow', '40');
    await expect.element(bars).toHaveAccessibleName('Uploading up.pdf');
    await expect
      .poll(() => screen.getByRole('listitem').nth(1).element().textContent)
      .toMatch(/Done/);
    expect(
      screen.getByRole('listitem').nth(2).element().querySelector('[role="progressbar"]'),
    ).toBeNull();
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [files, setFiles] = useState<File[]>([file('start.pdf')]);
      return (
        <>
          <Attachments value={files} onChange={setFiles} />
          <button
            type="button"
            onClick={() => {
              setFiles([]);
            }}
          >
            Reset
          </button>
        </>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expect
      .poll(() => screen.getByRole('listitem').element().textContent)
      .toMatch(/start\.pdf/);
    await choose(screen.container, file('more.pdf'));
    expect(screen.getByRole('listitem').elements()).toHaveLength(2);
    await screen.getByRole('button', { name: 'Reset' }).click();
    expect(screen.container.querySelector('ul')).toBeNull();
  });

  it('submits the files with the form under name', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Attachments name="attachments" />
        <button type="submit">Save</button>
      </form>,
    );
    await choose(screen.container, file('one.pdf', 10), file('two.pdf', 20));
    await screen.getByRole('button', { name: 'Save' }).click();
    const sent = data?.getAll('attachments') as File[];
    expect(sent.map((entry) => entry.name)).toEqual(['one.pdf', 'two.pdf']);
    await screen.getByRole('button', { name: 'Remove one.pdf' }).click();
    await screen.getByRole('button', { name: 'Save' }).click();
    expect((data?.getAll('attachments') as File[]).map((entry) => entry.name)).toEqual(['two.pdf']);
  });

  it('is operable with the keyboard: the zone stop, the Choose button, then Remove', async () => {
    const screen = await renderWithProvider(<Attachments defaultValue={[file('a.pdf')]} />);
    await userEvent.tab();
    // React Aria's own stop on the zone: it accepts pasted files (Ctrl+V) and is named by the zone text.
    await expect.element(screen.getByRole('button', { name: /Drop files here/ })).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Choose files' })).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Remove a.pdf' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(screen.container.querySelector('ul')).toBeNull();
  });

  it('takes strings from messages: pt-BR, provider and instance overrides', async () => {
    const ptBR = await renderWithProvider(
      <Attachments label="Anexos" defaultValue={[file('a.pdf')]} />,
      { locale: 'pt-BR' },
    );
    await expect.element(ptBR.getByRole('button', { name: 'Escolher arquivos' })).toBeVisible();
    await expect.element(ptBR.getByRole('button', { name: 'Remover a.pdf' })).toBeVisible();
    await ptBR.unmount();
    const provider = await renderWithProvider(<Attachments />, {
      messages: { FileUpload: { choose: () => 'Browse' } },
    });
    await expect.element(provider.getByRole('button', { name: 'Browse' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <Attachments
        messages={{ remove: (name) => `Delete ${name}` }}
        defaultValue={[file('a.pdf')]}
      />,
    );
    await expect.element(instance.getByRole('button', { name: 'Delete a.pdf' })).toBeVisible();
  });

  it('disables choosing, dropping and removing', async () => {
    const screen = await renderWithProvider(
      <Attachments isDisabled defaultValue={[file('a.pdf')]} />,
    );
    await expect.element(screen.getByRole('button', { name: 'Choose files' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Remove a.pdf' })).toBeDisabled();
    expect(screen.container.querySelector('[class*="zone"][data-disabled]')).not.toBeNull();
    expect(screen.getByRole('listitem').elements()).toHaveLength(1);
  });

  it('forwards className and ref; warns without an accessible name', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<Attachments className="extra" ref={ref} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {} as unknown as Parameters<typeof FileUpload>[0];
    await renderWithProvider(<FileUpload {...props} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('FileUpload needs an accessible name'),
    );
  });

  describe('axe', () => {
    it('has no violations: empty, described, with files, progress, errors, disabled, aria-label only', async () => {
      const uploading = file('up.pdf');
      const screen = await renderWithProvider(
        <main>
          <Attachments label="Empty" />
          <Attachments label="Described" description="PDF up to 1 MB." />
          <Attachments
            label="With files"
            defaultValue={[uploading, file('done.pdf')]}
            progress={new Map([[uploading, 60]])}
          />
          <Attachments label="Disabled" isDisabled defaultValue={[file('a.pdf')]} />
          <FileUpload aria-label="Unlabelled" />
        </main>,
      );
      await choose(
        screen.container.querySelectorAll('div[role="group"]')[0] as Element,
        file('x.png', 5, 'image/png'),
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations while showing validation errors', async () => {
      const screen = await renderWithProvider(
        <main>
          <Attachments accept={['.pdf']} maxSize={100} maxFiles={1} />
        </main>,
      );
      await choose(screen.container, file('a.png', 10, 'image/png'));
      expect(screen.container.textContent).toContain('is not an accepted file type');
      await expectNoA11yViolations(screen.container);
    });
  });
});
