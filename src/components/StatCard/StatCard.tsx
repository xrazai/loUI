import { useEffect } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { isDev } from '../../utils/env';
import { formatPercent } from '../../utils/number';
import { Icon } from '../Icon';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from '../Icon/icons';
import { messages } from './StatCard.messages';
import styles from './StatCard.module.css';

export type StatCardSize = 'md' | 'lg';
export type StatCardTone = 'neutral' | 'success' | 'warning' | 'danger';
export type StatCardNoteTone = StatCardTone;

/** A change versus a previous period, rendered as text ("Up 12%") plus an arrow. */
export interface StatCardTrend {
  /** `up`, `down` or `flat`. Written out as text, never only shown by the arrow or the color. */
  direction: 'up' | 'down' | 'flat';
  /**
   * Size of the change as a ratio: `0.12` is 12%. Pass the absolute size; `direction` says which
   * way. Ignored for `flat`.
   */
  value?: number;
  /**
   * Color of the trend. Default: `success` for up, `danger` for down, `neutral` for flat. Set it
   * when up is bad (costs, returns).
   */
  tone?: StatCardTone;
  /** What the change is compared to: "vs previous 30 days". Plain text after the trend. */
  comparedTo?: string;
}

interface StatCardBaseProps extends Omit<ComponentPropsWithRef<'dl'>, 'children' | 'title'> {
  /** What the number is, in a few words: "Sold", "Overdue". Shown as a mono caption (uppercase by CSS) and used as the term of the card. */
  label: ReactNode;
  /** The number or amount. Format it with `formatCurrency` or `formatNumber` for the active locale. */
  value: ReactNode;
  /** `md` (default, 24px) or `lg` (30px). */
  size?: StatCardSize;
  /** Short mono text at the end of the label row: "42%". Read after the value. */
  aside?: ReactNode;
  /** Content between the value and the note, for example a 4px `ProportionBar`. */
  children?: ReactNode;
  /** Color of the note text. Default `neutral`. Only affects color: the note is text anyway. */
  noteTone?: StatCardNoteTone;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/** A neutral card needs no explanation; the other tones must be explained in words. */
type StatCardTonality =
  | {
      /** Color of the value. Use `danger` or `warning` only when the number asks for action, `success` when everything is fine. Default `neutral`. */
      tone?: 'neutral';
      /** Context or change in words: "3 sales · average ticket $120". */
      note?: ReactNode;
      /** A change versus a previous period, rendered as text through the messages. */
      trend?: StatCardTrend;
    }
  | {
      /** A colored value must be backed by text: pass `note` or `trend` (type error otherwise). */
      tone: Exclude<StatCardTone, 'neutral'>;
      note: ReactNode;
      trend?: StatCardTrend;
    }
  | {
      tone: Exclude<StatCardTone, 'neutral'>;
      note?: ReactNode;
      trend: StatCardTrend;
    };

export type StatCardProps = StatCardBaseProps & StatCardTonality;

/** Tones already reported, so the warning shows once per tone. */
const warnedTones = new Set<string>();

const DEFAULT_TREND_TONE = { up: 'success', down: 'danger', flat: 'neutral' } as const;
const TREND_ICON = { up: ArrowUpIcon, down: ArrowDownIcon, flat: MinusIcon } as const;

/**
 * An indicator card: a mono caption, a large mono number and a short note, optionally with a
 * trend and a small visual (such as a `ProportionBar`) in between.
 *
 * It is a description list: the label is the term, the value and the note are its
 * descriptions, so a screen reader announces "Sold, $37,655.30, Up 12% vs previous 30 days".
 * A colored value is never the only signal: `tone` other than `neutral` requires a `note` or a
 * `trend`, and the trend is written as text ("Up 12%").
 */
export function StatCard({
  label,
  value,
  size = 'md',
  tone = 'neutral',
  aside,
  children,
  note,
  noteTone = 'neutral',
  trend,
  messages: overrides,
  className,
  ...rest
}: StatCardProps) {
  const locale = useDSLocale();
  const t = useMessages('StatCard', messages, overrides);

  const unbacked = tone !== 'neutral' && !note && !trend;
  useEffect(() => {
    if (unbacked && isDev() && !warnedTones.has(tone)) {
      warnedTones.add(tone);
      console.warn(
        `[loui-ds] StatCard: tone "${tone}" has no text to back it. Pass a note or a trend so the meaning does not depend on color.`,
      );
    }
  }, [unbacked, tone]);

  let trendText: string | null = null;
  if (trend) {
    trendText =
      trend.direction === 'flat'
        ? t.trendFlat
        : (trend.direction === 'up' ? t.trendUp : t.trendDown)(
            formatPercent(Math.abs(trend.value ?? 0), locale, { maximumFractionDigits: 1 }),
          );
  }
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;
  const hasNote = Boolean(note) || trend !== undefined;

  return (
    <dl {...rest} className={classNames(styles.root, className)} data-size={size} data-tone={tone}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
      {aside ? <dd className={styles.aside}>{aside}</dd> : null}
      {children ? <dd className={styles.content}>{children}</dd> : null}
      {hasNote ? (
        <dd className={styles.note} data-tone={noteTone}>
          {trend && trendText && TrendIcon ? (
            <span
              className={styles.trend}
              data-tone={trend.tone ?? DEFAULT_TREND_TONE[trend.direction]}
            >
              <Icon icon={TrendIcon} size="sm" />
              {trendText}
              {trend.comparedTo ? (
                <span className={styles.comparison}> {trend.comparedTo}</span>
              ) : null}
            </span>
          ) : null}
          {note}
        </dd>
      ) : null}
    </dl>
  );
}
