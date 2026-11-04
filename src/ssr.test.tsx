// @vitest-environment node
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

/**
 * SSR smoke test (TEST-008, ADR-0009): every component exported from `loui-ds` and
 * `loui-ds/patterns` imports in Node (no `window`, no `document`) and renders to a string
 * inside `DSProvider` without throwing.
 *
 * It runs in the node-environment `unit` project. CSS Modules resolve to class-name proxies
 * there, so no browser is needed; the point is to catch `window`/`document` access at import
 * or render time, which a browser test can never see.
 *
 * Every exported component needs an entry in `CASES` (a minimal valid instance) or in
 * `PARTS` (a sub-component that is rendered inside a parent's case). A new export without
 * either fails the "covers every export" test, so this list cannot rot silently.
 */

const core = await import('./index');
const patterns = await import('./patterns/index');

const { DSProvider } = core;
const {
  Accordion,
  ActionList,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  AddCard,
  Card,
  CardLink,
  Chart,
  Checkbox,
  CommandPalette,
  CheckboxGroup,
  ChoiceTiles,
  Combobox,
  ConfirmDialog,
  CurrencyInput,
  DataTable,
  DatePicker,
  Description,
  Dialog,
  DueIndicator,
  EmptyState,
  ErrorText,
  FieldError,
  FieldMessages,
  FileUpload,
  Icon,
  IconButton,
  InlineConfirm,
  Input,
  ColorField,
  Kbd,
  Label,
  Link,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  Meter,
  MoreActionsMenu,
  NavItem,
  NumberField,
  Pagination,
  Popover,
  Progress,
  ProportionBar,
  Radio,
  RadioGroup,
  RankList,
  Rating,
  RequiredMark,
  SearchInput,
  SegmentedControl,
  Select,
  Sheet,
  Sidebar,
  Skeleton,
  SkipLink,
  Slider,
  Spinner,
  StatCard,
  StatusSteps,
  SubMenu,
  SuggestionChip,
  Swatch,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TagGroup,
  ShortcutsHelp,
  Textarea,
  ToastRegion,
  Tooltip,
  TopBar,
  VisuallyHidden,
  HotkeyProvider,
  AppShell,
  AppShellNavToggle,
  Code,
  Container,
  Divider,
  FieldSet,
  Form,
  FormErrorSummary,
  Grid,
  SplitLayout,
  Heading,
  Inline,
  ScrollArea,
  Stack,
  Text,
  DonutMeter,
  Sparkline,
  TagInput,
  Toggle,
  ToggleGroup,
  Banner,
  Timeline,
  Drawer,
  Tour,
  Stepper,
  StackedBar,
  Legend,
} = core;
const {
  AgentCard,
  ApprovalCard,
  ChatPanel,
  ColorOption,
  ColorOptionGroup,
  LedgerList,
  MatrixGrid,
  ResponseFeedback,
  SourceList,
  Citation,
  ToolCallStep,
  ToolCallList,
} = patterns;

const trigger = <Button>Open</Button>;

