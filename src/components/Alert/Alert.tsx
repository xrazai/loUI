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
import styles from './Alert.module.css';
import { messages } from './Alert.messages';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'role'> {
  /** Kind of message: `info` (neutral, default), `success`, `warning` or `danger`. */
  tone?: AlertTone;
  /** Short heading of the alert, in one line: what happened. Plain text, not a document heading. */
  title?: ReactNode;
  /** The detail: why it happened and what to do. */
  children?: ReactNode;
  /** A single action next to the text, usually a link or a small `Button` ("Update card"). */
  action?: ReactNode;
  /** Shows a dismiss button that calls this. The alert is removed by the parent. */
  onDismiss?: () => void;
  /**
   * The message interrupts the user's task and must be announced immediately (`role="alert"`,
   * assertive). Use it only for failures the user must know about right now.
   */
  urgent?: boolean;
  /**
   * Whether the alert is a live region (`role="status"`, polite). Default `true`, because most
   * alerts appear after something the user did. Set `false` for a static notice that is part
   * of the page content from the start: it then has no role and is read in page order.
   * Ignored when `urgent`.
   */
  announce?: boolean;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

const ICONS: Record<AlertTone, IconComponent> = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
};

/**
 * An inline message with a tone, an icon, an optional title, an action and a dismiss button.
 * The icon is decorative and a visually hidden prefix names the tone for screen readers.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  urgent = false,
  announce = true,
  messages: overrides,
  className,
  ...rest
}: AlertProps) {
  const t = useMessages('Alert', messages, overrides);
  const role = urgent ? 'alert' : announce ? 'status' : undefined;
  const hasTitle = title !== undefined && title !== null && title !== false && title !== '';
  return (
    <div {...rest} role={role} className={classNames(styles.root, className)} data-tone={tone}>
      <Icon icon={ICONS[tone]} className={styles.icon} />
      <div className={styles.content}>
        <VisuallyHidden>{t[tone]} </VisuallyHidden>
        {hasTitle ? <div className={styles.title}>{title}</div> : null}
        {children ? <div className={styles.body}>{children}</div> : null}
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
