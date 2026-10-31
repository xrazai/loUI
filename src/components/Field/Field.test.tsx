import { createRef } from 'react';
import { Input as RACInput, TextField } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Input } from '../Input';
import { Description, FieldError, FieldMessages, Label } from './Field';

function Composed(props: {
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: React.ComponentProps<typeof FieldError>['children'];
}) {
  return (
    <TextField
      {...(props.isRequired ? { isRequired: true } : {})}
      {...(props.isInvalid ? { isInvalid: true } : {})}
    >
      <Label isRequired={props.isRequired}>Name</Label>
      <RACInput />
      <Description>Shown on invoices.</Description>
      <FieldError>{props.errorMessage}</FieldError>
    </TextField>
  );
}

describe('Field building blocks', () => {
  it('Label names the control and adds a required marker that assistive technology skips', async () => {
    const screen = await renderWithProvider(<Composed isRequired />);
    await expect.element(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    const mark = screen.container.querySelector('label span');
    expect(mark?.textContent).toBe('*');
    expect(mark?.getAttribute('aria-hidden')).toBe('true');
  });

  it('Label has no marker unless it is required', async () => {
    const screen = await renderWithProvider(<Composed />);
    expect(screen.container.querySelector('label span')).toBeNull();
  });

  it('Label merges className and takes a ref', async () => {
    const ref = createRef<HTMLLabelElement>();
    const screen = await renderWithProvider(
      <TextField>
        <Label ref={ref} className="extra">
          Name
        </Label>
        <RACInput />
      </TextField>,
    );
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(screen.container.querySelector('label')?.classList.contains('extra')).toBe(true);
  });

  it('Description is linked with aria-describedby', async () => {
    const screen = await renderWithProvider(<Composed />);
    await expect
      .element(screen.getByRole('textbox', { name: 'Name' }))
      .toHaveAccessibleDescription('Shown on invoices.');
  });

  it('FieldError renders nothing while the field is valid', async () => {
    const screen = await renderWithProvider(<Composed errorMessage="Enter a name." />);
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
  });

  it('FieldError shows its message in an alert once invalid, linked to the control', async () => {
    const screen = await renderWithProvider(<Composed isInvalid errorMessage="Enter a name." />);
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Enter a name.');
    await expect
      .element(screen.getByRole('textbox', { name: 'Name' }))
      .toHaveAccessibleDescription('Shown on invoices. Enter a name.');
  });

  it('FieldError accepts a function that receives the validation result', async () => {
    const screen = await renderWithProvider(
      <Composed isInvalid errorMessage={(v) => `Errors: ${String(v.validationErrors.length)}`} />,
    );
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Errors: 0');
  });

  it('FieldMessages renders the description and the error', async () => {
    const screen = await renderWithProvider(
      <TextField isInvalid>
        <Label>Name</Label>
        <RACInput />
        <FieldMessages description="Hint." errorMessage="Problem." />
      </TextField>,
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Name' }))
      .toHaveAccessibleDescription('Hint. Problem.');
  });

  it('has no axe violations in the composed field', async () => {
    const screen = await renderWithProvider(
      <main>
        <Composed isRequired />
        <Composed isInvalid errorMessage="Enter a name." />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});

describe('validation timing (the product rule: errors appear only after a save attempt)', () => {
  const tooShort = (value: string) => (value.length < 3 ? 'Use at least 3 characters.' : null);

  it('native (default): a required field shows its error only after a submit attempt', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Input label="Code" name="code" isRequired errorMessage="Enter a code." />
        <button type="submit">Save</button>
      </form>,
    );
    const input = screen.getByRole('textbox', { name: 'Code' });
    await userEvent.click(input);
    await userEvent.tab();
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Enter a code.');
  });

  it('native (default): a custom rule stays quiet while typing and reports once the field is committed', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Input label="Code" name="code" validate={tooShort} />
        <button type="submit">Save</button>
      </form>,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Code' }), 'a');
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await userEvent.tab();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Use at least 3 characters.');
  });

  it('aria: the error follows every keystroke and does not block submit', async () => {
    let submitted = false;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = true;
        }}
      >
        <Input label="Code" name="code" validate={tooShort} validationBehavior="aria" />
        <button type="submit">Save</button>
      </form>,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Code' }), 'a');
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Use at least 3 characters.');
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(submitted).toBe(true);
  });
});
