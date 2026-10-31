import type { ReactNode, Ref } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import type { ButtonProps as AriaButtonProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { Icon, PlusIcon } from '../Icon';
import styles from './SuggestionChip.module.css';

export interface SuggestionChipProps extends Omit<
  AriaButtonProps,
  'className' | 'style' | 'children' | 'isPending'
> {
  /**
   * The suggested text. The chip is named by it and, when pressed, the consumer inserts
   * exactly this text (or the text it stands for) into the field it belongs to.
   */
  children: ReactNode;
  className?: string;
  /** Ref to the underlying `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * A dashed chip that proposes a piece of text. Pressing it **inserts** that text into a
 * nearby field (for example a message composer); it never submits or navigates.
 *
 * The dashed border and the leading plus tell sighted users that it adds something. The plus
 * is decorative: screen readers hear the label, so word the label as the text itself and put
 * the chips in a labelled group ("Suggested replies") so the purpose is announced once.
 */
export function SuggestionChip({ children, className, ...rest }: SuggestionChipProps) {
  return (
    <AriaButton {...rest} className={classNames(styles.root, className)}>
      <Icon icon={PlusIcon} size="sm" className={styles.icon} />
      <span className={styles.label}>{children}</span>
    </AriaButton>
  );
}
