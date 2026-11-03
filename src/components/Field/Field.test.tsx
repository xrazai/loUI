import { createRef } from 'react';
import { Input as RACInput, TextField } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Combobox } from '../Combobox';
import { CurrencyInput } from '../CurrencyInput';
import { Input } from '../Input';
import { NumberField } from '../NumberField';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Description, ErrorText, FieldError, FieldMessages, Label } from './Field';
import type { FieldMessageTone } from './labeling';

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

describe('toned description (GAP-039)', () => {
  const tones: FieldMessageTone[] = ['accent', 'success', 'warning', 'danger'];

  function colorOf(element: Element | null): string {
    return element ? getComputedStyle(element).color : '';
  }

  it('Description without a tone has no data-tone and keeps the tertiary colour', async () => {
    const screen = await renderWithProvider(<Composed />);
    const description = screen.getByText('Shown on invoices.').element();
    expect(description.hasAttribute('data-tone')).toBe(false);
    expect(colorOf(description)).not.toBe('');
  });

  it('neutral is the same as no tone', async () => {
    const screen = await renderWithProvider(
      <TextField>
        <Label>Name</Label>
        <RACInput />
        <Description tone="neutral">Plain.</Description>
      </TextField>,
    );
    expect(screen.getByText('Plain.').element().hasAttribute('data-tone')).toBe(false);
  });

  it.each(tones)('%s tints the text and leaves it linked with aria-describedby', async (tone) => {
    const screen = await renderWithProvider(
      <main>
        <Input label="Plain" description="Plain." />
        <Input label="Amount" description="Over by $5" descriptionTone={tone} />
      </main>,
    );
    const description = screen.getByText('Over by $5').element();
    expect(description.getAttribute('data-tone')).toBe(tone);
    expect(colorOf(description)).not.toBe(colorOf(screen.getByText('Plain.').element()));
    await expect
      .element(screen.getByRole('textbox', { name: 'Amount' }))
      .toHaveAccessibleDescription('Over by $5');
  });

  it('uses the same tokens as the signal colours', async () => {
    const screen = await renderWithProvider(
      <main>
        <Input label="A" description="Matches" descriptionTone="success" />
        <Input label="B" description="Short by $5" descriptionTone="danger" />
        <Input label="C" description="Over by $5" descriptionTone="warning" />
      </main>,
    );
    const probe = (token: string) => {
      const element = document.createElement('span');
      element.style.color = `var(${token})`;
      document.body.append(element);
      const color = getComputedStyle(element).color;
      element.remove();
      return color;
    };
    expect(colorOf(screen.getByText('Matches').element())).toBe(probe('--ds-success'));
    expect(colorOf(screen.getByText('Short by $5').element())).toBe(probe('--ds-danger'));
    expect(colorOf(screen.getByText('Over by $5').element())).toBe(probe('--ds-warning'));
  });

  it('a toned description is not an alert: the live error stays the only announcement', async () => {
    const screen = await renderWithProvider(
      <Input
        label="Amount"
        description="Short by $5"
        descriptionTone="danger"
        isInvalid
        errorMessage="Enter the full amount."
      />,
    );
    expect(screen.container.querySelectorAll('[role="alert"]')).toHaveLength(1);
    await expect
      .element(screen.getByRole('textbox', { name: 'Amount' }))
      .toHaveAccessibleDescription('Short by $5 Enter the full amount.');
  });

  it('is passed through by Input, Textarea, Select, Combobox, NumberField and CurrencyInput', async () => {
    const screen = await renderWithProvider(
      <main>
        <Input label="Input" description="Text message" descriptionTone="success" />
        <Textarea label="Textarea" description="Textarea message" descriptionTone="success" />
        <Select
          label="Select"
          options={[{ value: 'a', label: 'A' }]}
          description="Select message"
          descriptionTone="success"
        />
        <Combobox
          label="Combobox"
          options={[{ value: 'a', label: 'A' }]}
          description="Combobox message"
          descriptionTone="success"
        />
        <NumberField label="Number" description="Number message" descriptionTone="success" />
        <CurrencyInput
          label="Currency"
          currency="USD"
          description="Currency message"
          descriptionTone="success"
        />
      </main>,
    );
    for (const text of [
      'Text message',
      'Textarea message',
      'Select message',
      'Combobox message',
      'Number message',
      'Currency message',
    ]) {
      expect(screen.getByText(text).element().getAttribute('data-tone')).toBe('success');
    }
    await expect
      .element(screen.getByRole('textbox', { name: 'Currency' }))
      .toHaveAccessibleDescription('Currency message');
    await expect
      .element(screen.getByRole('combobox', { name: 'Combobox' }))
      .toHaveAccessibleDescription('Combobox message');
  });

  it('has no axe violations in every tone, including contrast (axe)', async () => {
    const screen = await renderWithProvider(
      <main>
        {tones.map((tone) => (
          <Input
            key={tone}
            label={`Field ${tone}`}
            description={`Message ${tone}`}
            descriptionTone={tone}
          />
        ))}
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});

describe('ErrorText', () => {
  it('renders outside a field, links by id and is not a live region by default', async () => {
    const screen = await renderWithProvider(
      <>
        <div role="group" aria-label="Colors" aria-describedby="colors-error">
          <button type="button">Red</button>
        </div>
        <ErrorText id="colors-error">Select at least one color.</ErrorText>
      </>,
    );
    const el = screen.container.querySelector('#colors-error');
    expect(el?.textContent).toBe('Select at least one color.');
    expect(el?.getAttribute('role')).toBeNull();
    await expect
      .element(screen.getByRole('group', { name: 'Colors' }))
      .toHaveAccessibleDescription('Select at least one color.');
    await expectNoA11yViolations(screen.container);
  });

  it('generates an id, announces with announce, and renders nothing when empty', async () => {
    const screen = await renderWithProvider(
      <>
        <ErrorText announce>Pick a size.</ErrorText>
        <ErrorText>{''}</ErrorText>
        <ErrorText>{null}</ErrorText>
      </>,
    );
    const paragraphs = screen.container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]?.getAttribute('role')).toBe('alert');
    expect(paragraphs[0]?.id).not.toBe('');
  });
});
