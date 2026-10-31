/**
 * Storybook-only building blocks for the Foundations pages. The prose lives in
 * `docs/foundations/*.md` (the same files that feed `llms-full.txt`); `FoundationDoc` renders it
 * and drops live examples where the text has a `<!-- demo:name -->` marker. Not exported from
 * the package. Examples use real design-system components; the few classes here only frame them.
 */
import { Markdown, Unstyled } from '@storybook/addon-docs/blocks';
import type { ReactNode } from 'react';
import { DSProvider } from '../providers/DSProvider';
import { XIcon, CheckIcon } from '../components/Icon/icons';
import { Icon } from '../components/Icon';
import { Text } from '../components/Text';
import styles from './FoundationDocs.module.css';

const MARKER = /^<!--\s*demo:([a-z0-9-]+)\s*-->\s*$/gm;

/** Storybook doc ids of the foundations pages, by the file name in `docs/foundations/`. */
const PAGE_IDS: Record<string, string> = {
  color: 'foundations-color',
  typography: 'foundations-typography',
  spacing: 'foundations-spacing-sizing-and-radius',
  states: 'foundations-states-and-interaction',
  motion: 'foundations-motion-layering-and-iconography',
};

/** Rewrites guide links (`../guides/principles.md`) and foundation links (`./color.md`) to Storybook docs links. */
export function foundationLinks(markdown: string): string {
  return markdown
    .replace(
      /\]\(\.\.\/guides\/([a-z-]+)\.md\)/g,
      (_m, slug: string) => `](?path=/docs/guides-${slug}--docs)`,
    )
    .replace(
      /\]\(\.\/([a-z-]+)\.md\)/g,
      (_m, slug: string) => `](?path=/docs/${PAGE_IDS[slug] ?? slug}--docs)`,
    );
}

/**
 * Renders a foundations page: Markdown chunks with live demos between them.
 * `demos` maps the marker name to the element to render there.
 */
export function FoundationDoc({
  source,
  demos = {},
}: {
  source: string;
  demos?: Record<string, ReactNode>;
}) {
  const text = foundationLinks(source);
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKER)) {
    const index = match.index;
    const chunk = text.slice(last, index).trim();
    if (chunk) parts.push(<Markdown key={`md-${String(index)}`}>{chunk}</Markdown>);
    const name = match[1] ?? '';
    const demo = demos[name];
    if (demo === undefined) throw new Error(`Foundations: no demo named "${name}"`);
    parts.push(<div key={`demo-${name}`}>{demo}</div>);
    last = index + match[0].length;
  }
  const rest = text.slice(last).trim();
  if (rest) parts.push(<Markdown key="md-end">{rest}</Markdown>);
  return <>{parts}</>;
}

/** A framed live example on the page background, with a small caption. */
export function Demo({
  caption,
  layer = 'bg',
  children,
}: {
  caption?: string;
  /** Surface the example sits on. */
  layer?: 'canvas' | 'bg' | 'surface' | 'raised';
  children: ReactNode;
}) {
  return (
    <Unstyled>
      <DSProvider>
        <figure className={styles.demo} data-layer={layer}>
          <div className={styles.stage}>{children}</div>
          {caption ? (
            <figcaption className={styles.caption}>
              <Text size="meta" tone="tertiary" mono>
                {caption}
              </Text>
            </figcaption>
          ) : null}
        </figure>
      </DSProvider>
    </Unstyled>
  );
}

/** Labelled group of examples laid out in a wrapping row. */
export function Row({ children, gap = 'md' }: { children: ReactNode; gap?: 'md' | 'lg' }) {
  return (
    <div className={styles.row} data-gap={gap}>
      {children}
    </div>
  );
}

