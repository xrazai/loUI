import { Fragment, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../components/Button';
import type { ButtonVariant } from '../components/Button';
import { Card } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { DataTable } from '../components/DataTable';
import { orderColumns, orders } from '../components/DataTable/DataTable.fixtures';
import { Heading } from '../components/Heading';
import { Input } from '../components/Input';
import { Switch } from '../components/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../components/Tabs';
import { Text } from '../components/Text';
import { ValueTable } from '../tokens/docs/TokenDocs';
import { Demo } from './FoundationDocs';
import styles from './FoundationDocs.module.css';

/**
 * React Aria components expose interaction state as data attributes (`data-hovered`,
 * `data-focus-visible`). The docs page freezes a state by setting that attribute on the rendered
 * element after mount, so the real component CSS paints it. Real users get the same styles from
 * real hover and focus.
 */
type Frozen = { attribute?: string; props?: { isDisabled?: true; isPending?: true } };
const FROZEN: Record<string, Frozen> = {
  rest: {},
  hover: { attribute: 'data-hovered' },
  focus: { attribute: 'data-focus-visible' },
  disabled: { props: { isDisabled: true } },
  pending: { props: { isPending: true } },
};
const STATES = Object.keys(FROZEN);
const VARIANTS: [ButtonVariant, string][] = [
  ['primary', 'Create order'],
  ['secondary', 'Export'],
  ['ghost', 'Cancel'],
  ['danger', 'Delete'],
];

function FrozenState({
  attribute,
  children,
}: {
  attribute?: string | undefined;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (attribute) ref.current?.firstElementChild?.setAttribute(attribute, 'true');
  }, [attribute]);
  return <div ref={ref}>{children}</div>;
}

function StateMatrix() {
  return (
    <Demo caption="Frozen states of the four button variants (hover and focus are set on the element; the CSS is the real one). Pressed looks like hover: there is no press animation.">
      <div className={styles.stateGrid}>
        <span />
        {STATES.map((state) => (
          <Text key={state} size="caption" tone="secondary" className={styles.stateHead}>
            {state}
          </Text>
        ))}
        {VARIANTS.map(([variant, label]) => (
          <Fragment key={variant}>
            <Text size="meta" tone="secondary" mono>
              {variant}
            </Text>
            {STATES.map((state) => (
              <FrozenState key={`${variant}-${state}`} attribute={FROZEN[state]?.attribute}>
                <Button variant={variant} {...FROZEN[state]?.props}>
                  {label}
                </Button>
              </FrozenState>
            ))}
          </Fragment>
        ))}
      </div>
    </Demo>
  );
}

export const statesDemos = {
  'state-matrix': <StateMatrix />,
  fields: (
    <Demo caption="Rest, invalid and disabled. Tab into any field to see the focus ring.">
      <div className={styles.row} data-gap="lg">
        <Input label="Customer" defaultValue="Zeta Supplies" />
        <Input
          label="Email"
          defaultValue="zeta@"
          isInvalid
          errorMessage="Enter a complete email address."
        />
        <Input label="Code" defaultValue="ORD-1048" isDisabled mono />
      </div>
    </Demo>
  ),
  selection: (
    <Demo caption="Unchecked, checked, mixed, invalid and disabled. A switch shows state with its position as well as color.">
      <div className={styles.row} data-gap="lg">
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultSelected />
        <Checkbox label="Mixed" isIndeterminate />
        <Checkbox label="Invalid" isInvalid />
        <Checkbox label="Disabled" isDisabled defaultSelected />
        <Switch label="Notifications" defaultSelected />
      </div>
    </Demo>
  ),
  'tabs-rows': (
    <Demo caption="Active tab: ink underline. Selected row: raised background and ink bar. Hover a row for the row-hover surface.">
      <div className={styles.col}>
        <Tabs defaultSelectedKey="items">
          <TabList aria-label="Order sections">
            <Tab id="details">Details</Tab>
            <Tab id="items">Items</Tab>
            <Tab id="history">History</Tab>
          </TabList>
          <TabPanel id="details">Customer and address.</TabPanel>
          <TabPanel id="items">Items on this order.</TabPanel>
          <TabPanel id="history">Every change made to the order.</TabPanel>
        </Tabs>
        <div className={styles.tableWrap}>
          <DataTable
            aria-label="Orders"
            columns={orderColumns}
            rows={orders.slice(0, 4)}
            selectionMode="multiple"
            defaultSelectedKeys={new Set(['ORD-1002'])}
          />
        </div>
      </div>
    </Demo>
  ),
  'focus-tokens': <ValueTable prefixes={['focus-ring']} />,
  confirm: (
    <Demo caption="Illustration of the destructive confirmation (the real one is a Dialog with initial focus on Cancel).">
      <div className={`${styles.col} ${styles.tableWrap}`}>
        <Card title="Delete order ORD-1048?">
          <Text as="p" tone="secondary" size="small">
            The order and its 3 items will be removed. This can&apos;t be undone.
          </Text>
          <div className={styles.row}>
            <Button variant="secondary">Cancel</Button>
            <Button variant="danger-solid">Delete order</Button>
          </div>
        </Card>
        <Text size="small" tone="secondary" as="p">
          Reversible actions skip the dialog and offer Undo in a toast instead: &quot;Order ORD-1048
          marked as shipped. Undo&quot;.
        </Text>
      </div>
    </Demo>
  ),
  wordmark: (
    <Demo caption="Geist 600, sentence case. No logo, no symbol.">
      <Heading level={2} size="title">
        Loui DS
      </Heading>
    </Demo>
  ),
};
