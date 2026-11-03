import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from '../Icon/icons';
import { Icon } from '../Icon';
import type { IconComponent } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';
import { eventEpoch, formatEventTime } from './formatEventTime';
import { messages } from './Timeline.messages';
import styles from './Timeline.module.css';

export type TimelineTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type TimelineOrder = 'newest-first' | 'oldest-first' | 'as-given';

export interface TimelineItem {
  /** Stable identifier, used as the React key. */
  id: string;
  /**
   * When the event happened: an ISO 8601 date-time (`2026-10-31T14:30:00Z`), a `Date`, or a
   * date-only string (`2026-10-31`, shown as a date without a time).
   */
  time: Date | string;
  /** What happened, in one line, in the past tense ("Order shipped"). */
  title: ReactNode;
  /** Optional detail about the event. */
  description?: ReactNode;
  /**
   * Gives the event a marker: `neutral` (default, a dot), or `accent`, `success`, `warning`,
   * `danger` (an icon). The tone is also read to screen readers as text.
   */
  tone?: TimelineTone;
  /** Who or what caused the event ("Ana Costa", "Billing system"). Shown as "By Ana Costa". */
  actor?: string;
}

export interface TimelineProps extends Omit<ComponentPropsWithRef<'ol'>, 'children'> {
  /** The events. */
  items: readonly TimelineItem[];
  /**
   * Order of the list: `newest-first` (default, for dated records), `oldest-first`, or
   * `as-given` to keep the order of `items`.
   */
  order?: TimelineOrder;
  /** IANA time zone used to show date-times ("America/Sao_Paulo"). Defaults to the viewer's zone. */
  timeZone?: string;
  /** Rendered instead of the list when `items` is empty (for example an `EmptyState`). */
  empty?: ReactNode;
  /** Message overrides for this instance. */
  messages?: Partial<typeof messages.en>;
}

const ICONS: Record<Exclude<TimelineTone, 'neutral'>, IconComponent> = {
  accent: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

/**
 * A chronological list of events. It is an ordered list; each event has a `<time>`, a title, an
 * optional description, an optional actor and an optional tone marker. The marker and the line
 * are decorative: a tone is also stated as hidden text before the title.
 * Newest events come first by default, the order for dated records.
 */
export function Timeline({
  items,
  order = 'newest-first',
  timeZone,
  empty,
  messages: overrides,
  className,
  ...rest
}: TimelineProps) {
  const t = useMessages('Timeline', messages, overrides);
  const locale = useDSLocale();
  if (items.length === 0) return <>{empty ?? null}</>;
  const entries = items.map((item) => ({
    item,
    time: formatEventTime(item.time, locale, timeZone),
  }));
  if (order !== 'as-given') {
    const sign = order === 'newest-first' ? -1 : 1;
    // Array#sort is stable: events with the same time keep the order they were given in.
    entries.sort((a, b) => {
      const diff = eventEpoch(a.item.time) - eventEpoch(b.item.time);
      return Number.isNaN(diff) ? 0 : sign * diff;
    });
  }
  return (
    <ol {...rest} className={classNames(styles.root, className)}>
      {entries.map(({ item, time }) => {
        const tone = item.tone ?? 'neutral';
        return (
          <li key={item.id} className={styles.item} data-tone={tone}>
            <span className={styles.marker} aria-hidden="true">
              {tone === 'neutral' ? (
                <span className={styles.dot} />
              ) : (
                <Icon icon={ICONS[tone]} size="sm" />
              )}
            </span>
            <div className={styles.body}>
              <div className={styles.title}>
                {tone === 'neutral' ? null : <VisuallyHidden>{t[tone]} </VisuallyHidden>}
                {item.title}
              </div>
              <div className={styles.meta}>
                {item.actor ? <span>{t.actor(item.actor)}</span> : null}
                <time dateTime={time.dateTime}>{time.text}</time>
              </div>
              {item.description ? (
                <div className={styles.description}>{item.description}</div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
