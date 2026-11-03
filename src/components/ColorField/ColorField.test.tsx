import { useState } from 'react';
import { parseColor } from 'react-aria-components';
import type { Color } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Inline } from '../Inline';
import { ColorField } from './ColorField';
import type { ColorFieldProps } from './ColorField';

function Fabric(props: Partial<ColorFieldProps>) {
  return <ColorField label="Hex" defaultValue="#336699" {...props} />;
}

describe('ColorField', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a named text input showing the hex, with a decorative swatch', async () => {
    const screen = await renderWithProvider(<Fabric description="Fabric colour." />);
    const field = screen.getByRole('textbox', { name: 'Hex' });
    await expect.element(field).toHaveValue('#336699');
    await expect.element(field).toHaveAccessibleDescription('Fabric colour.');
    const swatch = screen.container.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(swatch.style.getPropertyValue('--ds-swatch-color')).toBe('#336699');
    expect(screen.container.querySelector('[role="img"]')).toBeNull();
  });

  it('shows an empty swatch when there is no value', async () => {
    const screen = await renderWithProvider(<Fabric defaultValue={null} placeholder="#RRGGBB" />);
    const swatch = screen.container.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(swatch.dataset['empty']).toBe('true');
    await expect.element(screen.getByRole('textbox')).toHaveAttribute('placeholder', '#RRGGBB');
  });

  it('normalises short and lower case hex to #RRGGBB on blur and reports a Color', async () => {
    const onChange = vi.fn<(color: Color | null) => void>();
    const screen = await renderWithProvider(<Fabric defaultValue={null} onChange={onChange} />);
    const field = screen.getByRole('textbox');
    await field.fill('#abc');
    await userEvent.tab();
    await expect.element(field).toHaveValue('#AABBCC');
    expect(onChange.mock.lastCall?.[0]?.toString('hex')).toBe('#AABBCC');
  });

  it('reverts text that is not a colour on blur', async () => {
    const screen = await renderWithProvider(<Fabric />);
    const field = screen.getByRole('textbox');
    await field.fill('not a colour');
    await userEvent.tab();
    await expect.element(field).toHaveValue('#336699');
  });

  it('reports null when emptied', async () => {
    const onChange = vi.fn<(color: Color | null) => void>();
    const screen = await renderWithProvider(<Fabric onChange={onChange} />);
    const field = screen.getByRole('textbox');
    await field.fill('');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('steps with the arrow keys', async () => {
    const screen = await renderWithProvider(<Fabric defaultValue="#000010" />);
    const field = screen.getByRole('textbox');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(field).toHaveValue('#000011');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect.element(field).toHaveValue('#00000F');
  });

  it('works controlled with a Color and with a string', async () => {
    function Controlled() {
      const [value, setValue] = useState<Color | null>(parseColor('#112233'));
      return (
        <>
          <Fabric value={value} onChange={setValue} />
          <output data-testid="mirror">{value?.toString('hex') ?? 'none'}</output>
          <button
            type="button"
            onClick={() => {
              setValue(parseColor('#FF0000'));
            }}
          >
            Red
          </button>
        </>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    const field = screen.getByRole('textbox');
    await expect.element(field).toHaveValue('#112233');
    await field.fill('445566');
    await userEvent.tab();
    await expect.element(screen.getByTestId('mirror')).toHaveTextContent('#445566');
    await screen.getByRole('button', { name: 'Red' }).click();
    await expect.element(field).toHaveValue('#FF0000');
    await screen.unmount();
    const asString = await renderWithProvider(<Fabric value="#abcdef" onChange={() => {}} />);
    await expect.element(asString.getByRole('textbox')).toHaveValue('#ABCDEF');
  });

  it('shows the catalog error when invalid, a custom errorMessage, and a validate message', async () => {
    const invalid = await renderWithProvider(<Fabric isInvalid />);
    const field = invalid.getByRole('textbox');
    await expect.element(field).toHaveAccessibleDescription('Enter a colour as #RRGGBB.');
    expect(field.element().getAttribute('aria-invalid')).toBe('true');
    await invalid.unmount();
    const custom = await renderWithProvider(
      <Fabric isInvalid errorMessage="Pick a darker tone." />,
    );
    await expect
      .element(custom.getByRole('textbox'))
      .toHaveAccessibleDescription('Pick a darker tone.');
    await custom.unmount();
    const validated = await renderWithProvider(
      <Fabric
        validationBehavior="aria"
        validate={(color) => (color?.toString('hex') === '#336699' ? 'Already used.' : null)}
      />,
    );
    await expect
      .element(validated.getByRole('textbox'))
      .toHaveAccessibleDescription('Already used.');
  });

  it('is required: no error before a submit attempt, error after', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <ColorField label="Hex" name="hex" isRequired />
        <button type="submit">Save</button>
      </form>,
    );
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Enter a colour as #RRGGBB.');
  });

  it('submits name and the hex value with the form', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Fabric name="hex" />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('hex')).toBe('#336699');
  });

  it('takes the error from messages: pt-BR, provider and instance override', async () => {
    const ptBR = await renderWithProvider(<Fabric label="Cor" isInvalid />, { locale: 'pt-BR' });
    await expect
      .element(ptBR.getByRole('textbox'))
      .toHaveAccessibleDescription('Informe uma cor no formato #RRGGBB.');
    await ptBR.unmount();
    const provider = await renderWithProvider(<Fabric isInvalid />, {
      messages: { ColorField: { invalid: 'Bad hex.' } },
    });
    await expect.element(provider.getByRole('textbox')).toHaveAccessibleDescription('Bad hex.');
    await provider.unmount();
    const instance = await renderWithProvider(<Fabric isInvalid messages={{ invalid: 'Nope.' }} />);
    await expect.element(instance.getByRole('textbox')).toHaveAccessibleDescription('Nope.');
  });

  it('disables and makes read-only', async () => {
    const disabled = await renderWithProvider(<Fabric isDisabled />);
    await expect.element(disabled.getByRole('textbox')).toBeDisabled();
    await disabled.unmount();
    const readOnly = await renderWithProvider(<Fabric isReadOnly />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(readOnly.getByRole('textbox')).toHaveValue('#336699');
  });

  it('sets data-size and warns without an accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = await renderWithProvider(<Fabric size="lg" />);
    expect(screen.container.querySelector('[data-size="lg"]')).not.toBeNull();
    await screen.unmount();
    // @ts-expect-error a name is required by the types
    await renderWithProvider(<ColorField />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('ColorField needs an accessible name'),
    );
  });

  it('has no axe violations (default, invalid, disabled, empty)', async () => {
    const screen = await renderWithProvider(
      <>
        <Fabric label="Default" description="Fabric colour." />
        <Fabric label="Invalid" isInvalid />
        <Fabric label="Disabled" isDisabled />
        <Fabric label="Empty" defaultValue={null} placeholder="#RRGGBB" />
      </>,
    );
    await expectNoA11yViolations(screen.container);
  });
});

describe('ColorField fullWidth', () => {
  it('takes the free space of an Inline row', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 700 }}>
        <Inline gap={2} wrap={false}>
          <ColorField label="Colour" fullWidth />
          <button type="button">Apply</button>
        </Inline>
      </div>,
    );
    const field = screen.container.querySelector('[data-full-width]') as HTMLElement;
    expect(field).not.toBeNull();
    expect(field.getBoundingClientRect().width).toBeGreaterThan(500);
  });
});
