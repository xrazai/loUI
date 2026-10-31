import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Text } from '../components/Text';
import { ColorTable } from '../tokens/docs/TokenDocs';
import { DoDont, LayerStack, LineSamples, SignalSamples, Verdict } from './FoundationDocs';
import styles from './FoundationDocs.module.css';

const SURFACES = [
  'color.bg',
  'color.surface',
  'color.surface-raised',
  'color.surface-hover',
] as const;

export const colorDemos = {
  layers: <LayerStack />,
  lines: <LineSamples />,
  'line-ratios': (
    <ColorTable
      tier="semantic"
      names={['color.line-subtle', 'color.line', 'color.line-strong', 'color.line-control']}
      backgrounds={['color.bg', 'color.surface', 'color.surface-raised']}
    />
  ),
  'text-ratios': (
    <ColorTable
      tier="semantic"
      names={['color.text', 'color.text-2', 'color.text-3']}
      backgrounds={SURFACES}
    />
  ),
  'inverse-ratios': (
    <ColorTable
      tier="semantic"
      names={['color.text-inverse']}
      backgrounds={[
        'color.accent',
        'color.success',
        'color.warning',
        'color.danger',
        'color.primary-bg',
      ]}
    />
  ),
  'signal-samples': <SignalSamples />,
  'signal-ratios': (
    <ColorTable
      tier="semantic"
      names={['color.accent', 'color.success', 'color.warning', 'color.danger']}
      backgrounds={SURFACES}
    />
  ),
  'soft-tints': (
    <ColorTable
      tier="semantic"
      names={[
        'color.accent-soft',
        'color.success-soft',
        'color.warning-soft',
        'color.danger-soft',
        'color.danger-soft-hover',
        'color.danger-line',
      ]}
    />
  ),
  paper: <ColorTable tier="semantic" paper />,
  'do-dont-accent': (
    <DoDont>
      <Verdict kind="do" note="The primary action is light ink on dark. One per screen.">
        <Button variant="primary">Create order</Button>
      </Verdict>
      <Verdict
        kind="dont"
        note="Accent is for focus, selection and links. A filled accent button competes with the primary action."
      >
        <Button variant="primary" className={styles.accentFill ?? ''}>
          Create order
        </Button>
      </Verdict>
    </DoDont>
  ),
  'do-dont-signal': (
    <DoDont>
      <Verdict kind="do" note="The status is stated in text. Color reinforces it.">
        <Badge tone="danger">Payment failed</Badge>
      </Verdict>
      <Verdict kind="dont" note="Color alone: invisible to color-blind users and screen readers.">
        <span className={styles.dotOnly} />
      </Verdict>
    </DoDont>
  ),
  'do-dont-layers': (
    <DoDont>
      <Verdict
        kind="do"
        note="A card is one step above the page: bg, then surface, then raised for what floats."
        layer="bg"
      >
        <div className={styles.card}>
          <Text size="small">Surface card on the bg layer</Text>
        </div>
      </Verdict>
      <Verdict
        kind="dont"
        note="Skipping layers (raised straight on the canvas) breaks the depth order and the contrast math."
        layer="canvas"
      >
        <div className={styles.cardRaisedOnCanvas}>
          <Text size="small">Raised card on the canvas layer</Text>
        </div>
      </Verdict>
    </DoDont>
  ),
  'do-dont-text3': (
    <DoDont>
      <Verdict
        kind="do"
        note="What the user must read is text. Metadata and hints step down to text-3."
        layer="surface"
      >
        <Text>Order ORD-1048 shipped</Text>
        <Text size="meta" tone="tertiary">
          Updated 3 minutes ago
        </Text>
      </Verdict>
      <Verdict
        kind="dont"
        note="Inverted hierarchy: the key message is in text-3 and the metadata is brighter."
        layer="surface"
      >
        <Text tone="tertiary">Order ORD-1048 shipped</Text>
        <Text size="meta">Updated 3 minutes ago</Text>
      </Verdict>
    </DoDont>
  ),
};
