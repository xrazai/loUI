import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { FilterableTable } from './FilterableTable';

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup() {
  return renderWithProvider(
    <RecipeHost>
      <FilterableTable />
    </RecipeHost>,
  );
}

const customers = () =>
  [...document.querySelectorAll('tbody [role="rowheader"]')].map((cell) => cell.textContent);
/** The checkbox input is visually hidden; users press its label. */
async function toggle(screen: Screen, name: string) {
  const label = screen.getByRole('checkbox', { name }).element().closest('label');
  if (!label) throw new Error('checkbox without label');
  await userEvent.click(label);
}
const search = (screen: Screen) => screen.getByRole('searchbox', { name: 'Search orders' });

afterEach(() => {
  act(() => {
    toast.clear();
  });
});

describe('FilterableTable', () => {
  it('lists every order alphabetically by customer', async () => {
    const screen = await setup();
    await expect.element(screen.getByRole('grid', { name: 'Orders' })).toBeVisible();
    expect(customers()).toEqual([
      'Acme Supply',
      'Contoso',
      'Globex',
      'Initech',
      'Northwind',
      'Umbrella',
    ]);
  });

  it('filters by status and shows the counts', async () => {
    const screen = await setup();
    await expect.element(screen.getByRole('radio', { name: /^All/ })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: /^Open/ }));
    expect(customers()).toEqual(['Contoso', 'Northwind', 'Umbrella']);
    await expect.element(screen.getByRole('radio', { name: 'Open 3 open' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: /^Archived/ }));
    expect(customers()).toEqual(['Globex']);
  });

  it('searches by customer or order number, ignoring case and accents', async () => {
    const screen = await setup();
    await userEvent.fill(search(screen), 'CONTOSO');
    expect(customers()).toEqual(['Contoso']);
    await userEvent.fill(search(screen), 'ord-1050');
    expect(customers()).toEqual(['Initech']);
  });

  it('combines the search and the filter', async () => {
    const screen = await setup();
    await userEvent.click(screen.getByRole('radio', { name: /^Shipped/ }));
    await userEvent.fill(search(screen), 'in');
    expect(customers()).toEqual(['Initech']);
  });

  it('says what happened and what to do when nothing matches, and clears the filters', async () => {
    const screen = await setup();
    await userEvent.fill(search(screen), 'zzz');
    await expect.element(screen.getByRole('heading', { name: 'No orders found' })).toBeVisible();
    await expect.element(screen.getByText('Try another filter or search term.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(customers()).toHaveLength(6);
    await expect.element(search(screen)).toHaveValue('');
  });

  it('archives the selected orders with one action and offers Undo', async () => {
    const screen = await setup();
    await toggle(screen, 'Select row Contoso');
    await toggle(screen, 'Select row Northwind');
    await expect.element(screen.getByText('2 selected').first()).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Archive orders' }));
    await expect.element(screen.getByText(/2 orders archived/)).toBeVisible();
    await expect
      .poll(() => screen.getByRole('radio', { name: /^Archived/ }).element().textContent)
      .toBe('Archived3');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect
      .poll(() => screen.getByRole('radio', { name: /^Archived/ }).element().textContent)
      .toBe('Archived1');
  });

  it('moves between filters with the arrow keys', async () => {
    const screen = await setup();
    screen.getByRole('radio', { name: /^All/ }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(screen.getByRole('radio', { name: /^Open/ })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(screen.getByRole('radio', { name: /^Open/ })).toBeChecked();
    expect(customers()).toHaveLength(3);
  });

  it('has no axe violations: full list, empty result and bulk bar', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    await toggle(screen, 'Select row Contoso');
    await expect.element(screen.getByText('1 selected').first()).toBeVisible();
    await expectNoViolationsOnceSettled();
    await userEvent.fill(search(screen), 'zzz');
    await expect.element(screen.getByRole('heading', { name: 'No orders found' })).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
