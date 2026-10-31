import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { IconButton } from '../components/IconButton';
import { XIcon } from '../components/Icon/icons';
import { Input } from '../components/Input';
import { Switch } from '../components/Switch';
import { Text } from '../components/Text';
import { DimensionTable, ShadowTable } from '../tokens/docs/TokenDocs';
import { Demo } from './FoundationDocs';
import styles from './FoundationDocs.module.css';

const steps = [
  ['1', styles.gap1],
  ['2', styles.gap2],
  ['3', styles.gap3],
  ['4', styles.gap4],
  ['5', styles.gap5],
  ['6', styles.gap6],
  ['8', styles.gap8],
  ['12', styles.gap12],
  ['16', styles.gap16],
] as const;

export const spacingDemos = {
  space: (
    <>
      <Demo caption="Each square is one step of the scale, from space-1 (4px) to space-16 (64px).">
        <div className={styles.spaceBlocks}>
          {steps.map(([step, cls]) => (
            <div key={step} className={styles.spaceBlock}>
              <span className={`${styles.spaceSquare} ${cls ?? ''}`} />
              <Text size="meta" tone="secondary" mono>
                {step}
              </Text>
            </div>
          ))}
        </div>
      </Demo>
      <DimensionTable prefix="space." />
    </>
  ),
  controls: (
    <Demo caption="sm 32px, md 40px (default), lg 48px. Buttons and inputs share the same heights.">
      <div className={styles.col}>
        <div className={styles.row}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="md" variant="primary">
            Primary
          </Button>
        </div>
        <div className={styles.row}>
          <Input label="Small" size="sm" defaultValue="32px" />
          <Input label="Medium" size="md" defaultValue="40px" />
          <Input label="Large" size="lg" defaultValue="48px" />
        </div>
      </div>
    </Demo>
  ),
  layout: (
    <Demo caption="Heights drawn to scale: item 36, row 52, dense row 60, top bar 64. The sidebar is 240 wide.">
      <div className={styles.col}>
        <div className={`${styles.sizeBar} ${styles.hItem}`}>item-h 36px</div>
        <div className={`${styles.sizeBar} ${styles.hRow}`}>row-h 52px</div>
        <div className={`${styles.sizeBar} ${styles.hRowDense}`}>row-h-dense 60px</div>
        <div className={`${styles.sizeBar} ${styles.hTopbar}`}>topbar-h 64px</div>
      </div>
    </Demo>
  ),
  target: (
    <>
      <Demo caption="The smallest icon button is 32px. The checkbox box is 18px; its whole label row is the target.">
        <div className={styles.row} data-gap="lg">
          <IconButton label="Close" icon={XIcon} variant="ghost" size="sm" />
          <Checkbox label="Include archived orders" />
        </div>
      </Demo>
      <DimensionTable prefix="size." />
    </>
  ),
  radius: (
    <>
      <Demo caption="Checkbox 5px, button 6px, badge and switch pill, then the four radius steps (4, 6, 10, pill).">
        <div className={styles.row} data-gap="lg">
          <Checkbox label="Checkbox" />
          <Button>Button</Button>
          <Badge tone="success">Paid</Badge>
          <Switch label="Switch" />
          <div className={styles.row}>
            <span className={`${styles.radiusBox} ${styles.rSm}`} />
            <span className={`${styles.radiusBox} ${styles.rMd}`} />
            <span className={`${styles.radiusBox} ${styles.rLg}`} />
            <span className={`${styles.radiusBox} ${styles.rPill}`} />
          </div>
        </div>
      </Demo>
      <DimensionTable prefix="radius." shape="box" />
    </>
  ),
  elevation: (
    <>
      <Demo caption="A flat card (surface and line), an overlay shadow and a dialog shadow.">
        <div className={styles.row} data-gap="lg">
          <Card title="Flat">Cards use surface and border, no shadow.</Card>
          <div className={`${styles.elevated} ${styles.elevatedOverlay}`}>
            <Text size="small">Overlay: menus, popovers, toasts</Text>
          </div>
          <div className={`${styles.elevated} ${styles.elevatedDialog}`}>
            <Text size="small">Dialog: modals and sheets</Text>
          </div>
        </div>
      </Demo>
      <ShadowTable />
    </>
  ),
};