/** Minimal valid instances. Open overlays render their content in a portal, so closed is the SSR case. */
const CASES: Record<string, () => ReactElement> = {
  DonutMeter: () => <DonutMeter label="Used" value={40} />,
  Sparkline: () => <Sparkline data={[1, 2, 3]} aria-label="Trend" />,
  TagInput: () => <TagInput label="Tags" defaultValue={['a']} name="t" />,
  Toggle: () => <Toggle>Bold</Toggle>,
  ToggleGroup: () => (
    <ToggleGroup aria-label="Formatting">
      <Toggle id="b">Bold</Toggle>
    </ToggleGroup>
  ),
  AppShell: () => (
    <AppShell
      topBar={
        <header>
          <AppShellNavToggle />
        </header>
      }
      sidebar={<aside>nav</aside>}
      detail="d"
    >
      x
    </AppShell>
  ),
  Code: () => (
    <>
      <Code>x</Code>
      <Code variant="block">x</Code>
    </>
  ),
  Container: () => <Container>x</Container>,
  Divider: () => <Divider />,
  FieldSet: () => <FieldSet legend="L">x</FieldSet>,
  Form: () => (
    <Form errorSummary>
      <FieldSet legend="L">x</FieldSet>
      <FormErrorSummary />
    </Form>
  ),
  Grid: () => <Grid columns={2}>x</Grid>,
  SplitLayout: () => (
    <SplitLayout aside={<p>Panel</p>} asideLabel="Assistant" sticky>
      x
    </SplitLayout>
  ),
  Heading: () => <Heading>x</Heading>,
  Inline: () => <Inline>x</Inline>,
  ScrollArea: () => <ScrollArea aria-label="Area">x</ScrollArea>,
  Stack: () => <Stack gap={2}>x</Stack>,
  Text: () => <Text>x</Text>,
  ErrorText: () => <ErrorText>Choose at least one colour.</ErrorText>,
  CommandPalette: () => (
    <CommandPalette commands={[{ id: 'a', label: 'Alpha', onAction: () => undefined }]} />
  ),
  HotkeyProvider: () => (
    <HotkeyProvider>
      <ShortcutsHelp />
    </HotkeyProvider>
  ),
  ShortcutsHelp: () => <ShortcutsHelp />,
  Accordion: () => (
    <Accordion items={[{ value: 'a', title: 'Shipping', content: <p>Details</p> }]} />
  ),
  ActionList: () => (
    <ActionList aria-label="Orders" items={[{ id: '1', title: 'Order ORD-1001' }]} />
  ),
  Alert: () => <Alert title="Saved">The order was saved.</Alert>,
  Banner: () => (
    <Banner tone="warning" title="Trial ends in 3 days" onDismiss={() => undefined}>
      Choose a plan to keep your data.
    </Banner>
  ),
  Stepper: () => (
    <Stepper
      aria-label="Setup progress"
      steps={[
        { id: 'a', label: 'Basics' },
        { id: 'b', label: 'Source' },
        { id: 'c', label: 'Review' },
      ]}
      current={1}
      onStepPress={() => undefined}
    />
  ),
  Timeline: () => (
    <Timeline
      aria-label="History"
      timeZone="UTC"
      items={[
        { id: 'a', time: '2026-10-28T09:15:00Z', title: 'Request created', actor: 'Ana Costa' },
        { id: 'b', time: '2026-10-31T16:05:00Z', title: 'Request approved', tone: 'success' },
      ]}
    />
  ),
  Drawer: () => <Drawer title="Filters" />,
  Tour: () => <Tour steps={[]} />,
  StackedBar: () => (
    <StackedBar
      aria-label="Orders"
      series={[
        { id: 'a', label: 'Online' },
        { id: 'b', label: 'Store' },
      ]}
      data={[{ label: 'Q1', values: { a: 4, b: 3 } }]}
    />
  ),
  Legend: () => <Legend items={[{ id: 'a', label: 'Online' }]} />,
  ResponseFeedback: () => <ResponseFeedback />,
  SourceList: () => <SourceList id="s" sources={[{ id: 'a', title: 'Order lifecycle' }]} />,
  Citation: () => <Citation number={1} title="Order lifecycle" listId="s" sourceId="a" />,
  ToolCallStep: () => <ToolCallStep name="search_orders" status="succeeded" />,
  ToolCallList: () => (
    <ToolCallList steps={[{ stepId: 'a', name: 'search_orders', status: 'running' }]} />
  ),
  Avatar: () => <Avatar name="Ana Lima" />,
  Badge: () => <Badge>Paid</Badge>,
  Breadcrumb: () => (
    <Breadcrumb items={[{ label: 'Orders', href: '/orders' }, { label: 'ORD-1' }]} />
  ),
  Button: () => <Button>Create order</Button>,
  Calendar: () => <Calendar aria-label="Delivery date" defaultValue="2026-10-15" />,
  AddCard: () => <AddCard onPress={() => undefined}>Create agent</AddCard>,
  CardLink: () => <CardLink title="Billing" description="Plans and invoices" href="/billing" />,
  Card: () => <Card title="Summary">Content</Card>,
  Chart: () => (
    <Chart
      aria-label="Sales"
      data={[
        { label: 'Mon', value: 10 },
        { label: 'Tue', value: 20 },
      ]}
    />
  ),
  Checkbox: () => <Checkbox label="Remember me" />,
  CheckboxGroup: () => (
    <CheckboxGroup label="Notify me">
      <Checkbox value="email" label="Email" />
    </CheckboxGroup>
  ),
  ChoiceTiles: () => (
    <ChoiceTiles
      aria-label="Delivery"
      options={[
        { value: 'pickup', label: 'Pick up' },
        { value: 'standard', label: 'Standard' },
      ]}
    />
  ),
  Combobox: () => <Combobox label="Customer" options={[{ value: 'a', label: 'Alfa' }]} />,
  ConfirmDialog: () => (
    <ConfirmDialog
      trigger={trigger}
      title="Delete order #1048?"
      description="The order will be removed."
      confirmLabel="Delete order"
      onConfirm={() => undefined}
    />
  ),
  CurrencyInput: () => <CurrencyInput label="Price" currency="USD" defaultValue={1240} />,
  DataTable: () => (
    <DataTable
      aria-label="Orders"
      columns={[{ key: 'id', label: 'Order' }]}
      rows={[{ id: 'ORD-1001' }]}
      rowKey="id"
    />
  ),
  DatePicker: () => <DatePicker label="Delivery date" defaultValue="2026-10-15" />,
  Dialog: () => <Dialog trigger={trigger} title="Edit customer" />,
  DueIndicator: () => <DueIndicator date="2026-10-15" today="2026-10-31" />,
  EmptyState: () => <EmptyState title="No orders found" />,
  FileUpload: () => <FileUpload label="Attachments" />,
  Icon: () => <Icon icon={core.CheckIcon} />,
  IconButton: () => <IconButton label="Close" icon={core.CheckIcon} />,
  InlineConfirm: () => <InlineConfirm label="Delete" onConfirm={() => undefined} />,
  Input: () => <Input label="Name" />,
  ColorField: () => <ColorField label="Colour" defaultValue="#336699" />,
  Kbd: () => <Kbd>Ctrl+K</Kbd>,
  Link: () => <Link href="/orders">Orders</Link>,
  Menu: () => (
    <Menu trigger={trigger}>
      <MenuItem id="edit">Edit order</MenuItem>
    </Menu>
  ),
  Meter: () => <Meter aria-label="Stock" value={40} />,
  MoreActionsMenu: () => (
    <MoreActionsMenu>
      <MenuItem id="edit">Edit order</MenuItem>
    </MoreActionsMenu>
  ),
  NavItem: () => <NavItem href="/orders">Orders</NavItem>,
  NumberField: () => <NumberField label="Quantity" defaultValue={2} />,
  Pagination: () => <Pagination pageCount={3} defaultPage={1} />,
  Popover: () => (
    <Popover trigger={trigger} label="Filters">
      <p>Content</p>
    </Popover>
  ),
  Progress: () => <Progress aria-label="Upload" value={40} />,
  ProportionBar: () => (
    <ProportionBar
      label="Payments"
      segments={[
        { label: 'Pix', value: 3 },
        { label: 'Cash', value: 1 },
      ]}
    />
  ),
  RadioGroup: () => (
    <RadioGroup label="Size">
      <Radio value="s" label="Small" />
    </RadioGroup>
  ),
  RankList: () => <RankList items={[{ label: 'Notebook', value: 10, swatch: '#c9b79c' }]} />,
  Rating: () => <Rating value={3.5} />,
  SearchInput: () => <SearchInput aria-label="Search orders" />,
  SegmentedControl: () => (
    <SegmentedControl
      aria-label="View"
      options={[
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
      ]}
    />
  ),
  Select: () => <Select label="Region" options={[{ value: 'sp', label: 'Sao Paulo' }]} />,
  Sheet: () => <Sheet trigger={trigger} title="Order" />,
  Sidebar: () => (
    <Sidebar
      aria-label="Main"
      workspace={{ name: 'Northwind' }}
      sections={[{ id: 'work', title: 'Work', items: [{ value: 'orders', label: 'Orders' }] }]}
    />
  ),
  Skeleton: () => <Skeleton />,
  SkipLink: () => <SkipLink />,
  Slider: () => <Slider aria-label="Volume" defaultValue={20} />,
  Spinner: () => <Spinner />,
  StatCard: () => <StatCard label="Sold" value="$37,655.30" />,
  StatusSteps: () => (
    <StatusSteps
      aria-label="Order status"
      current={1}
      steps={[
        { id: 'draft', label: 'Draft' },
        { id: 'packed', label: 'Packed' },
      ]}
    />
  ),
  SuggestionChip: () => <SuggestionChip>Show unpaid orders</SuggestionChip>,
  Swatch: () => <Swatch color="#1f3a93" label="Navy" />,
  Switch: () => <Switch label="Notifications" />,
  Tabs: () => (
    <Tabs>
      <TabList aria-label="Order sections">
        <Tab id="details">Details</Tab>
      </TabList>
      <TabPanel id="details">Panel</TabPanel>
    </Tabs>
  ),
  TagGroup: () => (
    <TagGroup aria-label="Labels">
      <Tag id="vip">VIP</Tag>
    </TagGroup>
  ),
  Textarea: () => <Textarea label="Notes" />,
  ToastRegion: () => <ToastRegion />,
  Tooltip: () => (
    <Tooltip content="Create a new order">
      <Button>New order</Button>
    </Tooltip>
  ),
  TopBar: () => <TopBar title="Orders" />,
  VisuallyHidden: () => <VisuallyHidden>Close dialog</VisuallyHidden>,
  // Patterns (`loui-ds/patterns`)
  AgentCard: () => <AgentCard name="Marketplace agent" />,
  ApprovalCard: () => <ApprovalCard message="Where is my order?" />,
  ChatPanel: () => (
    <ChatPanel items={[{ id: '1', role: 'user', content: 'Hello' }]} onSend={() => undefined} />
  ),
  ColorOption: () => <ColorOption color="#1f3a93" label="Navy" />,
  ColorOptionGroup: () => (
    <ColorOptionGroup label="Colours" defaultValue={['navy']}>
      <ColorOption id="navy" color="#1f3a93" label="Navy" />
    </ColorOptionGroup>
  ),
  LedgerList: () => (
    <LedgerList
      entries={[{ id: '1', date: '2026-03-01', title: 'Opening balance', delta: 11000 }]}
    />
  ),
  MatrixGrid: () => (
    <MatrixGrid
      aria-label="Product colors"
      rows={[{ id: 'a', label: 'Backpack' }]}
      columns={[{ id: 'navy', label: 'Navy' }]}
      isLinked={() => false}
      onToggle={() => undefined}
    />
  ),
};

