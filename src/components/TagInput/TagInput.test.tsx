import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { resetMissingNameWarnings } from '../Field/labeling';
import { TagInput } from './TagInput';
import type { TagInputProps } from './TagInput';

function Example(props: Partial<TagInputProps>) {
  return (
    <>
      <button type="button">Before</button>
      <TagInput label="Products" {...props} />
      <button type="button">After</button>
    </>
  );
}

const status = (container: Element) =>
  container.querySelector('[role="status"]')?.textContent ?? '';

function paste(input: Element, text: string): ClipboardEvent {
  const data = new DataTransfer();
  data.setData('text', text);
  const event = new ClipboardEvent('paste', {
    clipboardData: data,
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(event);
  return event;
}

describe('TagInput', () => {
  describe('rendering and ARIA', () => {
    it('is a text box named by its label', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('textbox', { name: 'Products' })).toBeVisible();
    });

    it('renders the initial tags as a named grid of rows, each with a remove button', async () => {
      const screen = await renderWithProvider(
        <Example defaultValue={['notebook', 'headphones']} />,
      );
      await expect
        .element(screen.getByRole('grid', { name: 'Products, added tags' }))
        .toBeVisible();
      expect(screen.getByRole('row').elements()).toHaveLength(2);
      await expect.element(screen.getByRole('button', { name: 'Remove notebook' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Remove headphones' })).toBeVisible();
    });

    it('renders no list when there are no tags', async () => {
      const screen = await renderWithProvider(<Example />);
      expect(screen.getByRole('grid').elements()).toHaveLength(0);
    });

    it('names the tag list from aria-label when there is no visible label', async () => {
      const screen = await renderWithProvider(
        <TagInput aria-label="Keywords" defaultValue={['a']} />,
      );
      await expect.element(screen.getByRole('textbox', { name: 'Keywords' })).toBeVisible();
      await expect
        .element(screen.getByRole('grid', { name: 'Keywords, added tags' }))
        .toBeVisible();
    });

    it('shows the placeholder only while there are no tags', async () => {
      const empty = await renderWithProvider(
        <TagInput label="Products" placeholder="Add a product" />,
      );
      await expect.element(empty.getByPlaceholder('Add a product')).toBeVisible();
      await empty.unmount();
      const filled = await renderWithProvider(
        <TagInput label="Products" placeholder="Add a product" defaultValue={['a']} />,
      );
      expect(filled.getByPlaceholder('Add a product').elements()).toHaveLength(0);
    });

    it('links the description to the input', async () => {
      const screen = await renderWithProvider(<Example description="Separate with commas." />);
      await expect
        .element(screen.getByRole('textbox', { name: 'Products' }))
        .toHaveAccessibleDescription('Separate with commas.');
    });

    it('uses the control heights from the size tokens as a minimum', async () => {
      const screen = await renderWithProvider(
        <>
          <TagInput label="Small" size="sm" />
          <TagInput label="Medium" />
          <TagInput label="Large" size="lg" />
        </>,
      );
      const box = (name: string) =>
        screen.getByRole('textbox', { name }).element().closest('[role="presentation"]');
      expect(box('Small')?.getBoundingClientRect().height).toBe(32);
      expect(box('Medium')?.getBoundingClientRect().height).toBe(40);
      expect(box('Large')?.getBoundingClientRect().height).toBe(48);
    });

    it('puts the input on the same row as the tags while there is room', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 400 }}>
          <TagInput label="Products" defaultValue={['notebook', 'headphones']} />
        </div>,
      );
      const input = screen.getByRole('textbox').element().getBoundingClientRect();
      const row = screen.getByRole('row').first().element().getBoundingClientRect();
      expect(Math.abs(input.top - row.top)).toBeLessThan(2);
      expect(input.left).toBeGreaterThanOrEqual(row.right);
    });

    it('wraps tags onto more rows and keeps the input on the last one', async () => {
      const tags = [
        'wireless headphones',
        'leather notebook',
        'canvas backpack',
        'brass desk lamp',
        'ceramic mug',
      ];
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 240 }}>
          <TagInput label="Products" defaultValue={tags} />
        </div>,
      );
      const input = screen.getByRole('textbox').element().getBoundingClientRect();
      const last = screen.getByRole('row').last().element().getBoundingClientRect();
      const first = screen.getByRole('row').first().element().getBoundingClientRect();
      expect(last.top).toBeGreaterThan(first.top);
      expect(input.bottom).toBeGreaterThanOrEqual(last.bottom - 1);
      expect(input.width).toBeGreaterThanOrEqual(96 - 1);
    });

    it('truncates a tag that is wider than the box instead of overflowing it', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 200 }}>
          <TagInput
            label="Products"
            defaultValue={['Awaiting supplier confirmation for the previous quarter shipment']}
          />
        </div>,
      );
      const box = screen.getByRole('textbox').element().closest('[role="presentation"]');
      const row = screen.getByRole('row').element().getBoundingClientRect();
      expect(row.right).toBeLessThanOrEqual((box?.getBoundingClientRect().right ?? 0) + 0.5);
    });

    it('merges className, forwards both refs and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      const inputRef = createRef<HTMLInputElement>();
      await renderWithProvider(
        <TagInput
          ref={ref}
          inputRef={inputRef}
          label="Products"
          className="extra"
          inputClassName="extra-input"
          data-testid="field"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('field');
      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
      expect(inputRef.current?.classList.contains('extra-input')).toBe(true);
    });

    it('warns in development when it has no accessible name', async () => {
      resetMissingNameWarnings();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      // @ts-expect-error -- a name is required by the types; this simulates a consumer who bypasses them.
      await renderWithProvider(<TagInput />);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('TagInput needs an accessible name'),
      );
      warn.mockRestore();
    });
  });

  describe('adding tags', () => {
    it('adds a tag with Enter, trims it and clears the input', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      const input = screen.getByRole('textbox', { name: 'Products' });
      await userEvent.click(input);
      await userEvent.keyboard('  notebook  {Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['notebook']);
      await expect.element(screen.getByRole('button', { name: 'Remove notebook' })).toBeVisible();
      await expect.element(input).toHaveValue('');
      await expect.element(input).toHaveFocus();
    });

    it('adds a tag with a comma and never types the comma', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      const input = screen.getByRole('textbox', { name: 'Products' });
      await userEvent.click(input);
      await userEvent.keyboard('headphones,backpack,');
      expect(onChange).toHaveBeenLastCalledWith(['headphones', 'backpack']);
      await expect.element(input).toHaveValue('');
    });

    it('supports other delimiters and Enter only', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} delimiters={[';']} />);
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('a,b;');
      expect(onChange).toHaveBeenLastCalledWith(['a,b']);
      await screen.unmount();

      const enterOnly = vi.fn();
      const second = await renderWithProvider(<Example onChange={enterOnly} delimiters={[]} />);
      await userEvent.click(second.getByRole('textbox'));
      await userEvent.keyboard('a,b{Enter}');
      expect(enterOnly).toHaveBeenLastCalledWith(['a,b']);
    });

    it('ignores empty text', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('   {Enter},');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not submit the form on Enter with text, but does when the input is empty', async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => {
        event.preventDefault();
      });
      const screen = await renderWithProvider(
        <form
          onSubmit={(event) => {
            onSubmit(event.nativeEvent);
          }}
        >
          <TagInput label="Products" name="products" />
          <button type="submit">Save</button>
        </form>,
      );
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('notebook{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
      await userEvent.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('splits pasted comma-separated text into tags', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      const input = screen.getByRole('textbox').element();
      const event = paste(input, 'notebook, backpack ,headphones\nlamp');
      expect(event.defaultPrevented).toBe(true);
      expect(onChange).toHaveBeenLastCalledWith(['notebook', 'backpack', 'headphones', 'lamp']);
      await expect.element(screen.getByRole('button', { name: 'Remove lamp' })).toBeVisible();
      await vi.waitFor(() => {
        expect(status(screen.container)).toBe('Added 4 tags.');
      });
    });

    it('leaves a paste without delimiters to the browser', async () => {
      const screen = await renderWithProvider(<Example />);
      const event = paste(screen.getByRole('textbox').element(), 'notebook');
      expect(event.defaultPrevented).toBe(false);
    });

    it('turns the text left in the input into a tag on blur, unless addOnBlur is false', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('notebook');
      await userEvent.click(screen.getByRole('button', { name: 'After' }));
      expect(onChange).toHaveBeenLastCalledWith(['notebook']);
      await screen.unmount();

      const off = vi.fn();
      const second = await renderWithProvider(<Example onChange={off} addOnBlur={false} />);
      await userEvent.click(second.getByRole('textbox'));
      await userEvent.keyboard('notebook');
      await userEvent.click(second.getByRole('button', { name: 'After' }));
      expect(off).not.toHaveBeenCalled();
      await expect.element(second.getByRole('textbox')).toHaveValue('notebook');
    });

    it('focuses the input when the empty part of the box is clicked', async () => {
      const screen = await renderWithProvider(<Example defaultValue={['notebook']} />);
      const box = screen.getByRole('textbox').element().closest('[role="presentation"]');
      expect(box).not.toBeNull();
      await userEvent.click(screen.getByRole('button', { name: 'After' }));
      box?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await expect.element(screen.getByRole('textbox')).toHaveFocus();
    });
  });

  describe('duplicates', () => {
    it('ignores a duplicate (ignoring case), clears the text and says so politely', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['Notebook']} onChange={onChange} />,
      );
      const input = screen.getByRole('textbox', { name: 'Products' });
      await userEvent.click(input);
      await userEvent.keyboard('notebook{Enter}');
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('row').elements()).toHaveLength(1);
      await expect.element(input).toHaveValue('');
      await expect.element(screen.getByText('“notebook” is already added.')).toBeVisible();
      expect(status(screen.container)).toBe('“notebook” is already added.');
      // A polite status, not an alert, and the field is not marked invalid.
      expect(screen.container.querySelector('[role="alert"]')).toBeNull();
      await expect.element(input).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('clears the message when the user types again', async () => {
      const screen = await renderWithProvider(<Example defaultValue={['notebook']} />);
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('notebook{Enter}');
      await expect.element(screen.getByText('“notebook” is already added.')).toBeVisible();
      await userEvent.keyboard('s');
      expect(screen.container.querySelector('[role="status"]')?.hasAttribute('data-visible')).toBe(
        false,
      );
      expect(status(screen.container)).toBe('');
    });

    it('counts duplicates in a paste and still adds the new tags', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['notebook', 'headphones']} onChange={onChange} />,
      );
      paste(screen.getByRole('textbox').element(), 'notebook, headphones, lamp');
      expect(onChange).toHaveBeenLastCalledWith(['notebook', 'headphones', 'lamp']);
      await expect.element(screen.getByText('2 duplicate tags were skipped.')).toBeVisible();
    });

    it('treats different case as different with caseSensitive', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['Notebook']} onChange={onChange} caseSensitive />,
      );
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('notebook{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['Notebook', 'notebook']);
    });
  });

  describe('limits and validation', () => {
    it('shows an error at maxTags, keeps the text and marks the field invalid', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['a', 'b']} maxTags={2} onChange={onChange} />,
      );
      const input = screen.getByRole('textbox', { name: 'Products' });
      await userEvent.click(input);
      await userEvent.keyboard('c{Enter}');
      expect(onChange).not.toHaveBeenCalled();
      await expect
        .element(screen.getByRole('alert'))
        .toHaveTextContent('You can add up to 2 tags.');
      await expect.element(input).toHaveValue('c');
      await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('accepts a tag again after one is removed', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['a', 'b']} maxTags={2} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('c{Enter}');
      await userEvent.click(screen.getByRole('button', { name: 'Remove a' }));
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['b', 'c']);
      expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    });

    it('adds only what fits when a paste is longer than the maximum', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example maxTags={2} onChange={onChange} />);
      paste(screen.getByRole('textbox').element(), 'a, b, c');
      expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
      await expect
        .element(screen.getByRole('alert'))
        .toHaveTextContent('You can add up to 2 tags.');
    });

    it('rejects a tag with the message of validateTag and keeps the text to fix', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example
          onChange={onChange}
          validateTag={(tag) => (/\s/.test(tag) ? 'Use a single word.' : undefined)}
        />,
      );
      const input = screen.getByRole('textbox', { name: 'Products' });
      await userEvent.click(input);
      await userEvent.keyboard('two words{Enter}');
      expect(onChange).not.toHaveBeenCalled();
      await expect.element(screen.getByRole('alert')).toHaveTextContent('Use a single word.');
      await expect.element(input).toHaveAttribute('aria-invalid', 'true');
      await expect.element(input).toHaveAccessibleDescription('Use a single word.');
      await expect.element(input).toHaveValue('two words');
      // Typing clears the error; a valid tag goes through.
      await userEvent.keyboard('{Control>}a{/Control}one{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['one']);
      expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    });

    it('shows the error text of the consumer while isInvalid', async () => {
      const screen = await renderWithProvider(
        <Example isInvalid errorMessage="Add at least one product." />,
      );
      await expect
        .element(screen.getByRole('alert'))
        .toHaveTextContent('Add at least one product.');
      await expect
        .element(screen.getByRole('textbox', { name: 'Products' }))
        .toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('removing tags', () => {
    it('removes the last tag with Backspace on the empty input and announces it', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['notebook', 'headphones']} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('{Backspace}');
      expect(onChange).toHaveBeenLastCalledWith(['notebook']);
      expect(screen.getByRole('row').elements()).toHaveLength(1);
      await vi.waitFor(() => {
        expect(status(screen.container)).toBe('Removed “headphones”.');
      });
    });

    it('edits text normally with Backspace when the input is not empty', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['notebook']} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('ab{Backspace}');
      expect(onChange).not.toHaveBeenCalled();
      await expect.element(screen.getByRole('textbox')).toHaveValue('a');
    });

    it('removes a tag with its button and keeps focus in the field when it was the last', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['notebook']} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Remove notebook' }));
      expect(onChange).toHaveBeenLastCalledWith([]);
      await expect.element(screen.getByRole('textbox')).toHaveFocus();
    });

    it('removes the focused tag with Delete and Backspace', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example defaultValue={['notebook', 'headphones', 'lamp']} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('textbox'));
      // Backwards from the input: the remove button of the last tag, then its row.
      await userEvent.keyboard('{Shift>}{Tab}{Tab}{/Shift}');
      await expect.element(screen.getByRole('row').last()).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(screen.getByRole('row').nth(1)).toHaveFocus();
      await userEvent.keyboard('{Delete}');
      expect(onChange).toHaveBeenLastCalledWith(['notebook', 'lamp']);
    });
  });

  describe('keyboard contract', () => {
    it('puts the tags (a row, then its remove button) and the input in the tab order', async () => {
      const screen = await renderWithProvider(
        <Example defaultValue={['notebook', 'headphones']} />,
      );
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('row').first()).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Remove notebook' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('textbox')).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('stays put when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example value={['a']} onChange={onChange} />);
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('b{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
      expect(screen.getByRole('row').elements()).toHaveLength(1);
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [tags, setTags] = useState<string[]>(['a']);
        return (
          <>
            <Example value={tags} onChange={setTags} />
            <p>Tags: {tags.join('|')}</p>
          </>
        );
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('b{Enter}c,');
      await expect.element(screen.getByText('Tags: a|b|c')).toBeVisible();
      await userEvent.click(screen.getByRole('button', { name: 'Remove b' }));
      await expect.element(screen.getByText('Tags: a|c')).toBeVisible();
    });

    it('controls the text of the input', async () => {
      const onInputChange = vi.fn();
      function Parent() {
        const [text, setText] = useState('draft');
        return (
          <Example
            inputValue={text}
            onInputChange={(next) => {
              onInputChange(next);
              setText(next);
            }}
          />
        );
      }
      const screen = await renderWithProvider(<Parent />);
      const input = screen.getByRole('textbox');
      await expect.element(input).toHaveValue('draft');
      await userEvent.click(input);
      await userEvent.keyboard('s');
      expect(onInputChange).toHaveBeenLastCalledWith('drafts');
      await userEvent.keyboard('{Enter}');
      expect(onInputChange).toHaveBeenLastCalledWith('');
    });

    it('starts with defaultInputValue', async () => {
      const screen = await renderWithProvider(<Example defaultInputValue="start" />);
      await expect.element(screen.getByRole('textbox')).toHaveValue('start');
    });
  });

  describe('forms', () => {
    it('submits each tag under the name and never the text being typed', async () => {
      let data: FormData | undefined;
      const screen = await renderWithProvider(
        <form
          onSubmit={(event) => {
            event.preventDefault();
            data = new FormData(event.currentTarget);
          }}
        >
          <TagInput label="Products" name="products" defaultValue={['notebook', 'headphones']} />
          <button type="submit">Save</button>
        </form>,
      );
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('draft');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      // The blur turned the draft into a tag before the submit.
      expect(data?.getAll('products')).toEqual(['notebook', 'headphones', 'draft']);
      expect([...(data?.keys() ?? [])].every((key) => key === 'products')).toBe(true);
    });

    it('adds no fields without a name, and none when disabled', async () => {
      const unnamed = await renderWithProvider(<TagInput label="A" defaultValue={['x']} />);
      expect(unnamed.container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
      await unnamed.unmount();
      const disabled = await renderWithProvider(
        <form data-testid="f">
          <TagInput label="B" name="b" defaultValue={['x']} isDisabled />
        </form>,
      );
      const form = disabled.container.querySelector('form');
      expect(form ? new FormData(form).getAll('b') : ['unexpected']).toEqual([]);
    });

    it('is satisfied by one tag when required, and invalid with none', async () => {
      const empty = await renderWithProvider(
        <form data-testid="f">
          <TagInput label="Products" name="products" isRequired />
        </form>,
      );
      expect(empty.container.querySelector('form')?.checkValidity()).toBe(false);
      await empty.unmount();
      const filled = await renderWithProvider(
        <form>
          <TagInput label="Products" name="products" isRequired defaultValue={['notebook']} />
        </form>,
      );
      expect(filled.container.querySelector('form')?.checkValidity()).toBe(true);
    });
  });

  describe('disabled and read-only', () => {
    it('disables the input and the tags and offers no remove buttons', async () => {
      const screen = await renderWithProvider(<Example isDisabled defaultValue={['notebook']} />);
      await expect.element(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.getByRole('button', { name: /Remove/ }).elements()).toHaveLength(0);
    });

    it('is read-only: no changes by keyboard and no remove buttons', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example isReadOnly defaultValue={['notebook']} onChange={onChange} />,
      );
      expect(screen.getByRole('button', { name: /Remove/ }).elements()).toHaveLength(0);
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('{Backspace}');
      paste(screen.getByRole('textbox').element(), 'a, b');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('messages (i18n)', () => {
    it('uses pt-BR texts', async () => {
      const screen = await renderWithProvider(
        <Example defaultValue={['caderno']} label="Produtos" />,
        { locale: 'pt-BR' },
      );
      await expect
        .element(screen.getByRole('grid', { name: 'Produtos, tags adicionadas' }))
        .toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Remover caderno' })).toBeVisible();
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('caderno{Enter}');
      await expect.element(screen.getByText('“caderno” já foi adicionada.')).toBeVisible();
      await userEvent.keyboard('{Backspace}');
      await vi.waitFor(() => {
        expect(status(screen.container)).toBe('“caderno” removida.');
      });
    });

    it('uses pt-BR for the maximum', async () => {
      const screen = await renderWithProvider(<Example defaultValue={['a']} maxTags={1} />, {
        locale: 'pt-BR',
      });
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('b{Enter}');
      await expect
        .element(screen.getByRole('alert'))
        .toHaveTextContent('Você pode adicionar apenas 1 tag.');
    });

    it('lets the provider and then the instance override a message', async () => {
      const provider = await renderWithProvider(<Example defaultValue={['a']} />, {
        messages: { TagInput: { duplicate: (tag: string) => `Já existe ${tag}` } },
      });
      await userEvent.click(provider.getByRole('textbox'));
      await userEvent.keyboard('a{Enter}');
      await expect.element(provider.getByText('Já existe a')).toBeVisible();
      await provider.unmount();

      const instance = await renderWithProvider(
        <Example
          defaultValue={['a']}
          messages={{ duplicate: (tag: string) => `Repetida: ${tag}` }}
        />,
        { messages: { TagInput: { duplicate: (tag: string) => `Já existe ${tag}` } } },
      );
      await userEvent.click(instance.getByRole('textbox'));
      await userEvent.keyboard('a{Enter}');
      await expect.element(instance.getByText('Repetida: a')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations when empty, filled and with a description (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <TagInput label="Empty" />
          <TagInput
            label="Filled"
            defaultValue={['notebook', 'headphones', 'backpack']}
            description="Separate with commas."
          />
          <TagInput aria-label="Keywords" defaultValue={['a']} size="sm" />
          <TagInput label="Large" size="lg" defaultValue={['a']} placeholder="Add" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with a duplicate notice and a validation error (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example defaultValue={['notebook']} maxTags={1} />
        </main>,
      );
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.keyboard('notebook{Enter}');
      await expectNoA11yViolations(screen.container);
      await userEvent.keyboard('lamp{Enter}');
      await expect.element(screen.getByRole('alert')).toBeVisible();
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused, disabled or read-only (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example defaultValue={['notebook']} />
          <TagInput label="Off" isDisabled defaultValue={['a']} />
          <TagInput label="Locked" isReadOnly defaultValue={['a']} />
          <TagInput label="Required" isRequired />
        </main>,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
