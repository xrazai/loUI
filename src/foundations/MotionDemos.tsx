import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Icon } from '../components/Icon';
import { CircleAlertIcon, SearchIcon, XIcon } from '../components/Icon/icons';
import { iconNames, iconSet } from '../components/Icon/icons';
import { Spinner } from '../components/Spinner';
import { Text } from '../components/Text';
import { ValueTable } from '../tokens/docs/TokenDocs';
import { Demo, DoDont, Verdict } from './FoundationDocs';
import styles from './FoundationDocs.module.css';

const layers: [string, string][] = [
  [styles.zTooltip ?? '', 'tooltip 60'],
  [styles.zToast ?? '', 'toast 58'],
  [styles.zPopover ?? '', 'popover 55'],
  [styles.zDropdown ?? '', 'dropdown 50'],
  [styles.zDialog ?? '', 'dialog 45'],
  [styles.zSheet ?? '', 'sheet 40'],
];

type IconName = keyof typeof iconSet;
const names = Object.keys(iconSet) as IconName[];

export const motionDemos = {
  motion: (
    <>
      <Demo caption="Hover each box. Left: 150ms (state change). Right: 320ms (completion feedback). Both use --ds-ease.">
        <div className={styles.row} data-gap="lg">
          <div className={styles.motionBox}>
            <Text size="small" tone="secondary">
              150ms
            </Text>
          </div>
          <div className={`${styles.motionBox} ${styles.motionBoxDone}`}>
            <Text size="small" tone="secondary">
              320ms
            </Text>
          </div>
          <Spinner label="Loading" />
        </div>
      </Demo>
      <ValueTable prefixes={['motion.']} />
    </>
  ),
  layers: (
    <>
      <Demo caption="Six overlays stacked. DOM order is reversed on purpose: the z-index tokens alone decide who is on top.">
        <div className={styles.zStack}>
          {layers.map(([cls, label]) => (
            <div key={label} className={`${styles.zCard} ${cls}`}>
              <Text size="small" mono>
                {label}
              </Text>
            </div>
          ))}
        </div>
      </Demo>
      <ValueTable prefixes={['z.']} />
    </>
  ),
  icons: (
    <Demo caption="The curated set, rendered from the package export list (iconNames). Each icon has one documented use.">
      <div className={styles.iconGrid}>
        {names.map((name) => (
          <div key={name} className={styles.iconCell}>
            <Icon icon={iconSet[name]} size="lg" />
            <Text size="meta" mono>
              {name}
            </Text>
            <Text size="meta" tone="secondary">
              {iconNames[name]}
            </Text>
          </div>
        ))}
      </div>
    </Demo>
  ),
  'icon-usage': (
    <DoDont>
      <Verdict
        kind="do"
        note="A decorative icon beside text that names the control; or an IconButton with a required label."
      >
        <div className={styles.row}>
          <Button variant="secondary" leading={<Icon icon={SearchIcon} size="sm" />}>
            Search orders
          </Button>
          <IconButton label="Close" icon={XIcon} variant="ghost" />
        </div>
      </Verdict>
      <Verdict
        kind="dont"
        note="A status icon alone: it has no name, and its color is the only signal."
      >
        <span className={styles.dangerText}>
          <Icon icon={CircleAlertIcon} />
        </span>
      </Verdict>
    </DoDont>
  ),
};