/** Exported parts that only make sense inside a parent; the parent's case renders them. */
const PARTS: Record<string, string> = {
  Tab: 'Tabs',
  TabList: 'Tabs',
  TabPanel: 'Tabs',
  MenuItem: 'Menu',
  MenuSection: 'Menu',
  MenuSeparator: 'Menu',
  SubMenu: 'Menu',
  Radio: 'RadioGroup',
  Tag: 'TagGroup',
  Description: 'Input',
  FieldError: 'Input',
  FieldMessages: 'Input',
  Label: 'Input',
  RequiredMark: 'Input',
  DSProvider: 'every case (the wrapper)',
  AppShellNavToggle: 'AppShell',
  FormErrorSummary: 'Form',
  HotkeyRegistry: 'HotkeyProvider (store class, not a component)',
};

/** Components that render no markup until opened (an empty string is correct for them). */
const RENDERS_NOTHING_WHEN_CLOSED = new Set([
  'ToastRegion',
  'CommandPalette',
  'ShortcutsHelp',
  'HotkeyProvider',
  'Drawer',
  'Tour',
]);

function exportedComponents(module: Record<string, unknown>): string[] {
  return Object.entries(module)
    .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function')
    .map(([name]) => name)
    .sort();
}

const all = [...exportedComponents(core), ...exportedComponents(patterns)];

