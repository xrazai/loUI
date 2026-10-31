import { useState } from 'react';
import {
  AppShell,
  AppShellNavToggle,
  Button,
  Card,
  Kbd,
  Radio,
  RadioGroup,
  Select,
  Sidebar,
  Stack,
  Switch,
  TopBar,
  hotkeyKeys,
  toast,
  useHotkeys,
} from '../../index';

export interface Settings {
  orderShipped: boolean;
  weeklySummary: boolean;
  currency: string;
  invoiceDelivery: string;
}

const DEFAULTS: Settings = {
  orderShipped: true,
  weeklySummary: false,
  currency: 'usd',
  invoiceDelivery: 'email',
};

const CURRENCIES = [
  { value: 'brl', label: 'Brazilian real' },
  { value: 'eur', label: 'Euro' },
  { value: 'usd', label: 'US dollar' },
];

export interface SettingsPageProps {
  initialSettings?: Settings;
  /** Persists the settings. */
  onSave?: (settings: Settings) => void;
}

/**
 * A settings screen: app shell, one top bar with the page's single primary action and its
 * shortcut, and one card per topic. Controls are plain Switch, Select and RadioGroup; the
 * shortcut is registered with `useHotkeys` so it also shows up in the command palette and
 * the shortcuts help.
 */
export function SettingsPage({ initialSettings = DEFAULTS, onSave }: SettingsPageProps) {
  const [settings, setSettings] = useState(initialSettings);

  function save() {
    onSave?.(settings);
    toast.success('Settings saved');
  }

  useHotkeys([
    {
      keys: 'Mod+S',
      handler: save,
      description: 'Save settings',
      group: 'Settings',
      allowInEditable: true,
    },
  ]);

  return (
    <AppShell
      sidebar={
        <Sidebar
          workspace={{ name: 'Northwind', subtitle: 'Production' }}
          value="settings"
          sections={[
            {
              id: 'work',
              title: 'Work',
              items: [
                { value: 'orders', label: 'Orders', href: '#orders' },
                { value: 'customers', label: 'Customers', href: '#customers' },
              ],
            },
            {
              id: 'account',
              title: 'Account',
              items: [{ value: 'settings', label: 'Settings', href: '#settings' }],
            },
          ]}
        />
      }
      topBar={
        <TopBar
          title="Settings"
          actions={
            <Button variant="primary" trailing={<Kbd keys={hotkeyKeys('Mod+S')} />} onPress={save}>
              Save settings
            </Button>
          }
        >
          <AppShellNavToggle />
        </TopBar>
      }
    >
      <Stack gap={6}>
        <Card title="Email alerts">
          <Stack gap={4}>
            <Switch
              label="Order shipped"
              description="Email me when an order leaves the warehouse."
              isSelected={settings.orderShipped}
              onChange={(orderShipped) => {
                setSettings((current) => ({ ...current, orderShipped }));
              }}
            />
            <Switch
              label="Weekly summary"
              description="Email me a summary of orders every Monday."
              isSelected={settings.weeklySummary}
              onChange={(weeklySummary) => {
                setSettings((current) => ({ ...current, weeklySummary }));
              }}
            />
          </Stack>
        </Card>
        <Card title="Regional">
          <Select
            label="Currency"
            description="Used for new orders and invoices."
            options={CURRENCIES}
            value={settings.currency}
            onChange={(currency) => {
              if (currency) setSettings((current) => ({ ...current, currency }));
            }}
          />
        </Card>
        <Card title="Invoices">
          <RadioGroup
            label="Delivery"
            value={settings.invoiceDelivery}
            onChange={(invoiceDelivery) => {
              setSettings((current) => ({ ...current, invoiceDelivery }));
            }}
          >
            <Radio value="email" label="Send by email" />
            <Radio value="download" label="Download only" />
          </RadioGroup>
        </Card>
      </Stack>
    </AppShell>
  );
}
