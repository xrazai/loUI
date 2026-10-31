import { Heading } from '../components/Heading';
import { Text } from '../components/Text';
import { FontFamilies, TypeScale } from '../tokens/docs/TokenDocs';
import { Demo, DoDont, Verdict } from './FoundationDocs';
import styles from './FoundationDocs.module.css';

const amounts = [
  ['ORD-1048', '$1,240.00'],
  ['ORD-1049', '$86.50'],
  ['ORD-1050', '$12,008.20'],
] as const;

export const typographyDemos = {
  families: <FontFamilies />,
  scale: <TypeScale />,
  mono: (
    <DoDont>
      <Verdict kind="do" note="Codes and amounts in mono; the sentence around them in sans.">
        <Text>
          Order <Text mono>ORD-1048</Text> totals <Text mono>$1,240.00</Text>.
        </Text>
      </Verdict>
      <Verdict kind="dont" note="Do not set prose or labels in mono.">
        <Text mono>Order is ready to ship to the customer.</Text>
      </Verdict>
    </DoDont>
  ),
  tabular: (
    <Demo caption="Left: proportional figures. Right: tabular figures, aligned by digit.">
      <div className={styles.row} data-gap="lg">
        <div className={styles.col}>
          {amounts.map(([id, amount]) => (
            <Text key={id}>{amount}</Text>
          ))}
        </div>
        <div className={styles.col}>
          {amounts.map(([id, amount]) => (
            <Text key={id} mono>
              {amount}
            </Text>
          ))}
        </div>
      </div>
    </Demo>
  ),
  components: (
    <Demo caption="Heading size and level are independent. Text sizes: body, small, label, meta, caption.">
      <div className={styles.sampleStack}>
        <Heading level={1} size="display">
          Display, level 1
        </Heading>
        <Heading level={2} size="title">
          Title, level 2
        </Heading>
        <Heading level={3}>Heading, level 3</Heading>
        <Text as="p" className={styles.measure}>
          Body text is 15px on a 24px line. It is the default size of the app and the one to reach
          for first.
        </Text>
        <Text size="small" tone="secondary" as="p">
          Small, secondary tone: descriptions and helper text.
        </Text>
        <Text size="label">Label</Text>
        <Text size="meta" tone="tertiary">
          Meta: 2026-10-31 · 12 items
        </Text>
        <Text size="caption" tone="secondary">
          Caption in sentence case
        </Text>
      </div>
    </Demo>
  ),
};
