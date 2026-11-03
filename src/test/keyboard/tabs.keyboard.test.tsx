/**
 * Keyboard contract: Tabs.
 * Spec: AGENTS.md section 8, row "Tabs": roving; left/right move; Home/End; automatic or manual
 * activation as documented; Tab moves into the panel (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Tab, TabList, TabPanel, Tabs } from '../../components/Tabs';
import type { TabsProps } from '../../components/Tabs';
import { renderWithProvider } from '../render';
import { activeLabel, expectFocus, press, tabOrder } from './contract';

function Example(props: Partial<TabsProps> & { disableMiddle?: boolean }) {
  const { disableMiddle, ...rest } = props;
  return (
    <>
      <button type="button">Before</button>
      <Tabs {...rest}>
        <TabList aria-label="Sections">
          <Tab id="one">One</Tab>
          <Tab id="two" {...(disableMiddle ? { isDisabled: true } : {})}>
            Two
          </Tab>
          <Tab id="three">Three</Tab>
        </TabList>
        <TabPanel id="one">Panel one</TabPanel>
        <TabPanel id="two">Panel two</TabPanel>
        <TabPanel id="three">Panel three</TabPanel>
      </Tabs>
      <button type="button">After</button>
    </>
  );
}

const panelText = () => document.querySelector('[role="tabpanel"]')?.textContent;

describe('keyboard contract: tabs (automatic activation)', () => {
  it('the tab list is one Tab stop; the next Tab moves into the panel, then out', async () => {
    await renderWithProvider(<Example />);
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['One']);
    await userEvent.tab();
    expect(document.activeElement?.getAttribute('role')).toBe('tabpanel');
    expect(await tabOrder(1)).toEqual(['After']);
  });

  it('Tab enters on the selected tab, not the first', async () => {
    await renderWithProvider(<Example defaultSelectedKey="three" />);
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['Three']);
  });

  it('Right/Left move focus and activate the tab; both ends wrap', async () => {
    const onSelectionChange = vi.fn();
    await renderWithProvider(<Example onSelectionChange={onSelectionChange} />);
    await userEvent.tab();
    await userEvent.tab();
    await press('{ArrowRight}');
    await expectFocus('Two');
    await expect.poll(panelText).toBe('Panel two');
    expect(onSelectionChange).toHaveBeenLastCalledWith('two');
    await press('{ArrowLeft}{ArrowLeft}');
    await expectFocus('Three');
    await expect.poll(panelText).toBe('Panel three');
    await press('{ArrowRight}');
    await expectFocus('One');
  });

  it('Home and End jump to the first and last tab and activate it', async () => {
    await renderWithProvider(<Example />);
    await userEvent.tab();
    await userEvent.tab();
    await press('{End}');
    await expectFocus('Three');
    await expect.poll(panelText).toBe('Panel three');
    await press('{Home}');
    await expectFocus('One');
    await expect.poll(panelText).toBe('Panel one');
  });

  it('skips disabled tabs', async () => {
    await renderWithProvider(<Example disableMiddle />);
    await userEvent.tab();
    await userEvent.tab();
    await press('{ArrowRight}');
    await expectFocus('Three');
  });
});

describe('keyboard contract: tabs (manual activation)', () => {
  it('arrows only move focus; Enter and Space activate the focused tab', async () => {
    await renderWithProvider(<Example keyboardActivation="manual" />);
    await userEvent.tab();
    await userEvent.tab();
    await press('{ArrowRight}');
    await expectFocus('Two');
    expect(panelText()).toBe('Panel one');
    await press('{Enter}');
    await expect.poll(panelText).toBe('Panel two');
    await press('{ArrowRight}');
    expect(activeLabel()).toBe('Three');
    expect(panelText()).toBe('Panel two');
    await press(' ');
    await expect.poll(panelText).toBe('Panel three');
  });

  it('Home and End only move focus', async () => {
    await renderWithProvider(<Example keyboardActivation="manual" />);
    await userEvent.tab();
    await userEvent.tab();
    await press('{End}');
    await expectFocus('Three');
    expect(panelText()).toBe('Panel one');
  });
});
