import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import {
  Icon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from '../Icon';
import type { IconComponent } from '../Icon';
import { IconButton } from '../IconButton';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Banner.module.css';
import { messages } from './Banner.messages';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface BannerProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'role'> {
  /** Kind of message: `info` (neutral, default), `success`, `warning` or `danger`. */
  tone?: BannerTone;
  /** Short heading in one line: what is going on. Plain text, not a document heading. */
  title?: ReactNode;
  /** The detail: why, and what to do. Keep it to one or two sentences. */
  children?: ReactNode;
  /** A single action next to the text, usually a link or a small `Button` ("Update card"). */
  action?: ReactNode;
  /** Shows a dismiss button that calls this. The banner is removed by the parent. */
  onDismiss?: () => void;
  /**
   * The banner appears while the user is working and interrupts the task, so it must be announced
   * immediately (`role="alert"`, assertive). Only for a failure the user must know about right
   * now. A banner that is on the page from the start never needs it.
   */
  urgent?: boolean;
  /**
   * Whether the banner is a live region (`role="status"`, polite). Default `false`, because a
   * banner is usually part of the page when it loads and a live region that never changes is
   * noise. Set `true` when the banner is added to the page after load (a lost connection that
   * is restored, a session that is about to expire). Ignored when `urgent`.
   */
  announce?: boolean;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

const ICONS: Record<BannerTone, IconComponent> = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

/**
 * A persistent, full-width message for a whole page or section: maintenance, a limited account,
 * an offline mode. It stays until the condition ends or the user dismisses it.
 * The icon is decorative and a visually hidden prefix names the tone for screen readers.
 */
export function Banner({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  urgent = false,
  announce = false,
  messages: overrides,
  className,
  ...rest
}: BannerProps) {
  const t = useMessages('Banner', messages, overrides);
  const role = urgent ? 'alert' : announce ? 'status' : undefined;
  const hasTitle = title !== undefined && title !== null && title !== false && title !== '';
  return (
    <div {...rest} role={role} className={classNames(styles.root, className)} data-tone={tone}>
      <Icon icon={ICONS[tone]} className={styles.icon} />
      <div className={styles.content}>
        <VisuallyHidden>{t[tone]} </VisuallyHidden>
        {hasTitle ? <span className={styles.title}>{title}</span> : null}
        {children ? <span className={styles.body}>{children}</span> : null}
      </div>
      {action || onDismiss ? (
        <div className={styles.actions}>
          {action}
          {onDismiss ? (
            <IconButton
              variant="ghost"
              size="sm"
              icon={XIcon}
              label={t.dismiss}
              onPress={onDismiss}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
