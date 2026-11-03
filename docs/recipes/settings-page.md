# SettingsPage

Status: experimental

A settings screen: app shell, a top bar with the page's one primary action and its keyboard shortcut, and one card per topic with switches, a select and a radio group.

Components: `AppShell`, `Sidebar`, `TopBar`, `Card`, `Switch`, `Select`, `RadioGroup`, `Button`, `Kbd`, `Toast`, `useHotkeys`.

## When to use

- Preferences and configuration that the user changes and saves together.
- As the frame for other screens too: the shell, sidebar and top bar are the same.

## When not to use

- A form with validation rules and server errors: see `form-with-validation`.
- A single toggle that applies on change: use the `Switch` alone and show "Saved".

## What it does

- **One primary action, top right:** "Save settings", with the shortcut shown inside the button (`Kbd`). Everything else on the page is secondary or a control.
- **The shortcut works from anywhere**, including while a field has focus (`allowInEditable`), and it is registered with a description and group, so it appears in `ShortcutsHelp` and in a `CommandPalette` that uses `includeHotkeys`.
- **Landmarks:** `aside` (sidebar), `header` (top bar), one `main`, one `h1` ("Settings"). The skip link is built in; below 768 px the sidebar becomes an off-canvas panel opened by `AppShellNavToggle`.
- **Cards** group topics; each card title is an `h2`. Switches carry a description; the select and the radio group have visible labels.
- Saving shows a toast, "Settings saved". Nothing is validated here because every option is valid.

## Things to keep when you adapt it

- The shell fills its parent: give the parent a height (the story frame is 640 px tall).
- Currency, language and similar lists are alphabetical by label; pass them sorted (`sortByText`) unless the order carries meaning.
- If settings save automatically, drop the button and show "Saved" beside the control; keep a primary action only if something still needs one.
- `Mod+S` is Control S or Command S, resolved when the key is pressed.
- A `Card` is a labelled region. Do not title one "Notifications": the toast region has that name, and two landmarks with the same name fail axe (`landmark-unique`) whenever a toast is on screen. This recipe uses "Email alerts".

## Code

<!-- recipe-source:start -->

```tsx
import { useState } from 'react';
import {
  AppShell,
  AppShellNavToggle,
  Button,
  Card,
  hotkeyKeys,
  Kbd,
  Radio,
  RadioGroup,
  Select,
  Sidebar,
  Stack,
  Switch,
  toast,
  TopBar,
  useHotkeys,
} from 'loui-ds';

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
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/SettingsPage/SettingsPage.test.tsx` (landmarks and a single primary action, save with the button and with the shortcut, the shortcut listed in the help, Space on a switch, axe) and the `Recipes/SettingsPage` stories.

The axe checks skip the `Kbd` inside the primary button: it keeps its own light text color on the light button fill (2.13:1). That is a component issue, not a property of the recipe; see the report.
