import { createRef, useState } from 'react';
import type { ReactNode } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Input } from '../Input';
import { Radio, RadioGroup } from '../RadioGroup';
import { Form, FormErrorSummary } from './Form';
import type { FormProps } from './Form';

/** A message for the empty field that still lets server and format errors through. */
function emptyMessage(text: string) {
  return (validation: { validationDetails: ValidityState; validationErrors: string[] }) =>
    validation.validationDetails.valueMissing ? text : validation.validationErrors.join(' ');
}

function Fields({ children }: { children?: ReactNode }) {
  return (
    <>
      <Input label="Name" name="name" isRequired errorMessage={emptyMessage('Enter a name.')} />
      <Input
        label="Email"
        name="email"
        type="email"
        isRequired
        errorMessage={emptyMessage('Enter an email.')}
      />
      {children}
      <Button type="submit" variant="primary">
        Save changes
      </Button>
    </>
  );
}

function renderForm(
  props: Partial<FormProps> = {},
  options?: Parameters<typeof renderWithProvider>[1],
) {
  return renderWithProvider(
    <Form aria-label="Profile" {...props}>
      <Fields />
    </Form>,
    options,
  );
}

describe('Form', () => {
  it('renders a form with a vertical rhythm', async () => {
    const screen = await renderForm();
    const form = screen.getByRole('form', { name: 'Profile' }).element();
    const style = getComputedStyle(form);
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('column');
    expect(style.rowGap).toBe('20px');
  });

  it('uses native validation by default and blocks an invalid submit', async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    const screen = await renderForm({ onSubmit });
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('textbox', { name: /Name/ })).toBeInvalid();
  });

  it('moves focus to the first invalid field when the submit fails', async () => {
    const screen = await renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByRole('textbox', { name: /Name/ })).toHaveFocus();
    await expect.element(screen.getByText('Enter a name.')).toBeVisible();
  });

  it('submits when the form is valid', async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    const screen = await renderForm({ onSubmit });
    await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), 'Ada');
    await userEvent.type(screen.getByRole('textbox', { name: /Email/ }), 'ada@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows server errors from validationErrors on the matching field', async () => {
    const screen = await renderForm({
      validationErrors: { email: 'That email is already taken.' },
    });
    await expect.element(screen.getByText('That email is already taken.')).toBeVisible();
    await expect.element(screen.getByRole('textbox', { name: /Email/ })).toBeInvalid();
  });

  it('shows a server error even when the field has a static errorMessage (GAP-009)', async () => {
    const screen = await renderWithProvider(
      <Form aria-label="Profile" validationErrors={{ email: 'That email is already taken.' }}>
        <Input label="Email" name="email" type="email" isRequired errorMessage="Enter an email." />
        <Button type="submit">Save changes</Button>
      </Form>,
    );
    await expect.element(screen.getByText('That email is already taken.')).toBeVisible();
    expect(screen.container.textContent).not.toContain('Enter an email.');
  });

  it('keeps the static errorMessage for the browser constraint text of an empty field (GAP-009)', async () => {
    const screen = await renderWithProvider(
      <Form aria-label="Profile">
        <Input label="Email" name="email" type="email" isRequired errorMessage="Enter an email." />
        <Button type="submit">Save changes</Button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByText('Enter an email.')).toBeVisible();
  });

  it('lets aria validation behavior submit without blocking', async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    const screen = await renderForm({ validationBehavior: 'aria', onSubmit });
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('takes the ref as a prop and merges className', async () => {
    const ref = createRef<HTMLFormElement>();
    await renderWithProvider(
      <Form ref={ref} className="extra" id="f">
        <Input label="Name" />
      </Form>,
    );
    expect(ref.current?.tagName).toBe('FORM');
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('f');
  });

  it('has no axe violations, untouched and after a failed submit', async () => {
    const screen = await renderForm({ errorSummary: true });
    await expectNoA11yViolations(screen.container);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByRole('alert').first()).toBeVisible();
    await expectNoA11yViolations(screen.container);
  });
});