describe('SSR smoke test (TEST-008)', () => {
  it('imports both entry points without a window or a document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(all.length).toBeGreaterThan(60);
  });

  it('covers every exported component with a case or a parent', () => {
    const uncovered = all.filter((name) => !(name in CASES) && !(name in PARTS));
    expect(
      uncovered,
      `Add a minimal instance to CASES (src/ssr.test.tsx): ${uncovered.join(', ')}`,
    ).toEqual([]);
    const stale = Object.keys(CASES).filter((name) => !all.includes(name));
    expect(stale, `Remove from CASES, no longer exported: ${stale.join(', ')}`).toEqual([]);
  });

  it.each(Object.entries(CASES))('renders %s to a string', (name, make) => {
    const html = renderToString(<DSProvider>{make()}</DSProvider>);
    // Closed overlays render nothing until opened; everything else must produce markup.
    if (!RENDERS_NOTHING_WHEN_CLOSED.has(name))
      expect(html.length, `${name} rendered nothing`).toBeGreaterThan(0);
  });

  it('renders every part inside its parent', () => {
    const html = renderToString(
      <DSProvider>
        <Menu trigger={trigger} defaultOpen={false}>
          <MenuSection title="Order">
            <MenuItem id="edit">Edit order</MenuItem>
          </MenuSection>
          <MenuSeparator />
          <SubMenu label="Move to…">
            <MenuItem id="a">Archive</MenuItem>
          </SubMenu>
        </Menu>
        <Label>Name</Label>
        <Description>Shown on invoices.</Description>
        <FieldError>Enter a name.</FieldError>
        <RequiredMark />
        <FieldMessages description="Shown on invoices." />
      </DSProvider>,
    );
    expect(html).toContain('Name');
  });
});
