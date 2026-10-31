import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Input } from '../Input';
import { FieldSet } from './FieldSet';

describe('FieldSet', () => {
  it('renders a group named by its legend', async () => {
    const screen = await renderWithProvider(
      <FieldSet legend="Billing address">
        <Input label="Street" />
      </FieldSet>,
    );
    await expect.element(screen.getByRole('group', { name: 'Billing address' })).toBeVisible();
  });

  it('styles the legend as a mono, uppercase caption', async () => {
    const screen = await renderWithProvider(
      <FieldSet legend="Billing address">
        <Input label="Street" />
      </FieldSet>,
    );
    const legend = screen.getByText('Billing address').element();
    const style = getComputedStyle(legend);
    expect(style.fontFamily).toContain('Geist Mono');
    expect(style.textTransform).toBe('uppercase');
  });

  it('links the description to the group', async () => {
    const screen = await renderWithProvider(
      <FieldSet legend="Billing address" description="Shown on invoices.">
        <Input label="Street" />
      </FieldSet>,
    );
    await expect
      .element(screen.getByRole('group', { name: 'Billing address' }))
      .toHaveAccessibleDescription('Shown on invoices.');
  });

  it('keeps a consumer aria-describedby next to the description', async () => {
    const screen = await renderWithProvider(
      <>
        <p id="extra">Extra help.</p>
        <FieldSet
          legend="Billing address"
          description="Shown on invoices."
          aria-describedby="extra"
        >
          <Input label="Street" />
        </FieldSet>
      </>,
    );
    await expect
      .element(screen.getByRole('group', { name: 'Billing address' }))
      .toHaveAccessibleDescription('Extra help. Shown on invoices.');
  });

  it('stacks its fields with the field-set gap', async () => {
    const screen = await renderWithProvider(
      <FieldSet legend="Address">
        <Input label="Street" />
        <Input label="City" />
      </FieldSet>,
    );
    const fields = screen.getByRole('group', { name: 'Address' }).element().lastElementChild;
    expect(getComputedStyle(fields as Element).rowGap).toBe('12px');
  });

  it('disables every native control inside when isDisabled', async () => {
    const screen = await renderWithProvider(
      <FieldSet legend="Address" isDisabled>
        <Input label="Street" />
        <Button>Lookup</Button>
      </FieldSet>,
    );
    await expect.element(screen.getByRole('textbox', { name: 'Street' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Lookup' })).toBeDisabled();
    const fields = screen.getByRole('group', { name: 'Address' }).element().lastElementChild;
    expect(parseFloat(getComputedStyle(fields as Element).opacity)).toBeCloseTo(0.35, 2);
  });

  it('keeps tab focus out of a disabled group and in an enabled one', async () => {
    const screen = await renderWithProvider(
      <>
        <FieldSet legend="Locked" isDisabled>
          <Input label="Locked field" />
        </FieldSet>
        <FieldSet legend="Open">
          <Input label="Open field" />
        </FieldSet>
      </>,
    );
    await userEvent.tab();
    await expect.element(screen.getByRole('textbox', { name: 'Open field' })).toHaveFocus();
  });

  it('is not dimmed when enabled', async () => {
    const screen = await renderWithProvider(
      <FieldSet legend="Address">
        <Input label="Street" />
      </FieldSet>,
    );
    const fields = screen.getByRole('group', { name: 'Address' }).element().lastElementChild;
    expect(getComputedStyle(fields as Element).opacity).toBe('1');
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLFieldSetElement>();
    await renderWithProvider(
      <FieldSet ref={ref} legend="Address" className="extra" id="fs">
        <Input label="Street" />
      </FieldSet>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('fs');
  });

  it('has no axe violations, enabled and disabled', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <FieldSet legend="Billing address" description="Shown on invoices.">
          <Input label="Street" />
        </FieldSet>
        <FieldSet legend="Shipping address" isDisabled>
          <Input label="Street" description="Managed by your administrator." />
        </FieldSet>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