describe('Form error summary', () => {
  it('renders nothing while the form is valid', async () => {
    const screen = await renderForm({ errorSummary: true });
    expect(screen.container.querySelector('[class*="summary"]')).toBeNull();
  });

  it('on a failed submit takes focus and lists the invalid fields as links', async () => {
    const screen = await renderForm({ errorSummary: true });
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    const summary = screen.getByRole('alert').filter({ hasText: 'Fix 2 fields before saving' });
    await expect.element(summary).toBeVisible();
    await expect.poll(() => document.activeElement).toBe(summary.element());
    await expect.element(screen.getByRole('link', { name: 'Name' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Email' })).toBeVisible();
    expect(summary.element().textContent).toContain('Enter a name.');
  });

  it('pluralizes the title: one field and many fields', async () => {
    const screen = await renderForm({ errorSummary: true });
    await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByText('Fix 1 field before saving')).toBeVisible();
  });

  it('a link moves focus to its field with the keyboard', async () => {
    const screen = await renderForm({ errorSummary: true });
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByRole('link', { name: 'Email' })).toBeVisible();
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(screen.getByRole('link', { name: 'Email' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('textbox', { name: /Email/ })).toHaveFocus();
  });

  it('updates while the user fixes fields and disappears when none is left', async () => {
    const screen = await renderForm({ errorSummary: true });
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByText('Fix 2 fields before saving')).toBeVisible();
    // React Aria clears a displayed native error when the edit is committed (blur).
    await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), 'Ada');
    await userEvent.tab();
    await expect.element(screen.getByText('Fix 1 field before saving')).toBeVisible();
    await userEvent.type(screen.getByRole('textbox', { name: /Email/ }), 'ada@example.com');
    await userEvent.tab();
    await expect.element(screen.getByRole('link')).not.toBeInTheDocument();
  });

  it('summarizes server errors and takes focus', async () => {
    function Harness() {
      const [errors, setErrors] = useState<FormProps['validationErrors']>(undefined);
      return (
        <Form
          aria-label="Profile"
          errorSummary
          validationErrors={errors}
          onSubmit={(event) => {
            event.preventDefault();
            setErrors({ email: 'That email is already taken.' });
          }}
        >
          <Input label="Name" name="name" />
          <Input label="Email" name="email" type="email" />
          <Button type="submit">Save changes</Button>
        </Form>
      );
    }
    const screen = await renderWithProvider(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    const summary = screen.getByRole('alert').filter({ hasText: 'Fix 1 field before saving' });
    await expect.element(summary).toBeVisible();
    expect(summary.element().textContent).toContain('That email is already taken.');
    await expect.element(screen.getByRole('link', { name: 'Email' })).toBeVisible();
  });

  it('counts a radio group once, under the group label', async () => {
    const screen = await renderWithProvider(
      <Form aria-label="Plan" errorSummary>
        <RadioGroup label="Region" name="region" isRequired>
          <Radio value="eu" label="EU" />
          <Radio value="us" label="US" />
        </RadioGroup>
        <Button type="submit">Save changes</Button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByText('Fix 1 field before saving')).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Region' })).toBeVisible();
  });

  it('can be placed by hand with FormErrorSummary', async () => {
    const screen = await renderWithProvider(
      <Form aria-label="Profile">
        <Input label="Name" name="name" isRequired />
        <Button type="submit">Save changes</Button>
        <FormErrorSummary />
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await expect.element(screen.getByText('Fix 1 field before saving')).toBeVisible();
  });

  it('throws a clear error outside a Form', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderWithProvider(<FormErrorSummary />)).rejects.toThrow(/inside Form/);
    error.mockRestore();
  });

  it('is translated to pt-BR, and every message can be overridden', async () => {
    const portuguese = await renderForm({ errorSummary: true }, { locale: 'pt-BR' });
    await userEvent.click(portuguese.getByRole('button', { name: 'Save changes' }));
    await expect.element(portuguese.getByText('Corrija 2 campos antes de salvar')).toBeVisible();
    await portuguese.unmount();

    const provider = await renderForm(
      { errorSummary: true },
      { messages: { Form: { summaryTitle: (n: number) => `Provider ${String(n)}` } } },
    );
    await userEvent.click(provider.getByRole('button', { name: 'Save changes' }));
    await expect.element(provider.getByText('Provider 2')).toBeVisible();
    await provider.unmount();

    const instance = await renderForm({
      errorSummary: true,
      messages: { summaryTitle: (n: number) => `Instance ${String(n)}` },
    });
    await userEvent.click(instance.getByRole('button', { name: 'Save changes' }));
    await expect.element(instance.getByText('Instance 2')).toBeVisible();
  });
});