/** One do or don't example: a verdict (always text and an icon, never color alone), the example and a reason. */
export function Verdict({
  kind,
  note,
  children,
  layer = 'bg',
}: {
  kind: 'do' | 'dont';
  note: ReactNode;
  children: ReactNode;
  layer?: 'canvas' | 'bg' | 'surface' | 'raised';
}) {
  return (
    <div className={styles.verdict} data-kind={kind}>
      <div className={styles.verdictHead}>
        <Icon icon={kind === 'do' ? CheckIcon : XIcon} size="sm" />
        <span>{kind === 'do' ? 'Do' : "Don't"}</span>
      </div>
      <div className={styles.verdictStage} data-layer={layer}>
        {children}
      </div>
      <div className={styles.verdictNote}>
        <Text size="small" tone="secondary" as="p">
          {note}
        </Text>
      </div>
    </div>
  );
}

/** Do and don't side by side. */
export function DoDont({ children }: { children: ReactNode }) {
  return (
    <Unstyled>
      <DSProvider>
        <div className={styles.doDont}>{children}</div>
      </DSProvider>
    </Unstyled>
  );
}

/** A box painted with a layer token, used to build the layer stack and the do/don't examples. */
export function Layer({
  layer,
  children,
  className,
}: {
  layer: 'canvas' | 'bg' | 'surface' | 'raised' | 'hover';
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.layer, className].filter(Boolean).join(' ')} data-layer={layer}>
      {children}
    </div>
  );
}

/** The five layers nested from the page canvas up to the hover state. */
export function LayerStack() {
  return (
    <Unstyled>
      <div className={styles.stack}>
        <Layer layer="canvas">
          <Text size="meta" tone="secondary" mono>
            --ds-bg-canvas
          </Text>
          <Layer layer="bg">
            <Text size="meta" tone="secondary" mono>
              --ds-bg
            </Text>
            <Layer layer="surface">
              <Text size="meta" tone="secondary" mono>
                --ds-surface
              </Text>
              <Layer layer="raised">
                <Text size="meta" tone="secondary" mono>
                  --ds-surface-raised
                </Text>
                <Layer layer="hover">
                  <Text size="meta" tone="secondary" mono>
                    --ds-surface-hover
                  </Text>
                </Layer>
              </Layer>
            </Layer>
          </Layer>
        </Layer>
      </div>
    </Unstyled>
  );
}

/** The three line weights drawn as 1px borders on a surface. */
export function LineSamples() {
  return (
    <Unstyled>
      <div className={styles.lines}>
        {(
          [
            ['subtle', '--ds-line-subtle', 'Row separators inside a card or table'],
            ['default', '--ds-line', 'Card and container borders'],
            ['strong', '--ds-line-strong', 'Menus, popovers, dialogs'],
            ['control', '--ds-line-control', 'Input, select, checkbox and radio boundaries'],
          ] as const
        ).map(([kind, variable, use]) => (
          <div key={kind} className={styles.lineSample} data-line={kind}>
            <Text size="label" as="div">
              {kind}
            </Text>
            <Text size="meta" tone="secondary" mono as="div">
              {variable}
            </Text>
            <Text size="small" tone="secondary" as="div">
              {use}
            </Text>
          </div>
        ))}
      </div>
    </Unstyled>
  );
}

/** Signal colors shown the only acceptable way: next to the text that says what they mean. */
export function SignalSamples() {
  return (
    <Unstyled>
      <div className={styles.signals}>
        {(
          [
            ['accent', 'Selected', 'Focus, selection, links, open states'],
            ['success', 'Saved', 'Done, saved, healthy'],
            ['warning', 'Overdue in 2 days', 'Attention needed, nothing broken'],
            ['danger', 'Payment failed', 'Errors and destructive actions'],
          ] as const
        ).map(([tone, label, use]) => (
          <div key={tone} className={styles.signal} data-tone={tone}>
            <span className={styles.signalLabel}>{label}</span>
            <Text size="meta" tone="secondary" mono as="div">
              --ds-{tone} / --ds-{tone}-soft
            </Text>
            <Text size="small" tone="secondary" as="div">
              {use}
            </Text>
          </div>
        ))}
      </div>
    </Unstyled>
  );
}
