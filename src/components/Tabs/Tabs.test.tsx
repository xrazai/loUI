import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';
import type { TabsProps } from './Tabs';

function Example(props: Partial<TabsProps>) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Order sections">
        <Tab id="details">Details</Tab>
        <Tab
          id="items"
          count={1248}
          countTone="warning"
          countLabel="1,248 pending"
          shortcut={['2']}
        >
          Items
        </Tab>
        <Tab id="history">History</Tab>
      </TabList>
      <TabPanel id="details">Details panel</TabPanel>
      <TabPanel id="items">Items panel</TabPanel>
      <TabPanel id="history">History panel</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  describe('rendering and ARIA', () => {
    it('renders a named tablist with the first tab selected', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('tablist', { name: 'Order sections' })).toBeVisible();
      expect(
        screen.getByRole('tab', { name: 'Details' }).element().getAttribute('aria-selected'),
      ).toBe('true');
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Details panel');
    });

    it('links each tab to its panel in both directions', async () => {
      const screen = await renderWithProvider(<Example defaultSelectedKey="items" />);
      const tab = screen.getByRole('tab', { name: /Items/ }).element();
      const panel = screen.getByRole('tabpanel').element();
      expect(tab.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    });

    it('draws the active tab with a 2px ink underline', async () => {
      const screen = await renderWithProvider(<Example />);
      const active = getComputedStyle(screen.getByRole('tab', { name: 'Details' }).element());
      const inactive = getComputedStyle(screen.getByRole('tab', { name: 'History' }).element());
      expect(active.borderBottomWidth).toBe('2px');
      expect(active.borderBottomColor).toBe('rgb(237, 237, 234)');
      expect(inactive.borderBottomColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <Tabs ref={ref} className="extra" data-testid="t">
          <TabList aria-label="One">
            <Tab id="a">A</Tab>
          </TabList>
          <TabPanel id="a">Panel</TabPanel>
        </Tabs>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('t');
    });
  });

  describe('count and shortcut', () => {
    it('names the tab with the count label instead of the bare number', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect
        .element(screen.getByRole('tab', { name: 'Items 1,248 pending' }))
        .toBeInTheDocument();
    });

    it('uses the visible count in the name when there is no count label', async () => {
      const screen = await renderWithProvider(
        <Tabs>
          <TabList aria-label="One">
            <Tab id="a" count={12}>
              Orders
            </Tab>
          </TabList>
          <TabPanel id="a">Panel</TabPanel>
        </Tabs>,
      );
      await expect.element(screen.getByRole('tab', { name: 'Orders 12' })).toBeInTheDocument();
    });

    it('keeps the shortcut hint out of the accessible name', async () => {
      const screen = await renderWithProvider(<Example />);
      const tab = screen.getByRole('tab', { name: /Items/ }).element();
      expect(tab.querySelector('kbd')?.closest('[aria-hidden="true"]')).not.toBeNull();
      expect(tab.getAttribute('aria-label')).toBeNull();
    });

    it('formats numeric counts for the active locale (pt-BR)', async () => {
      const screen = await renderWithProvider(
        <Tabs>
          <TabList aria-label="Uma">
            <Tab id="a" count={1248}>
              Pedidos
            </Tab>
          </TabList>
          <TabPanel id="a">Painel</TabPanel>
        </Tabs>,
        { locale: 'pt-BR' },
      );
      await expect.element(screen.getByRole('tab', { name: 'Pedidos 1.248' })).toBeInTheDocument();
    });
  });

  describe('keyboard contract', () => {
    it('has one tab stop; arrows move and select, Home and End jump, wrapping at the ends', async () => {
      const onSelectionChange = vi.fn();
      const screen = await renderWithProvider(<Example onSelectionChange={onSelectionChange} />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('tab', { name: /Items/ })).toHaveFocus();
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Items panel');
      expect(onSelectionChange).toHaveBeenLastCalledWith('items');
      await userEvent.keyboard('{End}');
      await expect.element(screen.getByRole('tab', { name: 'History' })).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
      await userEvent.keyboard('{Home}');
      await expect.element(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(screen.getByRole('tab', { name: 'History' })).toHaveFocus();
    });

    it('moves from the selected tab into the panel with Tab', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('tabpanel')).toHaveFocus();
    });

    it('only moves focus with the arrows in manual mode; Enter and Space activate', async () => {
      const screen = await renderWithProvider(<Example keyboardActivation="manual" />);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('tab', { name: /Items/ })).toHaveFocus();
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Details panel');
      await userEvent.keyboard('{Enter}');
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Items panel');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Items panel');
      await userEvent.keyboard(' ');
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('History panel');
    });

    it('skips disabled tabs', async () => {
      const screen = await renderWithProvider(
        <Tabs>
          <TabList aria-label="Sections">
            <Tab id="a">A</Tab>
            <Tab id="b" isDisabled>
              B
            </Tab>
            <Tab id="c">C</Tab>
          </TabList>
          <TabPanel id="a">a</TabPanel>
          <TabPanel id="b">b</TabPanel>
          <TabPanel id="c">c</TabPanel>
        </Tabs>,
      );
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('tab', { name: 'C' })).toHaveFocus();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('starts on defaultSelectedKey and follows clicks', async () => {
      const screen = await renderWithProvider(<Example defaultSelectedKey="history" />);
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('History panel');
      await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Details panel');
    });

    it('only changes when the parent updates selectedKey', async () => {
      const onSelectionChange = vi.fn();
      const screen = await renderWithProvider(
        <Example selectedKey="details" onSelectionChange={onSelectionChange} />,
      );
      await userEvent.click(screen.getByRole('tab', { name: 'History' }));
      expect(onSelectionChange).toHaveBeenCalledWith('history');
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('Details panel');
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [key, setKey] = useState<string>('details');
        return (
          <Example
            selectedKey={key}
            onSelectionChange={(next) => {
              setKey(String(next));
            }}
          />
        );
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(screen.getByRole('tab', { name: 'History' }));
      await expect.element(screen.getByRole('tabpanel')).toHaveTextContent('History panel');
    });
  });

  describe('layout', () => {
    it('shows no vertical scrollbar when the tabs fit (GAP-037)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example />
        </main>,
      );
      const list = screen.getByRole('tablist').element();
      await expect.poll(() => list.scrollHeight - list.clientHeight).toBeLessThanOrEqual(0);
      expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    });

    it('still scrolls horizontally when there are many tabs', async () => {
      const ids = Array.from({ length: 30 }, (_, i) => `tab-${i}`);
      const screen = await renderWithProvider(
        <main style={{ inlineSize: 320 }}>
          <Tabs>
            <TabList aria-label="Many">
              {ids.map((id) => (
                <Tab key={id} id={id}>
                  {id}
                </Tab>
              ))}
            </TabList>
            {ids.map((id) => (
              <TabPanel key={id} id={id}>
                {id}
              </TabPanel>
            ))}
          </Tabs>
        </main>,
      );
      const list = screen.getByRole('tablist').element();
      expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
      expect(getComputedStyle(list).overflowX).not.toBe('visible');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused and in manual mode (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example keyboardActivation="manual" />
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with a disabled tab (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Tabs>
            <TabList aria-label="Sections">
              <Tab id="a">A</Tab>
              <Tab id="b" isDisabled>
                B
              </Tab>
            </TabList>
            <TabPanel id="a">a</TabPanel>
            <TabPanel id="b">b</TabPanel>
          </Tabs>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
